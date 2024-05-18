// Definitions of messages that can be sent to and from the HandLandmarker worker.

import { HandLandmarkerResult } from "@mediapipe/tasks-vision";

/**
 * Possible results of operations.
 */
export enum Result {
  Ok,
  InternalError,
  InvalidOperation,
  InvalidData,
  UnknownOperation,
}

/**
 * Possible types of messages that can be sent to and from the HandLandmarker worker.
 * Messages are sent to the worker, and responses are sent back to the main thread.
 * MessageType is used to determine the type of message being sent, as the type of the message object is lost when sending it to and from a worker.
 */
export enum MessageType {
  BaseMessage,
  BaseResponse,
  InitMessage,
  InitResponse,
  SetNumHandsMessage,
  SetNumHandsResponse,
  FrameMessage,
  FrameResponse,
  VideoMessage,
  VideoResponse,
}

/**
 * Base class for messages sent to the HandLandmarker worker.
 */
export class HandLandmarkerMessage {
  type = MessageType.BaseMessage;
}

/**
 * Base class for responses sent from the HandLandmarker worker.
 */
export class HandLandmarkerResponse {
  type = MessageType.BaseResponse;

  /**
   * @param result - The result of the operation.
   * @param message - Optional message providing more details about the operation.
   * @param error - Optional error information if the operation failed.
   */
  constructor(public result: Result, public message?: string, public error?: any) {}
}

/**
 * Message to initialize the HandLandmarker worker.
 */
export class InitMessage extends HandLandmarkerMessage {
  type = MessageType.InitMessage;

  constructor() {
    super();
  }
}

/**
 * Response to an InitMessage.
 */
export class InitResponse extends HandLandmarkerResponse {
  type = MessageType.InitResponse;

  constructor(result: Result, message?: string, error?: any) {
    super(result, message, error);
  }
}

/**
 * Message to set the number of hands the HandLandmarker worker should track.
 */
export class SetNumHands extends HandLandmarkerMessage {
  type = MessageType.SetNumHandsMessage;

  /**
   * @param numHands - The number of hands to track.
   */
  constructor(public numHands: number) {
    super();
  }
}

/**
 * Response to a SetNumHands message.
 */
export class SetNumHandsResponse extends HandLandmarkerResponse {
  type = MessageType.SetNumHandsResponse;

  constructor(result: Result, message?: string, error?: any) {
    super(result, message, error);
  }
}

/**
 * Message containing a video frame for the HandLandmarker worker to process.
 */
export class FrameMessage extends HandLandmarkerMessage {
  type = MessageType.FrameMessage;

  /**
   * @param videoFrame - The video frame to process.
   */
  constructor(public videoFrame: VideoFrame) {
    super();
  }
}

/**
 * Response to a FrameMessage containing processed data.
 */
export class FrameResponse extends HandLandmarkerResponse {
  type = MessageType.FrameResponse;

  /**
   * @param result - The result of the operation.
   * @param data - Optional data about the hands detected in the frame.
   * @param message - Optional message providing more details about the operation.
   * @param error - Optional error information if the operation failed.
   */
  constructor(result: Result, public data?: HandLandmarkerResult, message?: string, error?: any) {
    super(result, message, error);
  }
}

/**
 * Interface representing data about a hand detected in a frame.
 */
export interface FrameHandData {
  timestamp: number;
  data: HandLandmarkerResult;
}

/**
 * Message containing a video for the HandLandmarker worker to process.
 */
export class VideoMessage extends HandLandmarkerMessage {
  type = MessageType.VideoMessage;

  /**
   * @param videoData - The video data to process.
   */
  constructor(public videoData: EncodedVideoChunk[]) {
    super();
  }
}

/**
 * Response to a VideoMessage containing processed data.
 */
export class VideoResponse extends HandLandmarkerResponse {
  type = MessageType.VideoResponse;

  /**
   * @param result - The result of the operation.
   * @param data - Optional array of data about the hands detected in each frame of the video.
   * @param message - Optional message providing more details about the operation.
   * @param error - Optional error information if the operation failed.
   */
  constructor(result: Result, public data?: FrameHandData[], message?: string, error?: any) {
    super(result, message, error);
  }
}
