import NoPreview from "./NoPreview";
import { Box } from "@chakra-ui/react";
import VideoText from "./VideoText";

interface PreviewProps {
  /**
   * MediaStream to display.
   */
  stream: MediaStream | null;
  /**
   * Reference to the canvas element to draw the hand tracking results.
   */
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
  /**
   * Children to display over the preview.
   */
  children?: React.ReactNode;
  /**
   * Color to overlay on top of the preview.
   * Transparent by default.
   */
  overlayColor?: string;
}

/**
 * Component to display the camera preview and the hand tracking results.
 */
export default function Preview({ stream, canvasRef, children, overlayColor }: PreviewProps) {
  // It may take some time for the stream to be ready
  if (!stream)
    return (
      <NoPreview>
        <VideoText text={"Waiting for the camera"} spinner={true} />
      </NoPreview>
    );

  const videoTrack = stream.getVideoTracks()[0];
  const settings = videoTrack.getSettings();
  const aspectRatio = settings.aspectRatio || 16 / 9;

  return (
    <div style={{ aspectRatio: aspectRatio, height: "480px" /* width: "100%" */ }}>
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        <video
          autoPlay
          playsInline
          muted
          style={{
            position: "absolute",
            left: "0px",
            top: "0px",
            aspectRatio: aspectRatio,
            height: "100%",
          }}
          ref={(video) => {
            if (video) {
              video.srcObject = stream;
            }
          }}
        />
        <canvas
          className="output_canvas"
          ref={(canvas) => {
            if (canvas) {
              // Set the canvas resolution to match the real size on the screen
              const boundingRect = canvas.getBoundingClientRect();
              canvas.width = boundingRect.width;
              canvas.height = boundingRect.height;

              canvasRef.current = canvas;
            }
          }}
          style={{
            position: "absolute",
            left: "0px",
            top: "0px",
            aspectRatio: aspectRatio,
            height: "100%",
          }}
        />
        <Box
          position="absolute"
          left="0px"
          top="0px"
          h="100%"
          w="100%"
          bg={overlayColor || "transparent"}
          zIndex={1000}
        >
          {children}
        </Box>
      </div>
    </div>
  );
}
