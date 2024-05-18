// Declarations of types and interfaces that are not available in the global scope, but are part of the browser API.

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
