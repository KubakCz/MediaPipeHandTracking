// Code based on the following example from the WebCodecs API:
// https://github.com/w3c/webcodecs/tree/main/samples/capture-to-file

import "./declarations";
import { Muxer, FileSystemWritableFileStreamTarget } from "webm-muxer";

export class VideoRecorder {
  recording: boolean = false;
  fileWritableStream: FileSystemWritableFileStream | undefined;
  muxer: Muxer<FileSystemWritableFileStreamTarget> | undefined;
  frameReader: ReadableStreamDefaultReader<VideoFrame> | undefined;
  videoEncoder: VideoEncoder | undefined;
  frameCount: number = 0;
  startTime: number = 0;

  handleChunk = (chunk: EncodedVideoChunk, metadata?: EncodedVideoChunkMetadata) => {
    this.muxer!.addVideoChunk(chunk, metadata);
  };

  processFrame = async (result: ReadableStreamReadResult<VideoFrame>) => {
    if (result.done) {
      // This happens when stopRecording is called
      console.log("Avg frame rate", this.frameCount / ((Date.now() - this.startTime) / 1000));
      this.cleanup();
      return;
    }

    const frame = result.value;

    if (this.videoEncoder!.encodeQueueSize <= 5) {
      this.frameCount++;
      const insert_keyframe = this.frameCount % 150 == 0;
      this.videoEncoder!.encode(frame, { keyFrame: insert_keyframe });
    } else {
      console.warn("dropping frame, encoder falling behind");
    }

    frame.close();
    this.frameReader!.read().then(this.processFrame);
  };

  async startRecording(fileHandle: FileSystemFileHandle, track: MediaStreamTrack) {
    if (this.recording) throw new Error("Recording already in progress");

    this.recording = true;
    this.frameCount = 0;

    const trackSettings = track.getSettings();

    this.fileWritableStream = await fileHandle.createWritable();
    this.muxer = new Muxer({
      target: new FileSystemWritableFileStreamTarget(this.fileWritableStream),
      video: {
        codec: "V_VP9",
        width: trackSettings.width!,
        height: trackSettings.height!,
        frameRate: trackSettings.frameRate!,
        alpha: false,
      },
      type: "webm",
      firstTimestampBehavior: "offset",
    });

    const trackProcessor = new MediaStreamTrackProcessor({ track });
    this.frameReader = trackProcessor.readable.getReader();

    this.videoEncoder = new VideoEncoder({
      output: this.handleChunk,
      error: (e: DOMException) => {
        console.log(e.message);
        this.stopRecording();
      },
    });

    const videoEncoderConfig = {
      codec: "vp09.00.10.08",
      width: trackSettings.width!,
      height: trackSettings.height!,
      framerate: trackSettings.frameRate!,
      bitrate: 5e6,
    };
    const supported = await VideoEncoder.isConfigSupported(videoEncoderConfig);
    if (supported) {
      this.videoEncoder.configure(videoEncoderConfig);
    } else {
      throw new Error("Video encoder configuration not supported");
    }

    this.startTime = Date.now();
    this.frameReader.read().then(this.processFrame);
  }

  async stopRecording() {
    if (this.frameReader) await this.frameReader.cancel();
    this.frameReader = undefined;
  }

  async cleanup() {
    if (this.videoEncoder) {
      await this.videoEncoder.flush();
      await this.videoEncoder.close();
    }
    if (this.muxer) {
      await this.muxer.finalize();
      this.muxer = undefined;
    }
    if (this.fileWritableStream) {
      await this.fileWritableStream.close();
      this.fileWritableStream = undefined;
    }
    this.recording = false;
  }
}
