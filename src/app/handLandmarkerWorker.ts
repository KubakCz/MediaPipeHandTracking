import { FilesetResolver, HandLandmarker, HandLandmarkerResult } from "@mediapipe/tasks-vision";
import { get } from "http";
import { getDecoderConfig } from "./videoSettings";

let handLandmarker: HandLandmarker;
let lastTimeStamp: number = 0;
let numHands: number = 2;

onmessage = async (message: MessageEvent<{ type: string; data: any }>) => {
  if (message.data.type === "init") {
    handleInit()
      .then(() => {
        postMessage({ type: "init", data: "done" });
      })
      .catch((e) => {
        postMessage({ type: "init", data: "error", error: e });
      });
  } else if (message.data.type === "setNumHands") {
    if (typeof message.data.data !== "number") {
      console.error("Invalid data type", typeof message.data.data);
      return;
    }
    handleSetNumHands(message.data.data);
  } else if (message.data.type === "frame") {
    const videoFrame = message.data.data as VideoFrame;
    const result = handleFrame(videoFrame);
    videoFrame.close?.();
    postMessage({ type: "frame", data: result });
  } else if (message.data.type === "video") {
    const videoData = message.data.data as EncodedVideoChunk[];
    handleVideo(videoData).then((handData) => {
      if (handData) postMessage({ type: "video", data: handData });
      else postMessage({ type: "video", data: "error" });
    });
  } else {
    console.error("Unknown message type", message.data.type);
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
    numHands: numHands,
  });
}

function handleSetNumHands(newNumHands: number) {
  if (newNumHands != 1 && newNumHands != 2) {
    console.error("Invalid number of hands", newNumHands);
    return;
  }

  if (numHands != newNumHands && handLandmarker) {
    numHands = newNumHands;
    handLandmarker.setOptions({
      numHands: numHands,
    });
    // Should send response!
  }
}

function handleFrame(frame: VideoFrame) {
  // console.log("Handling frame", frame.timestamp, "Last timestamp", lastTimeStamp);
  if (frame.timestamp <= lastTimeStamp) {
    // Reset the handLandmarker to process video frames
    handLandmarker.setOptions({
      runningMode: "VIDEO",
      numHands: numHands,
    });
  }

  // Process the frame
  lastTimeStamp = frame.timestamp;
  return handLandmarker.detectForVideo(frame, frame.timestamp);
}

async function handleVideo(videoData: EncodedVideoChunk[]) {
  // Setup a decoder to decode the video chunks and process the frames
  const handData: { timestamp: number; data: HandLandmarkerResult }[] = [];
  const videoDecoder = new VideoDecoder({
    output: (frame) => {
      // console.log("Decoded frame", frame.timestamp);
      const result = handleFrame(frame);
      handData.push({ timestamp: frame.timestamp, data: result });
      frame.close();
    },
    error: (error: any) => {
      console.error("Video decoding failed: ", error);
      videoDecoder.close();
    },
  });
  const videoDecoderConfig = getDecoderConfig();
  const supported = await VideoDecoder.isConfigSupported(videoDecoderConfig);
  if (supported) {
    videoDecoder.configure(videoDecoderConfig);
  } else {
    console.error("Video decoder configuration not supported");
    return;
  }

  // Decode the video and wait for the result
  for (const chunk of videoData) {
    videoDecoder.decode(chunk);
  }
  await videoDecoder.flush();
  videoDecoder.close();

  return handData;
}
