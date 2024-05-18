import { FileSystemWritableFileStreamTarget, MuxerOptions } from "webm-muxer";

/**
 * Generates configuration for a muxer.
 * @param writableStream Writable stream to write the muxed data to.
 * @param trackSettings Settings of the recorded video track.
 * @returns Muxer configuration.
 */
export function getMuxerOptions(
  writableStream: FileSystemWritableFileStream,
  trackSettings: MediaTrackSettings
): MuxerOptions<FileSystemWritableFileStreamTarget> {
  return {
    target: new FileSystemWritableFileStreamTarget(writableStream),
    video: {
      codec: "V_VP9",
      width: trackSettings.width!,
      height: trackSettings.height!,
      frameRate: trackSettings.frameRate!,
      alpha: false,
    },
    type: "webm",
    firstTimestampBehavior: "offset",
  };
}

/**
 * Generates configuration for a video encoder.
 * @param trackSettings Settings of the encoded video track.
 * @returns Encoder configuration.
 */
export function getEncoderConfig(trackSettings: MediaTrackSettings): VideoEncoderConfig {
  return {
    codec: "vp09.00.10.08",
    width: trackSettings.width!,
    height: trackSettings.height!,
    framerate: trackSettings.frameRate!,
    bitrate: 5e6,
  };
}

/**
 * Generates configuration for a video decoder.
 * @returns Decoder configuration.
 */
export function getDecoderConfig(): VideoDecoderConfig {
  return {
    codec: "vp09.00.10.08",
  };
}
