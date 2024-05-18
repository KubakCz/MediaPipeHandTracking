// Worker script for asynchronous processing of video frames by HandLandmarker.

import { FilesetResolver, HandLandmarker, HandLandmarkerResult } from "@mediapipe/tasks-vision";
import { getDecoderConfig } from "../video/videoSettings";
import * as messages from "./handLandmarkerMessages";

let handLandmarker: HandLandmarker;
let lastTimestamp: number = 0; // Timestamp of the last processed frame
let numHands: number = 2; // Number of hands to track

/**
 * Handle incoming messages from the main thread.
 */
onmessage = (messageEvent: MessageEvent<messages.HandLandmarkerMessage>) => {
  const message = messageEvent.data;
  if (message.type === messages.MessageType.InitMessage) {
    handleInit().then((response) => {
      postMessage(response);
    });
  } else if (message.type === messages.MessageType.SetNumHandsMessage) {
    handleSetNumHands((message as messages.SetNumHands).numHands).then((response) => {
      postMessage(response);
    });
  } else if (message.type === messages.MessageType.FrameMessage) {
    const videoFrame = (message as messages.FrameMessage).videoFrame;
    handleFrame(videoFrame).then((response) => {
      videoFrame.close?.();
      postMessage(response);
    });
  } else if (message.type === messages.MessageType.VideoMessage) {
    const videoData = (message as messages.VideoMessage).videoData;
    handleVideo(videoData).then((response) => {
      postMessage(response);
    });
  } else {
    postMessage(new messages.HandLandmarkerResponse(messages.Result.UnknownOperation));
  }
};

/**
 * Handle the initialization of the HandLandmarker.
 * @returns A promise that resolves when the HandLandmarker is initialized.
 */
async function handleInit(): Promise<messages.InitResponse> {
  if (handLandmarker)
    return new messages.InitResponse(
      messages.Result.InvalidOperation,
      "HandLandmarker already initialized."
    );

  try {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
    );
    handLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task`,
        delegate: "GPU",
      },
      runningMode: "VIDEO",
      numHands: numHands,
    });
  } catch (e) {
    return new messages.InitResponse(
      messages.Result.InternalError,
      "Failed to initialize HandLandmarker.",
      e
    );
  }

  return new messages.InitResponse(messages.Result.Ok, "HandLandmarker initialized.");
}

/**
 * Handle setting the number of hands the HandLandmarker should track.
 * @param newNumHands - The number of hands to track.
 * @returns A promise that resolves with the result of the operation.
 */
async function handleSetNumHands(newNumHands: number): Promise<messages.SetNumHandsResponse> {
  if (newNumHands != 1 && newNumHands != 2) {
    return new messages.SetNumHandsResponse(
      messages.Result.InvalidData,
      "Number of hands must be 1 or 2."
    );
  }
  if (!handLandmarker) {
    return new messages.SetNumHandsResponse(
      messages.Result.InvalidOperation,
      "HandLandmarker not initialized."
    );
  }

  if (numHands != newNumHands) {
    numHands = newNumHands;
    await resetHandLandmarker(); // Apply the new number of hands
    return new messages.SetNumHandsResponse(
      messages.Result.Ok,
      `Number of hands set to ${numHands}.`
    );
  } else {
    return new messages.SetNumHandsResponse(
      messages.Result.Ok,
      `Number of hands already set to ${numHands}.`
    );
  }
}

/**
 * Handle and process a video frame.
 * @param frame - The video frame to process.
 * @returns A promise that resolves with the result of the operation.
 */
async function handleFrame(frame: VideoFrame): Promise<messages.FrameResponse> {
  if (!handLandmarker) {
    return new messages.FrameResponse(
      messages.Result.InvalidOperation,
      undefined,
      "HandLandmarker not initialized."
    );
  }

  // Reset the HandLandmarker if the frame is out of order
  if (frame.timestamp <= lastTimestamp) {
    await resetHandLandmarker();
  }

  // Process the frame
  lastTimestamp = frame.timestamp;
  const result = handLandmarker.detectForVideo(frame, frame.timestamp);
  return new messages.FrameResponse(messages.Result.Ok, result);
}

/**
 * Handle and process a video.
 * @param videoData - The video data to process.
 * @returns A promise that resolves with the result of the operation.
 */
async function handleVideo(videoData: EncodedVideoChunk[]): Promise<messages.VideoResponse> {
  if (!handLandmarker) {
    return new messages.VideoResponse(
      messages.Result.InvalidOperation,
      undefined,
      "HandLandmarker not initialized."
    );
  }

  // Reset the HandLandmarker so the first frame is processed correctly
  await resetHandLandmarker();

  // Setup a decoder to decode the video chunks and process the frames
  const handData: { timestamp: number; data: HandLandmarkerResult }[] = [];
  const videoDecoder = new VideoDecoder({
    output: (frame) => {
      lastTimestamp = frame.timestamp;
      const result = handLandmarker.detectForVideo(frame, frame.timestamp);
      handData.push({ timestamp: frame.timestamp, data: result });
      frame.close();
    },
    error: (error: any) => {
      videoDecoder.close();
      return new messages.VideoResponse(
        messages.Result.InternalError,
        undefined,
        "Video decoding failed.",
        error
      );
    },
  });
  const videoDecoderConfig = getDecoderConfig();
  const supported = await VideoDecoder.isConfigSupported(videoDecoderConfig);
  if (supported) {
    videoDecoder.configure(videoDecoderConfig);
  } else {
    return new messages.VideoResponse(
      messages.Result.InternalError,
      undefined,
      "Video decoder configuration not supported."
    );
  }

  // Decode the video and wait for the result
  for (const chunk of videoData) {
    videoDecoder.decode(chunk);
  }
  await videoDecoder.flush();
  videoDecoder.close();

  return new messages.VideoResponse(messages.Result.Ok, handData);
}

/**
 * Reset the HandLandmarker with the current number of hands.
 * @returns A promise that resolves when the HandLandmarker is reset.
 */
async function resetHandLandmarker() {
  return handLandmarker.setOptions({
    runningMode: "VIDEO",
    numHands: numHands,
  });
}
