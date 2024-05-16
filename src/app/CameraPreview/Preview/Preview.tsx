import { CSSProperties, useEffect } from "react";
import NoPreview from "./NoPreview";

/**
 * Props for the Preview component.
 */
interface PreviewProps {
  stream: MediaStream | null;
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
}

/**
 * Component to display the camera preview and the hand tracking results.
 * @param stream - MediaStream to display.
 * @param canvasRef - Reference to the canvas element to draw the hand tracking results.
 * @param height - Height of the preview.
 * @returns Camera preview component.
 */
export default function Preview({ stream, canvasRef }: PreviewProps) {
  // It may take some time for the stream to be ready
  if (!stream) return <NoPreview>Waiting for the camera...</NoPreview>;

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
        ></canvas>
      </div>
    </div>
  );
}
