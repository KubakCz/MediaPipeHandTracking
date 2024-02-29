/*
This script contains the webcam component.
This component handles:
- Show a message if no camera source is selected
- Create a hand landmarker
- Display the webcam feed
- Overlay the hand landmarks on the webcam feed
- Record the webcam feed
*/

import React from "react";
import { CSSProperties } from "react";
import { Box } from "@chakra-ui/react";
import { HandLandmarker, FilesetResolver, HandLandmarkerResult } from "@mediapipe/tasks-vision";
import { drawHands } from "./drawing";

interface VideoBoxProps {
  height?: CSSProperties["height"];
  width?: CSSProperties["width"];
  aspectRatio?: CSSProperties["aspectRatio"];
  children?: React.ReactNode;
}

// This component is used as a container for the webcam feed and hand landmarks
function VideoBox({ height = "480px", width, aspectRatio, children }: VideoBoxProps) {
  return (
    <Box
      h={height}
      w={width}
      aspectRatio={aspectRatio}
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

// This component is used to display a message when no camera source is selected
function NoWebcamSelected({ height = "480px" }: { height?: CSSProperties["height"] }) {
  return (
    <VideoBox height={height} aspectRatio={3 / 2}>
      No camera source selected
    </VideoBox>
  );
}

// This function creates a new hand landmarker
async function createHandLandmarker() {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
  );
  return await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
      delegate: "GPU",
    },
    runningMode: "VIDEO",
    numHands: 2,
  });
}

interface WebcamProps {
  device: MediaDeviceInfo | undefined;
  videoRef: React.RefObject<HTMLVideoElement>;
  height?: CSSProperties["height"];
}

export default function Webcam({ device, videoRef, height = "480px" }: WebcamProps) {
  const [handLandmarker, setHandLandmarker] = React.useState<HandLandmarker | undefined>();
  const [lastProcessTime, setLastProcessTime] = React.useState<number>(0);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  // Create hand landmarker on load
  React.useEffect(() => {
    console.log("Creating hand landmarker");
    createHandLandmarker()
      .then((handLandmarker) => {
        console.log("Hand landmarker created");
        setHandLandmarker(handLandmarker);
      })
      .catch((error) => {
        console.error("Error creating hand landmarker", error);
      });
  }, []);

  // Set video source to selected webcam
  React.useEffect(() => {
    if (!device) return;

    const constraints: MediaStreamConstraints = {
      video: {
        deviceId: device.deviceId,
      },
    };
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          const settings = stream.getVideoTracks()[0].getSettings();
          canvasRef.current!.width = settings.width!;
          canvasRef.current!.height = settings.height!;
        }
      })
      .catch((error) => {
        console.error("Error accessing the webcam", error);
      });
  }, [device, videoRef]);

  // Hand tracking loop
  const track = React.useCallback(
    (lastFrameTime: number = 0) => {
      if (!handLandmarker) return;

      if (videoRef.current && !videoRef.current.paused && canvasRef.current) {
        const start = performance.now();
        // Get landmarks
        const results = handLandmarker.detectForVideo(videoRef.current, performance.now());

        // Draw landmarks
        const canvasCtx = canvasRef.current.getContext("2d");
        if (!canvasCtx) {
          console.error("Canvas context not found");
          return;
        }
        drawHands(results, canvasCtx);
        const end = performance.now();
        setLastProcessTime(end - start);
      }

      requestAnimationFrame(track);
    },
    [handLandmarker, videoRef, canvasRef]
  );

  // Start hand tracking loop
  React.useEffect(() => {
    if (handLandmarker) {
      console.log("Starting hand tracking loop");
      track();
    }
  }, [handLandmarker, track]);

  if (device) {
    const width = videoRef.current?.videoWidth || 640;
    return (
      <VideoBox height={height} width={width}>
        <div style={{ position: "relative", width: "100%", height: "100%" }}>
          <video
            className="webcam"
            ref={videoRef}
            style={{ position: "absolute", left: "0px", top: "0px", height: height }}
            autoPlay={true}
            playsInline={true}
          ></video>
          <canvas
            className="output_canvas"
            ref={canvasRef}
            style={{
              position: "absolute",
              left: "0px",
              top: "0px",
              height: height,
              width: width,
            }}
          ></canvas>
          <p
            style={{ fontSize: "10pt", position: "absolute", left: "5px", top: "5px", zIndex: 10 }}
          >
            Last process time {lastProcessTime.toFixed(2)} ms
          </p>
        </div>
      </VideoBox>
    );
  } else {
    return NoWebcamSelected({ height });
  }
}
