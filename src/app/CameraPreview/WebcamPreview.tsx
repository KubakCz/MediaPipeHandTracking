import { Box, Button } from "@chakra-ui/react";
import { CSSProperties, useState, useEffect, useRef, useCallback } from "react";
import { FileSystemWritableFileStreamTarget, Muxer } from "webm-muxer";
import { drawHands } from "./Drawing";
import { getEncoderConfig, getMuxerOptions } from "./VideoSettings";
import { handDataToJSON } from "./HandDataToJson";
import CameraSettings from "./CameraSettings/CameraSettings";
import { HandLandmarker } from "./HandLandmarker/HandLandmarker";
import NoPreview from "./Preview/NoPreview";
import Preview from "./Preview/Preview";
import RecordButton from "./RecordButton";
import { VideoProcessor } from "./VideoProcessing";
import { Resolution } from "./CameraSettings/Resolution";

interface WebcamPreviewProps {
  device: InputDeviceInfo | undefined;
  directoryHandle: FileSystemDirectoryHandle | undefined;
  height?: CSSProperties["height"];
}

export default function WebcamPreview({ device, directoryHandle, height }: WebcamPreviewProps) {
  // Video processing and recording
  const videoProcessorRef = useRef<VideoProcessor>(new VideoProcessor(handleFrameProcessed));
  const [videoTrack, setVideoTrack] = useState<MediaStreamTrack | null>(null); // Video track for camera settings
  const [recordingInProgress, setRecordingInProgress] = useState(false); // Recording state - true from startRecording to stopRecording
  const [processingInProgress, setProcessingInProgress] = useState(false); // Processing state - true while processing video
  const [resolution, setResolution] = useState(new Resolution(1280, 720));

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

  /**
   * Effect switching video stream based on the selected device.
   */
  useEffect(() => {
    console.log(device);
    if (videoProcessorRef.current.isRecording)
      throw new Error("Cannot switch camera while recording");

    // Stop old camera
    if (videoProcessorRef.current.isProcessing) {
      videoProcessorRef.current.stopProcessing();
      setVideoTrack(null);
    }

    if (!device) return;

    // Set new camera
    const deviceCapabilities = device.getCapabilities();
    const maxFps = deviceCapabilities.frameRate?.max || 30;
    const maxWidth = deviceCapabilities.width?.max || 1280;
    const maxHeight = deviceCapabilities.height?.max || 720;
    const constraints: MediaStreamConstraints = {
      video: {
        deviceId: device.deviceId,
        width: 1920 <= maxWidth ? 1920 : 1280, // Use 1080p if available, otherwise 720p
        height: 1080 <= maxHeight ? 1080 : 720,
        frameRate: maxFps, // Use the highest possible frame rate
      },
    };
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        // Set up video processor
        videoProcessorRef.current.startProcessing(stream);
        setVideoTrack(stream.getVideoTracks()[0]);
      })
      .catch((error) => {
        console.error("Error getting user media", error);
      });
  }, [device]);

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
    await videoProcessorRef.current.startRecording(
      directoryHandle!,
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
          const fileWriter = await fileHandle?.createWritable();
          await fileWriter?.write(handDataToJSON(hands));
          console.log("Video saved successfully");
        } catch (e) {
          console.error("Error saving hand data", e);
        } finally {
          if (fileWriter) await fileWriter.close();
        }
        vp.recordedChunks.length = 0;
      })
      .finally(() => {
        setProcessingInProgress(false); // Reset processing state
      });
  }

  return (
    <>
      <RecordButton
        isRecording={recordingInProgress}
        isDisabled={processingInProgress || !directoryHandle}
        onClick={handleRecord}
      />
      {device ? (
        <Preview
          stream={videoProcessorRef.current.stream}
          canvasRef={canvasRef}
          aspectRatio={resolution.width / resolution.height}
          height={height}
        />
      ) : (
        <NoPreview aspectRatio={resolution.width / resolution.height} height={height}>
          No camera selected
        </NoPreview>
      )}
      <CameraSettings
        videoTrack={videoTrack || null}
        handLandmarker={handLandmarkerRef.current!}
        onResolutionChange={setResolution}
      />
    </>
  );
}
