import { CSSProperties, useState, useEffect, useRef, useCallback } from "react";
import { drawHands } from "./Drawing";
import { handDataToJSON } from "./HandDataToJson";
import { HandLandmarker } from "./HandLandmarker/HandLandmarker";
import NoPreview from "./Preview/NoPreview";
import Preview from "./Preview/Preview";
import { VideoProcessor } from "./VideoProcessing";
import * as requests from "../requests/requests";
import { useToast } from "@chakra-ui/react";
import { dateTimeString } from "../utils/dateTimeFormat";

interface WebcamPreviewProps {
  videoStream: MediaStream | null | undefined;
  directoryHandle: FileSystemDirectoryHandle | undefined;
  isRecording: boolean;
}

export default function WebcamPreview({
  videoStream,
  directoryHandle,
  isRecording,
}: WebcamPreviewProps) {
  // Video processing and recording
  const videoProcessorRef = useRef<VideoProcessor>(new VideoProcessor(handleFrameProcessed));
  const [recordingInProgress, setRecordingInProgress] = useState(false); // Recording state - true from startRecording to stopRecording
  const [processingInProgress, setProcessingInProgress] = useState(false); // Processing state - true while processing video
  const [recordingOnServer, setRecordingOnServer] = useState<boolean>();

  // Hand visualization
  const handLandmarkerRef = useRef<HandLandmarker>();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const toast = useToast();

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

  /**
   * Effect for updating the video stream in the video processor.
   */
  useEffect(() => {
    // Stop video processor
    if (videoProcessorRef.current.isProcessing) {
      videoProcessorRef.current.stopProcessing();
    }

    if (!videoStream) return;

    // Set up video processor
    videoProcessorRef.current.startProcessing(videoStream.getTracks()[0]);
  }, [videoStream]);

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
   * Starts video recording.
   */
  const startRecording = useCallback(async () => {
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
  }, [directoryHandle, recordingInProgress, toast]);

  /**
   * Stops video recording and saves the result.
   * Processes the recorded video with HandLandmarker and saves the hand data.
   */
  const stopRecording = useCallback(async () => {
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
  }, [directoryHandle, recordingInProgress, recordingOnServer, toast]);

  /**
   * Effect for starting or stopping recording based on the recording state.
   */
  useEffect(() => {
    if (isRecording && !recordingInProgress) {
      startRecording();
    } else if (!isRecording && recordingInProgress) {
      stopRecording();
    }
  }, [isRecording, recordingInProgress, startRecording, stopRecording]);

  return (
    <>
      {videoStream === undefined ? (
        <NoPreview>No camera selected</NoPreview>
      ) : (
        <Preview stream={videoStream} canvasRef={canvasRef} />
      )}
    </>
  );
}
