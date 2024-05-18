import { FileSystemWritableFileStreamTarget, Muxer } from "webm-muxer";
import { getEncoderConfig, getMuxerOptions } from "./videoSettings";
import { dateTimeString } from "../utils/dateTimeFormat";

/**
 * Class for processing video frames and recording them into a file.
 */
export class VideoProcessor {
  // Processing
  private _videoTrack: MediaStreamTrack | null = null;
  private _reader: ReadableStreamDefaultReader<VideoFrame> | null = null;

  // Recording
  private _muxer: Muxer<FileSystemWritableFileStreamTarget> | null = null;
  private _videoFileWritableStream: FileSystemWritableFileStream | null = null;
  private _videoEncoder: VideoEncoder | null = null;
  private _recordedChunks: EncodedVideoChunk[] = [];
  private _recordingStartTime: number = 0;
  private _frameCount: number = 0;
  private _isRecording: boolean = false;

  // #region Getters

  /**
   * Video stream being processed.
   */
  public get stream(): MediaStreamTrack | null {
    return this._videoTrack;
  }

  /**
   * Whether the processor is currently processing (has a video track to read from).
   */
  public get isProcessing(): boolean {
    return this._videoTrack !== null;
  }

  /**
   * Whether the processor is currently recording video frames.
   */
  public get isRecording(): boolean {
    return this._isRecording;
  }

  /**
   * Time when the recording started.
   */
  public get recordingStartTime(): number {
    return this._recordingStartTime;
  }

  /**
   * Number of frames processed from the recording start.
   */
  public get frameCount(): number {
    return this._frameCount;
  }

  /**
   * Recorded video chunks.
   */
  public get recordedChunks(): EncodedVideoChunk[] {
    return this._recordedChunks;
  }

  // #endregion Getters

  /**
   * Creates a new VideoProcessor.
   * @param onFrameRead - Callback for when a frame is read.
   */
  constructor(private onFrameRead?: (frame: VideoFrame) => void) {}

  // #region Processing

  /**
   * Starts grabbing video frames from a stream and processing them.
   * @param videoTrack - The video track to take video frames from.
   */
  startProcessing(videoTrack: MediaStreamTrack) {
    if (this._videoTrack) throw new Error("Already processing video frames");

    this._videoTrack = videoTrack;
    const trackProcessor = new MediaStreamTrackProcessor({ track: videoTrack });
    this._reader = trackProcessor.readable.getReader();
    this.readerLoop();
  }

  /**
   * Stops processing video frames.
   */
  stopProcessing() {
    if (!this._videoTrack) throw new Error("No stream to stop processing");

    this._reader?.cancel();
    this._reader = null;
    this._videoTrack = null;
  }

  /**
   * Function that reads video frames from a ReadableStreamDefaultReader and processes them.
   * @param reader - ReadableStreamDefaultReader to read the video frames from.
   * @returns Promise that resolves when the reader is done.
   */
  async readerLoop() {
    while (this._reader) {
      const result = await this._reader.read();
      if (result.done) {
        break;
      }

      if (this._isRecording) {
        // Record the frame
        await this.recordFrame(result.value);
      }

      // Notify the caller that the frame is ready
      this.onFrameRead?.(result.value);

      this._frameCount++;
      result.value.close();
    }
  }

  // #endregion Processing

  // #region Recording

  /**
   * Starts recording video frames to a file.
   * @param directoryHandle - The directory to save the video file in.
   * @param file_name - The name of the file to save the video in. (Default: hand_recording_yyyy-mm-dd-hh-mm-ss.webm)
   * @param onError - Callback for when an error occurs.
   */
  async startRecording(
    directoryHandle: FileSystemDirectoryHandle,
    file_name?: string,
    onError?: (error: DOMException) => void
  ) {
    if (this._isRecording) throw new Error("Recording already in progress");
    if (!this._videoTrack) throw new Error("No track to record");

    const currentTime = Date.now();
    const trackSettings = this._videoTrack.getSettings();

    // Create destination file and muxer
    const videoFileHandle = await directoryHandle.getFileHandle(
      file_name || `hand_recording_${dateTimeString(new Date(currentTime))}.webm`,
      {
        create: true,
      }
    );
    this._videoFileWritableStream = await videoFileHandle.createWritable();
    this._muxer = new Muxer(getMuxerOptions(this._videoFileWritableStream, trackSettings));

    // Create video encoder
    this._recordedChunks.length = 0;
    this._videoEncoder = new VideoEncoder({
      output: (chunk: EncodedVideoChunk, metadata?: EncodedVideoChunkMetadata) => {
        this._muxer!.addVideoChunk(chunk, metadata);
        this._recordedChunks.push(chunk);
      },
      error: (e: DOMException) => {
        onError?.(e);
      },
    });
    const videoEncoderConfig = getEncoderConfig(trackSettings);
    const supported = await VideoEncoder.isConfigSupported(videoEncoderConfig);
    if (supported) {
      this._videoEncoder.configure(videoEncoderConfig);
    } else {
      this.cleanupRecording();
      throw new Error("Video encoder configuration not supported");
    }

    // Reset recording stats
    this._frameCount = 0;
    this._recordingStartTime = currentTime;
    this._isRecording = true;
  }

  /**
   * Stops recording video frames and saves the video file.
   */
  async stopRecording() {
    if (!this._isRecording) throw new Error("No recording in progress");

    this._isRecording = false; // Stops processing loop from sending frames to the encoder

    await this.cleanupRecording();
  }

  private async recordFrame(frame: VideoFrame) {
    if (!this._videoEncoder) throw new Error("Video encoder not initialized");

    // Encode the frame
    if (this._videoEncoder.encodeQueueSize <= 10) {
      const insertKeyFrame = this._frameCount % 150 === 0;
      this._videoEncoder.encode(frame, { keyFrame: insertKeyFrame });
    } else {
      console.warn("Dropping frame, encoder falling behind");
    }
  }

  private async cleanupRecording() {
    // Stop video encoder
    if (this._videoEncoder) {
      await this._videoEncoder.flush();
      this._videoEncoder.close();
      this._videoEncoder = null;
    }

    // Stop muxer
    if (this._muxer) {
      await this._muxer.finalize();
      this._muxer = null;
    }

    // Close file
    if (this._videoFileWritableStream) {
      await this._videoFileWritableStream.close();
      this._videoFileWritableStream = null;
    }
  }

  // #endregion Recording
}
