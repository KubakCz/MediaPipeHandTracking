import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";

let handLandmarker: HandLandmarker;

onmessage = async (message: MessageEvent<{ type: string; data: any }>) => {
  if (message.data.type === "init") {
    handleInit()
      .then(() => {
        postMessage({ type: "init", data: "done" });
      })
      .catch((e) => {
        postMessage({ type: "init", data: "error", error: e });
      });
  } else if (message.data.type === "reset") {
    handLandmarker.setOptions({
      runningMode: "VIDEO",
    });
    postMessage({ type: "reset", data: "done" });
  } else if (message.data.type === "frame") {
    const videoFrame = message.data.data as VideoFrame;
    const result = handLandmarker.detectForVideo(videoFrame, videoFrame.timestamp);
    videoFrame.close?.();
    postMessage({ type: "frame", data: result });
  }
};

async function handleInit() {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
  );
  handLandmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
      delegate: "GPU",
    },
    runningMode: "VIDEO",
    numHands: 2,
  });
}
