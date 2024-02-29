import { HandLandmarkerResult } from "@mediapipe/tasks-vision";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { HAND_CONNECTIONS } from "@mediapipe/hands";

const baseColor = "#FF0000";
const inverseColor = "#00FF00";

export function drawHands(result: HandLandmarkerResult, canvasCtx: CanvasRenderingContext2D) {
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasCtx.canvas.width, canvasCtx.canvas.height);

  for (let i = 0; i < result.handedness.length; i++) {
    const connectorColor =
      result.handedness[i][0].categoryName === "Right" ? baseColor : inverseColor;
    const landmarksColor =
      result.handedness[i][0].categoryName === "Right" ? inverseColor : baseColor;
    drawConnectors(canvasCtx, result.landmarks[i], HAND_CONNECTIONS, {
      color: connectorColor,
      lineWidth: 5,
    });
    drawLandmarks(canvasCtx, result.landmarks[i], {
      color: landmarksColor,
      fillColor: connectorColor,
      lineWidth: 4,
      radius: 6,
    });
  }
}
