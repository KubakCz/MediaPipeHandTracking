import { HandLandmarkerResult } from "@mediapipe/tasks-vision";
import * as messages from "./HandLandmarkerMessages";

/**
 * Class wrapping the HandLandmarker worker.
 * This class handles communication with the HandLandmarker worker
 * and provides a simple API for processing video frames.
 */
export class HandLandmarker {
  private readonly worker: Worker;
  private workerInitialized: boolean;
  private workerProcessingFrame: boolean;
  private workerProcessingVideo: boolean;
  private workerSettingNumHands: boolean;

  /**
   * Whether the HandLandmarker worker has been initialized.
   */
  public get initialized(): boolean {
    return this.workerInitialized;
  }

  /**
   * Whether the HandLandmarker worker is currently processing a frame.
   */
  public get processingFrame(): boolean {
    return this.workerProcessingFrame;
  }

  /**
   * Whether the HandLandmarker worker is currently processing a video.
   */
  public get processingVideo(): boolean {
    return this.workerProcessingVideo;
  }

  /**
   * Whether the HandLandmarker worker is currently setting the number of hands.
   */
  public get settingNumHands(): boolean {
    return this.workerSettingNumHands;
  }

  constructor(worker: Worker) {
    this.worker = worker;
    this.workerInitialized = false;
    this.workerProcessingFrame = false;
    this.workerProcessingVideo = false;
    this.workerSettingNumHands = false;
  }

  /**
   * Sends a message to the worker and returns a Promise that resolves with the worker's response.
   * @param message - The message to send to the worker.
   * @param responseType - The type of the expected response message. This is used to filter out unwanted messages.
   * @returns A Promise that resolves with the worker's response.
   */
  sendMessage(
    message: messages.HandLandmarkerMessage,
    responseType: messages.MessageType
  ): Promise<messages.HandLandmarkerResponse> {
    return new Promise((resolve, reject) => {
      // Set up a one-time event listener for the 'message' event.
      const listener = (event: MessageEvent<messages.HandLandmarkerResponse>) => {
        if (!(event.data.type === responseType)) {
          return; // Ignore messages that are not of the expected type.
        }

        // Remove the event listener once we've received the response.
        this.worker.removeEventListener("message", listener);

        // Resolve
        resolve(event.data);
      };

      this.worker.addEventListener("message", listener);

      // Send the message to the worker.
      this.worker.postMessage(message);
    });
  }

  /**
   * Initializes the HandLandmarker worker.
   * @returns A Promise that resolves when the worker has been initialized.
   */
  async init(): Promise<void> {
    if (this.workerInitialized) {
      return;
    }

    const response = await this.sendMessage(
      new messages.InitMessage(),
      messages.MessageType.InitResponse
    );
    if (response.result === messages.Result.Ok) {
      this.workerInitialized = true;
    } else {
      throw new Error(`${response.result}: ${response.message}`, response.error);
    }
  }

  /**
   * Waits for the HandLandmarker worker to be initialized.
   * @returns A Promise that resolves when the worker has been initialized.
   */
  waitForInitialization(): Promise<void> {
    return new Promise((resolve) => {
      const checkInitialization = setInterval(() => {
        if (this.workerInitialized) {
          clearInterval(checkInitialization);
          resolve();
        }
      }, 100); // Check every 100ms
    });
  }

  /**
   * Sets the number of hands the HandLandmarker worker should track.
   * Only one call to this method can be made at a time.
   * @param numHands - The number of hands to track.
   * @returns A Promise that resolves when the worker has set the number of hands.
   */
  async setNumHands(numHands: number): Promise<void> {
    if (this.workerSettingNumHands) {
      throw new Error("Worker is already setting the number of hands");
    }
    if (!this.workerInitialized) {
      throw new Error("Worker is not initialized");
    }

    this.workerSettingNumHands = true;
    try {
      const response = await this.sendMessage(
        new messages.SetNumHands(numHands),
        messages.MessageType.SetNumHandsResponse
      );

      if (response.result === messages.Result.Ok) {
        return;
      }
      throw new Error(`${response.result}: ${response.message}`, response.error);
    } finally {
      this.workerSettingNumHands = false;
    }
  }

  /**
   * Processes a video frame.
   * Only one frame can be processed at a time.
   * @param videoFrame - The video frame to process.
   * @returns A Promise that resolves with the processed data.
   */
  async processFrame(videoFrame: VideoFrame): Promise<HandLandmarkerResult> {
    if (this.workerProcessingFrame) {
      throw new Error("Worker is already processing a frame");
    }
    if (!this.workerInitialized) {
      throw new Error("Worker is not initialized");
    }

    this.workerProcessingFrame = true;
    try {
      const response = (await this.sendMessage(
        new messages.FrameMessage(videoFrame),
        messages.MessageType.FrameResponse
      )) as messages.FrameResponse;
      if (response.result === messages.Result.Ok) {
        return response.data!;
      }
      throw new Error(`${response.result}: ${response.message}`, response.error);
    } finally {
      this.workerProcessingFrame = false;
    }
  }

  /**
   * Processes a video.
   * Only one video can be processed at a time.
   * @param video - The video to process.
   * @returns A Promise that resolves with the processed data.
   */
  async processVideo(video: EncodedVideoChunk[]): Promise<messages.FrameHandData[]> {
    if (this.workerProcessingVideo) {
      throw new Error("Worker is already processing a video");
    }
    if (!this.workerInitialized) {
      throw new Error("Worker is not initialized");
    }

    this.workerProcessingVideo = true;
    try {
      const response = (await this.sendMessage(
        new messages.VideoMessage(video),
        messages.MessageType.VideoResponse
      )) as messages.VideoResponse;
      if (response.result === messages.Result.Ok) {
        return response.data!;
      }
      throw new Error(`${response.result}: ${response.message}`, response.error);
    } finally {
      this.workerProcessingVideo = false;
    }
  }
}
