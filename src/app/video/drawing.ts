import { HandLandmarkerResult } from "@mediapipe/tasks-vision";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { HAND_CONNECTIONS } from "@mediapipe/hands";

// Colors for drawing.
const baseColor = "#F01010";
const inverseColor = "#10F010";

const baseHeight = 480;

/**
 * Draw hands on the canvas.
 * @param result  HandLandmarkerResult to draw.
 * @param canvasCtx Canvas context to draw the result.
 */
export function drawHands(result: HandLandmarkerResult, canvasCtx: CanvasRenderingContext2D) {
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasCtx.canvas.width, canvasCtx.canvas.height);

  const scale = canvasCtx.canvas.height / baseHeight;

  for (let i = 0; i < result.handedness.length; i++) {
    const connectorColor =
      result.handedness[i][0].categoryName === "Right" ? baseColor : inverseColor;
    const landmarksColor =
      result.handedness[i][0].categoryName === "Right" ? inverseColor : baseColor;
    drawConnectors(canvasCtx, result.landmarks[i], HAND_CONNECTIONS, {
      color: connectorColor,
      lineWidth: 4 * scale,
    });
    drawLandmarks(canvasCtx, result.landmarks[i], {
      color: landmarksColor,
      fillColor: connectorColor,
      lineWidth: 4 * scale,
      radius: 6 * scale,
    });
  }
}
