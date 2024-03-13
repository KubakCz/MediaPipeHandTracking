import { HandLandmarkerResult } from "@mediapipe/tasks-vision";

interface Vector3 {
  x: number;
  y: number;
  z: number;
}

interface HandFrame {
  timestamp: number;
  normalizedPositions: Vector3[];
  worldPositions: Vector3[];
}

interface TransformedData {
  Left: HandFrame[];
  Right: HandFrame[];
}

export function handDataToJSON(
  handData: { timestamp: number; data: HandLandmarkerResult }[]
): string {
  let firstTimestamp = handData[0].timestamp;
  handData = handData.map((frame) => ({
    timestamp: frame.timestamp - firstTimestamp,
    data: frame.data,
  }));

  const transformedData: TransformedData = { Left: [], Right: [] };

  for (const frame of handData) {
    const data = frame.data;
    const timestamp = frame.timestamp / 1000000;
    for (let i = 0; i < data.handedness.length; i++) {
      const dataRef =
        data.handedness[i][0].categoryName === "Left"
          ? transformedData.Right
          : transformedData.Left;
      if (dataRef.length > 0 && dataRef[dataRef.length - 1].timestamp >= timestamp) {
        console.warn("Timestamps are not in order or are duplicated. Skipping frame.");
        continue;
      }

      const handData: HandFrame = {
        timestamp,
        normalizedPositions: data.landmarks[i],
        worldPositions: data.worldLandmarks[i],
      };
      dataRef.push(handData);
    }
  }

  return JSON.stringify(transformedData);
}
