declare global {
  interface Window {
    showSaveFilePicker: (options: any) => Promise<any>;
  }

  class MediaStreamTrackProcessor {
    constructor(init: { track: MediaStreamTrack });
    readonly readable: ReadableStream<VideoFrame>;
  }
}

export {};
