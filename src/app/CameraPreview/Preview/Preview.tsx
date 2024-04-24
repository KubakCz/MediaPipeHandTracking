import { CSSProperties, useEffect } from "react";
import NoPreview from "./NoPreview";

/**
 * Props for the Preview component.
 */
interface PreviewProps {
  stream: MediaStream | null;
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
  aspectRatio?: number;
  height?: CSSProperties["height"];
}

/**
 * Component to display the camera preview and the hand tracking results.
 * @param stream - MediaStream to display.
 * @param canvasRef - Reference to the canvas element to draw the hand tracking results.
 * @param height - Height of the preview.
 * @returns Camera preview component.
 */
export default function Preview({
  stream,
  canvasRef,
  aspectRatio = 4 / 3,
  height = "480px",
}: PreviewProps) {
  // // Resize the canvas to match the preview size
  // if (canvasRef.current) {
  //   canvasRef.current.width = canvasRef.current.offsetWidth;
  //   canvasRef.current.height = canvasRef.current.offsetHeight;
  // }

  // It may take some time for the stream to be ready
  if (!stream) return <NoPreview height={height}>Waiting for the camera...</NoPreview>;

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
            height: height,
            aspectRatio: aspectRatio,
          }}
        ></canvas>
      </div>
    </div>
  );
}
