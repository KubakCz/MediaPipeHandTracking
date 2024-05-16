"use client";

import { useEffect, useReducer, useState } from "react";
import { ChakraProvider, Flex, VStack } from "@chakra-ui/react";
import { theme } from "./theme";
import DeviceSelect from "./DeviceSelect";
import WebcamPreview from "./CameraPreview/WebcamPreview";
import RightMenu from "./RightMenu/RightMenu";
import BottomMenu from "./BottomMenu/BottomMenu";

export default function App() {
  const [videoStream, setVideoStream] = useState<MediaStream | null | undefined>();
  const [directoryHandle, setDirectoryHandle] = useState<FileSystemDirectoryHandle | undefined>();
  const [isRecording, setIsRecording] = useState(false);

  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  // Check if WebCodecs API is supported
  useEffect(() => {
    if (typeof window !== "undefined" && !("VideoEncoder" in window)) {
      console.error("WebCodecs API is not supported");
      alert(
        "Looks like your browser does not support the WebCodecs API. The application won't work as expected. Please update your browser or use a different one."
      );
    } else {
      console.log("WebCodecs API is supported");
    }
  }, []);

  function handleDeviceChange(selectedDevice: InputDeviceInfo | undefined) {
    if (isRecording) throw new Error("Cannot switch camera while recording");

    if (videoStream) videoStream.getTracks().forEach((track) => track.stop());
    setVideoStream(undefined); // Nothing selected

    if (!selectedDevice) return;

    setVideoStream(null); // Source selected, but not yet loaded

    // Set new camera
    const deviceCapabilities = selectedDevice.getCapabilities();
    const maxFps = deviceCapabilities.frameRate?.max || 30;
    const maxWidth = deviceCapabilities.width?.max || 1280;
    const maxHeight = deviceCapabilities.height?.max || 720;
    const constraints: MediaStreamConstraints = {
      video: {
        deviceId: selectedDevice.deviceId,
        width: 1920 <= maxWidth ? 1920 : 1280, // Use 1080p if available, otherwise 720p
        height: 1080 <= maxHeight ? 1080 : 720,
        frameRate: maxFps, // Use the highest possible frame rate
      },
    };
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        setVideoStream(stream);
      })
      .catch((error) => {
        setVideoStream(undefined);
        console.error("Error getting user media", error);
      });
  }

  function handleDirectorySelect(
    directoryHandle: FileSystemDirectoryHandle | undefined,
    error?: Error
  ) {
    if (directoryHandle) {
      setDirectoryHandle(directoryHandle);
    }
    if (error) {
      console.error("Error selecting directory", error);
    }
  }

  function getCurrentVideoTrack() {
    if (!videoStream) return videoStream;
    return videoStream.getVideoTracks()[0];
  }

  return (
    <>
      <ChakraProvider theme={theme}>
        <Flex direction="row" justifyContent="flex-end" alignItems="center" w="100vw" h="100vh">
          <VStack justifyContent="center" alignItems="center" flexGrow={1}>
            <VStack alignItems="flex-start">
              <DeviceSelect onDeviceChange={handleDeviceChange} />
              <WebcamPreview
                videoStream={videoStream}
                directoryHandle={directoryHandle}
                isRecording={isRecording}
              />
              <BottomMenu
                directoryHandle={directoryHandle}
                onDirectorySelect={handleDirectorySelect}
                isRecording={isRecording}
                redordButtonDisabled={directoryHandle === undefined || videoStream === undefined}
                onRecordClick={() => setIsRecording(!isRecording)}
              />
            </VStack>
          </VStack>
          <VStack p="5" borderLeftWidth={2} borderColor="gray.200" overflowY="scroll" h="100vh">
            <RightMenu
              videoTrack={getCurrentVideoTrack()}
              onResolutionChange={forceUpdate}
              isDisabled={isRecording}
            />
          </VStack>
        </Flex>
      </ChakraProvider>
    </>
  );
}
