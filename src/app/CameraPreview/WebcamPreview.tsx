import { CSSProperties, useState, useEffect, useRef, useCallback } from "react";
import { drawHands } from "./Drawing";
import { handDataToJSON } from "./HandDataToJson";
import CameraSettings from "../RightMenu/CameraSettings";
import { HandLandmarker } from "./HandLandmarker/HandLandmarker";
import NoPreview from "./Preview/NoPreview";
import Preview from "./Preview/Preview";
import RecordButton from "../BottomMenu/RecordButton";
import { VideoProcessor } from "./VideoProcessing";
import { Resolution } from "../utils/resolution";
import * as requests from "../requests/requests";
import { useToast } from "@chakra-ui/react";
import { dateTimeString } from "../utils/dateTimeFormat";

interface WebcamPreviewProps {
  videoTrack: MediaStreamTrack | null | undefined;
  directoryHandle: FileSystemDirectoryHandle | undefined;
  resolution: Resolution;
  height?: CSSProperties["height"];
}

export default function WebcamPreview({
  videoTrack,
  directoryHandle,
  resolution,
  height,
}: WebcamPreviewProps) {
  // Video processing and recording
  const videoProcessorRef = useRef<VideoProcessor>(new VideoProcessor(handleFrameProcessed));
  const [recordingInProgress, setRecordingInProgress] = useState(false); // Recording state - true from startRecording to stopRecording
  const [processingInProgress, setProcessingInProgress] = useState(false); // Processing state - true while processing video
  const [recordingOnServer, setRecordingOnServer] = useState<boolean>();

  // Hand visualization
  const handLandmarkerRef = useRef<HandLandmarker>();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  /**
   * Effect for initializing HandLandmarker
   */
  useEffect(() => {
    console.log("Initializing HandLandmarker");
    // Initialize handLandmarker
    handLandmarkerRef.current = new HandLandmarker(
      new Worker(new URL("HandLandmarker/HandLandmarkerWorker.ts", import.meta.url))
    );
    handLandmarkerRef.current
      .init()
      .then(() => {
        console.log("HandLandmarker initialized");
      })
      .catch((error) => {
        console.error("Error initializing HandLandmarker", error);
        window.alert(
          "Error initializing HandLandmarker. Please reload the page. You can find more information in the console."
        );
      });
  }, []);

  // /**
  //  * Effect switching video stream based on the selected device.
  //  */
  // useEffect(() => {
  //   console.log(device);
  //   if (videoProcessorRef.current.isRecording)
  //     throw new Error("Cannot switch camera while recording");

  //   // Stop old camera
  //   if (videoProcessorRef.current.isProcessing) {
  //     videoProcessorRef.current.stopProcessing();
  //     setVideoTrack(null);
  //   }

  //   if (!device) return;

  //   // Set new camera
  //   const deviceCapabilities = device.getCapabilities();
  //   const maxFps = deviceCapabilities.frameRate?.max || 30;
  //   const maxWidth = deviceCapabilities.width?.max || 1280;
  //   const maxHeight = deviceCapabilities.height?.max || 720;
  //   const constraints: MediaStreamConstraints = {
  //     video: {
  //       deviceId: device.deviceId,
  //       width: 1920 <= maxWidth ? 1920 : 1280, // Use 1080p if available, otherwise 720p
  //       height: 1080 <= maxHeight ? 1080 : 720,
  //       frameRate: maxFps, // Use the highest possible frame rate
  //     },
  //   };
  //   navigator.mediaDevices
  //     .getUserMedia(constraints)
  //     .then((stream) => {
  //       // Set up video processor
  //       videoProcessorRef.current.startProcessing(stream);
  //       setVideoTrack(stream.getVideoTracks()[0]);
  //     })
  //     .catch((error) => {
  //       console.error("Error getting user media", error);
  //     });
  // }, [device]);

  /**
   * Callback to process video frame with HandLandmarker.
   */
  function handleFrameProcessed(frame: VideoFrame) {
    // Process the frame with HandLandmarker and draw the results
    if (
      handLandmarkerRef.current &&
      handLandmarkerRef.current.initialized &&
      !handLandmarkerRef.current.processingFrame && // Only start processing if the previous frame is done
      !handLandmarkerRef.current.processingVideo // Only start processing if no video is being processed
    ) {
      handLandmarkerRef.current.processFrame(frame).then((hands) => {
        if (canvasRef.current) drawHands(hands, canvasRef.current.getContext("2d")!);
      });
    }
  }

  /**
   * Handle record button click
   * Start or stop recording video depending on the current state.
   */
  function handleRecord() {
    if (videoProcessorRef.current.isRecording) stopRecording();
    else startRecording();
  }

  /**
   * Starts video recording.
   */
  async function startRecording() {
    if (recordingInProgress) throw new Error("Recording already in progress");
    if (!directoryHandle) throw new Error("No directory selected");

    // Check recording status of the server
    let connectionSettings = await requests.getConnectionSettings();
    if (connectionSettings) {
      // Connected to a server
      const recordingStatus = await requests.isRecording();
      if (recordingStatus === undefined) {
        // Server connected, but failed to get recording status
        toast({
          title: "Failed to get recording status",
          description:
            "Failed to get recording status from the connected server. Recoring will start only on the client side.",
          status: "warning",
          duration: 10000,
          isClosable: true,
        });
        connectionSettings = null;
      } else if (recordingStatus === true) {
        // Recording already in progress on the server
        toast({
          title: "Recording already in progress",
          description:
            "Recording is already in progress on the server. Please stop the recording on the server first.",
          status: "error",
          duration: 10000,
          isClosable: true,
        });
        return;
      } else {
        // Else recording status is synced with the server => start recording on the server
        requests
          .setRecording(true)
          .then((response) => {
            setRecordingOnServer(true);
          })
          .catch((error) => {
            const message = error.response?.data || error.message;
            toast({
              title: "Failed to start recording",
              description: `Failed to start recording on the server: ${message}`,
              status: "error",
              duration: 10000,
              isClosable: true,
            });
          });
      }
    }

    await videoProcessorRef.current.startRecording(
      directoryHandle,
      undefined, // TODO: Add file name input (optional)
      (e) => console.error(e)
    );

    setRecordingInProgress(true);
  }

  /**
   * Stops video recording and saves the result.
   * Processes the recorded video with HandLandmarker and saves the hand data.
   */
  async function stopRecording() {
    if (!recordingInProgress) throw new Error("Recording not in progress");

    // Stop recording on the server
    if (recordingOnServer) {
      setRecordingOnServer(false);
      requests.setRecording(false).catch((error) => {
        const message = error.response?.data || error.message;
        toast({
          title: "Failed to stop recording",
          description: `Failed to stop recording on the server: ${message}`,
          status: "error",
          duration: 10000,
          isClosable: true,
        });
      });
    }

    // Stop recoring
    const vp = videoProcessorRef.current;
    await vp.stopRecording();
    console.log(
      "Recording stopped, avg fps:",
      (vp.frameCount / (Date.now() - vp.recordingStartTime)) * 1000
    );

    setRecordingInProgress(false); // Reset recording state
    setProcessingInProgress(true); // Set processing state

    // Process the recorded video and save the result
    handLandmarkerRef
      .current!.processVideo(vp.recordedChunks)
      .then(async (hands) => {
        // Save hand data
        let fileWriter: FileSystemWritableFileStream | undefined;
        try {
          console.log("Saving hand data");
          const fileHandle = await directoryHandle?.getFileHandle(
            `handData_${dateTimeString(new Date(vp.recordingStartTime))}.json`, // TODO: Add file name input (optional)
            {
              create: true,
            }
          );
          fileWriter = await fileHandle?.createWritable();
          await fileWriter?.write(handDataToJSON(hands));
        } catch (e) {
          console.error("Error saving hand data", e);
        } finally {
          if (fileWriter) await fileWriter.close();
          console.log("Video saved successfully");
        }
        vp.recordedChunks.length = 0;
      })
      .finally(() => {
        setProcessingInProgress(false); // Reset processing state
      });
  }

  const toast = useToast();

  return (
    <>
      {/* <RecordButton
        isRecording={recordingInProgress}
        isDisabled={processingInProgress || !directoryHandle}
        onClick={handleRecord}
      /> */}
      {videoTrack === undefined ? (
        <NoPreview aspectRatio={resolution.width / resolution.height} height={height}>
          No camera selected
        </NoPreview>
      ) : (
        <Preview
          stream={videoProcessorRef.current.stream}
          canvasRef={canvasRef}
          aspectRatio={resolution.width / resolution.height}
          height={height}
        />
      )}
    </>
  );
}
