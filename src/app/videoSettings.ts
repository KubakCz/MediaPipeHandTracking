import { FileSystemWritableFileStreamTarget, MuxerOptions } from "webm-muxer";

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

export function getEncoderConfig(trackSettings: MediaTrackSettings): VideoEncoderConfig {
  return {
    codec: "vp09.00.10.08",
    width: trackSettings.width!,
    height: trackSettings.height!,
    framerate: trackSettings.frameRate!,
    bitrate: 5e6,
  };
}

export function getDecoderConfig(): VideoDecoderConfig {
  return {
    codec: "vp09.00.10.08",
  };
}
