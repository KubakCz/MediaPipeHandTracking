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
  type: string;
  animationData: HandFrame[];
}

/**
 * Converts the HandLandmarkerResult data to a JSON string readable by Musical Instrument Capture blender add-on.
 * @param handData - HandLandmarkerResult data with timestamps.
 * @returns JSON string.
 */
export function handDataToJSON(
  handData: { timestamp: number; data: HandLandmarkerResult }[]
): string {
  // Normalize timestamps to start from 0
  let firstTimestamp = handData[0].timestamp;
  handData = handData.map((frame) => ({
    timestamp: frame.timestamp - firstTimestamp,
    data: frame.data,
  }));

  const transformedData: HandAnimationData[] = [
    { name: "Left", type: "Left", animationData: [] },
    { name: "Right", type: "Right", animationData: [] },
  ];

  // Convert each frame to a format readable by the blender add-on
  for (const frame of handData) {
    const data = frame.data;
    const timestamp = frame.timestamp / 1000000;
    for (let i = 0; i < data.handedness.length; i++) {
      const dataRef =
        data.handedness[i][0].categoryName === "Left" // Note: as MediaPipe works with mirror images, the true handedness is reversed
          ? transformedData[1].animationData
          : transformedData[0].animationData;
      if (dataRef.length > 0 && dataRef[dataRef.length - 1].timestamp >= timestamp) {
        // This may happen, when there is something wrong with the timestamps or if two hands of the same type are detected in the same frame
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

  // Return the JSON string
  return JSON.stringify(transformedData);
}
