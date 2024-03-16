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

interface HandAnimationData {
  name: string;
  animationData: HandFrame[];
}

export function handDataToJSON(
  handData: { timestamp: number; data: HandLandmarkerResult }[]
): string {
  let firstTimestamp = handData[0].timestamp;
  handData = handData.map((frame) => ({
    timestamp: frame.timestamp - firstTimestamp,
    data: frame.data,
  }));

  const transformedData: HandAnimationData[] = [
    { name: "Left", animationData: [] },
    { name: "Right", animationData: [] },
  ];

  for (const frame of handData) {
    const data = frame.data;
    const timestamp = frame.timestamp / 1000000;
    for (let i = 0; i < data.handedness.length; i++) {
      const dataRef =
        data.handedness[i][0].categoryName === "Left" // Note: as MediaPipe works with mirror images, the true handedness is reversed
          ? transformedData[1].animationData
          : transformedData[0].animationData;
      if (dataRef.length > 0 && dataRef[dataRef.length - 1].timestamp >= timestamp) {
        console.warn("Timestamps are not in order or are duplicated. Skipping frame.");
        continue;
      }

      const vsPositions = data.worldLandmarks[i].map((v) => ({ x: v.x, y: -v.y, z: v.z }));
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
