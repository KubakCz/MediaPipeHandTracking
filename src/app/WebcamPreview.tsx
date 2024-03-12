import { Box, Button } from "@chakra-ui/react";
import { CSSProperties, useState, useEffect, useRef, useCallback } from "react";
import { FileSystemWritableFileStreamTarget, Muxer } from "webm-muxer";
import { drawHands } from "./drawing";
import { getEncoderConfig, getMuxerOptions } from "./videoSettings";
import { handDataToJSON } from "./handDataToJson";

// #region Helper components
function EmptyBox({
  height = "480px",
  children,
}: {
  height?: CSSProperties["height"];
  children?: React.ReactNode;
}) {
  return (
    <Box
      h={height}
      aspectRatio={4 / 3}
      display="flex"
      alignItems="center"
      justifyContent="center"
      fontWeight="semibold"
      fontSize="lg"
      bg="gray.100"
      borderWidth="1px"
      borderRadius="lg"
      m="16px"
    >
      {children}
    </Box>
  );
}

function CameraPreview({
  stream,
  canvasRef,
  height = "480px",
}: {
  stream: MediaStream | undefined;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  height?: CSSProperties["height"];
}) {
  useEffect(() => {
    if (!stream || !canvasRef?.current) return;

    const videoTrack = stream.getVideoTracks()[0];
    const settings = videoTrack.getSettings();
    canvasRef.current.width = settings.width!;
    canvasRef.current.height = settings.height!;
  }, [stream, canvasRef]);

  // It may take some time for the stream to be ready
  if (!stream) return <EmptyBox height={height}>Waiting for camera...</EmptyBox>;

  const aspectRatio = stream.getVideoTracks()[0].getSettings().aspectRatio;
  return (
    <div style={{ height: height, aspectRatio: aspectRatio, margin: "16px" }}>
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        <video
          autoPlay
          playsInline
          muted
          style={{
            position: "absolute",
            left: "0px",
            top: "0px",
            height: height,
            aspectRatio: aspectRatio,
          }}
          ref={(video) => {
            if (video) {
              video.srcObject = stream;
            }
          }}
        />
        <canvas
          className="output_canvas"
          ref={canvasRef}
          style={{
            position: "absolute",
            left: "0px",
            top: "0px",
            height: height,
            aspectRatio: aspectRatio,
          }}
        ></canvas>
      </div>
    </div>
  );
}

function RecordButton({ isRecording, onClick }: { isRecording: boolean; onClick: () => void }) {
  return (
    <Button onClick={onClick} colorScheme={"red"} m="16px">
      {isRecording ? "Stop" : "Record"}
    </Button>
  );
}
// #endregion Helper components

interface WebcamPreviewProps {
  device: InputDeviceInfo | undefined;
  directoryHandle: FileSystemDirectoryHandle | undefined;
  height?: CSSProperties["height"];
}

export default function WebcamPreview({ device, directoryHandle, height }: WebcamPreviewProps) {
  // Video processing
  const [stream, setStream] = useState<MediaStream>();
  const streamRef = useRef<MediaStream>();
  const frameReaderRef = useRef<ReadableStreamDefaultReader<VideoFrame>>();
  const recordedChunksRef = useRef<EncodedVideoChunk[]>([]);

  // Hand visualization
  const handLandmarkerWorkerRef = useRef<Worker>();
  const handLandmarkerReadyRef = useRef<boolean>(false);
  const handLandmarkerWorkingRef = useRef<boolean>(false);
  const handLandmarkerVideoProcessingRef = useRef<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Recording
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const videoFileWritableStreamRef = useRef<FileSystemWritableFileStream>();
  const muxerRef = useRef<Muxer<FileSystemWritableFileStreamTarget>>();
  const videoEncoderRef = useRef<VideoEncoder>();
  const frameCountRef = useRef<number>(0);
  const recordingStartTimeRef = useRef<number>(0);

  // #region Video processing
  const frameReaderLoop = useCallback(async (reader: ReadableStreamDefaultReader<VideoFrame>) => {
    while (true) {
      const result = await reader.read();
      if (result.done) {
        break;
      }

      await processFrame(result.value);
      frameCountRef.current++;
      result.value.close();
    }
  }, []);

  const processFrame = async (frame: VideoFrame) => {
    if (videoEncoderRef.current) {
      // Recording in progress
      if (videoEncoderRef.current.encodeQueueSize <= 10) {
        const insertKeyFrame = frameCountRef.current % 150 === 0;
        videoEncoderRef.current.encode(frame, { keyFrame: insertKeyFrame });
      } else {
        console.warn("Dropping frame, encoder falling behind");
      }
    }

    // HandLandmarker processing
    if (
      handLandmarkerReadyRef.current &&
      !handLandmarkerWorkingRef.current &&
      !handLandmarkerVideoProcessingRef.current
    ) {
      handLandmarkerWorkingRef.current = true;
      handLandmarkerWorkerRef.current?.postMessage({ type: "frame", data: frame });
    }
  };

  // Handle messages from handLandmarkerWorker
  const onmessage = useCallback(
    async (event: MessageEvent<{ type: string; data: any; error?: any }>) => {
      if (event.data.type === "init") {
        // HandLandmarker init result
        if (event.data.data === "done") {
          handLandmarkerReadyRef.current = true;
        } else {
          console.error("HandLandmarker init failed", event.data.error);
        }
      } else if (event.data.type === "frame") {
        // HandLandmarker frame result
        handLandmarkerWorkingRef.current = false;
        drawHands(event.data.data, canvasRef.current!.getContext("2d")!);
      } else if (event.data.type === "video") {
        // HandLandmarker video result
        handLandmarkerVideoProcessingRef.current = false;
        try {
          console.log("Saving hand data");
          const fileHandle = await directoryHandle?.getFileHandle(`handData_${Date.now()}.json`, {
            create: true,
          });
          const fileWriter = await fileHandle?.createWritable();
          await fileWriter?.write(handDataToJSON(event.data.data));
          await fileWriter?.close();
          console.log("Video processed");
        } catch (e) {
          console.error("Error saving hand data", e);
        }
      } else {
        console.error("Unknown message type", event.data.type);
      }
    },
    [directoryHandle]
  );
  // #endregion Video processing

  // #region Recording
  const recordingCleanup = async () => {
    // Stop video encoder
    if (videoEncoderRef.current) {
      const videoEncoder = videoEncoderRef.current;
      videoEncoderRef.current = undefined; // Clear reference => stop processFrame from writing to encoder
      await videoEncoder.flush();
      await videoEncoder.close();
    }
    // Stop muxer
    if (muxerRef.current) {
      await muxerRef.current.finalize();
      muxerRef.current = undefined;
    }
    // Close file
    if (videoFileWritableStreamRef.current) {
      await videoFileWritableStreamRef.current.close();
      videoFileWritableStreamRef.current = undefined;
    }
  };

  const stopRecording = useCallback(async () => {
    if (!isRecording) throw new Error("No recording in progress");

    console.log(
      "Stopping recording, avg fps:",
      (frameCountRef.current / (Date.now() - recordingStartTimeRef.current)) * 1000
    );

    await recordingCleanup();

    setIsRecording(false);
    console.log("Recording stopped");

    // Process the recorded video and save the result
    handLandmarkerVideoProcessingRef.current = true;
    handLandmarkerWorkerRef.current?.postMessage({
      type: "video",
      data: recordedChunksRef.current,
    });
    recordedChunksRef.current = [];
  }, [isRecording]);

  const startRecording = useCallback(async () => {
    if (isRecording) throw new Error("Recording already in progress");
    if (!streamRef.current) throw new Error("No stream to record");
    if (!directoryHandle) throw new Error("No directory to save recording");
    if (handLandmarkerVideoProcessingRef.current)
      throw new Error("HandLandmarker processing video");

    const track = streamRef.current.getVideoTracks()[0];
    const trackSettings = track.getSettings();

    // Create destination file and muxer
    const videoFileHandle = await directoryHandle.getFileHandle(`recording_${Date.now()}.webm`, {
      create: true,
    });
    videoFileWritableStreamRef.current = await videoFileHandle.createWritable();
    muxerRef.current = new Muxer(
      getMuxerOptions(videoFileWritableStreamRef.current!, trackSettings)
    );

    // Create video encoder
    videoEncoderRef.current = new VideoEncoder({
      output: (chunk: EncodedVideoChunk, metadata?: EncodedVideoChunkMetadata) => {
        muxerRef.current!.addVideoChunk(chunk, metadata);
        recordedChunksRef.current.push(chunk);
      },
      error: (e: DOMException) => {
        console.log(e.message);
        stopRecording();
      },
    });
    const videoEncoderConfig = getEncoderConfig(trackSettings);
    const supported = await VideoEncoder.isConfigSupported(videoEncoderConfig);
    if (supported) {
      videoEncoderRef.current.configure(videoEncoderConfig);
    } else {
      recordingCleanup();
      throw new Error("Video encoder configuration not supported");
    }

    // Reset variables
    setIsRecording(true);
    frameCountRef.current = 0;
    recordingStartTimeRef.current = Date.now();
  }, [directoryHandle, isRecording, stopRecording]);

  const handleRecord = useCallback(() => {
    if (isRecording) stopRecording();
    else startRecording();
  }, [isRecording, stopRecording, startRecording]);
  // #endregion Recording

  // Initialize
  useEffect(() => {
    if (!handLandmarkerWorkerRef.current) {
      handLandmarkerWorkerRef.current = new Worker(
        new URL("handLandmarkerWorker.ts", import.meta.url)
      );
      handLandmarkerWorkerRef.current.onmessage = onmessage;
      handLandmarkerWorkerRef.current.postMessage({ type: "init" });
      console.log("HandLandmarker worker created");
    } else {
      handLandmarkerWorkerRef.current.onmessage = onmessage;
    }
  }, [onmessage]);

  // Handle device change
  useEffect(() => {
    console.log("Device changed", device);

    // Stop old camera
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = undefined;
    }
    if (frameReaderRef.current) {
      frameReaderRef.current.cancel();
      frameReaderRef.current = undefined;
    }

    if (!device) return;

    // Set new camera
    const deviceCapabilities = device.getCapabilities();
    // TODO: Generate constraints based on settings
    const constraints: MediaStreamConstraints = {
      video: {
        deviceId: device.deviceId,
        // width: deviceCapabilities.width?.max,
        width: 1280,
        // width: 1920,
        // height: deviceCapabilities.height?.max,
        height: 720,
        // height: 1080,
        // frameRate: deviceCapabilities.frameRate?.max,
        frameRate: 60,
        // frameRate: 30,
      },
    };
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        // Set the stream
        streamRef.current = stream;
        setStream(stream);

        const videoTrack = stream.getVideoTracks()[0];
        console.log("Video track settings", videoTrack.getSettings());

        // Set the frame reader and start processing
        const trackProcessor = new MediaStreamTrackProcessor({ track: videoTrack });
        const reader = trackProcessor.readable.getReader();
        frameReaderRef.current = reader;
        frameReaderLoop(reader);
      })
      .catch((error) => {
        console.error("Error getting user media", error);
      });
  }, [device, frameReaderLoop]);

  if (!device) return <EmptyBox height={height}>No camera selected</EmptyBox>;

  return (
    <>
      <RecordButton isRecording={isRecording} onClick={handleRecord} />
      <CameraPreview stream={streamRef.current} canvasRef={canvasRef} height={height} />
    </>
  );
}
