"use client";

import { useEffect, useState, useCallback, use } from "react";
import { ChakraProvider, Flex, VStack } from "@chakra-ui/react";
import DeviceSelect from "./DeviceSelect";
import WebcamPreview from "./CameraPreview/WebcamPreview";
import DirecotrySelect from "./DirectorySelect";
import { Resolution } from "./utils/resolution";
import RightMenu from "./RightMenu/RightMenu";
import { theme } from "./theme";

export default function App() {
  const [devices, setDevices] = useState<InputDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<InputDeviceInfo | undefined>();
  const [videoTrack, setVideoTrack] = useState<MediaStreamTrack | null | undefined>();
  const [directoryHandle, setDirectoryHandle] = useState<FileSystemDirectoryHandle | undefined>();

  const [resolution, setResolution] = useState(new Resolution(1280, 720));

  const handleUpdateDevices = useCallback(() => {
    navigator.mediaDevices.enumerateDevices().then((allDevices) => {
      const videoDevices = allDevices
        .filter((device) => device.kind === "videoinput")
        .map((device) => device as InputDeviceInfo)
        .sort((a, b) => a.deviceId.localeCompare(b.deviceId));

      // Update devices only if the list has changed
      if (videoDevices.length !== devices.length) {
        setDevices(videoDevices);
      } else {
        const oldDeviceIds = devices.map((device) => device.deviceId);
        const newDeviceIds = videoDevices.map((device) => device.deviceId);
        if (oldDeviceIds.every((id, i) => id === newDeviceIds[i])) return; // No change
        setDevices(videoDevices);
      }
      console.log("Devices updated", videoDevices);
    });
  }, [devices]);

  function handleDeviceChange(selectedDevice: InputDeviceInfo | undefined) {
    setSelectedDevice(selectedDevice);
    console.log(selectedDevice);
    // TO BE FIXEd
    // if (videoProcessorRef.current.isRecording)
    //   throw new Error("Cannot switch camera while recording");

    // // Stop old camera
    // if (videoProcessorRef.current.isProcessing) {
    //   videoProcessorRef.current.stopProcessing();
    //   setVideoTrack(null);
    // }
    setVideoTrack(undefined);

    if (!selectedDevice) return;

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
    setVideoTrack(null);
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        // Set up video processor
        // TO BE FIXED
        // videoProcessorRef.current.startProcessing(stream);
        setVideoTrack(stream.getVideoTracks()[0]);
      })
      .catch((error) => {
        setVideoTrack(undefined);
        console.error("Error getting user media", error);
      });
  }

  useEffect(() => {
    // TODO: Add warning if WebCodecs API is not supported
    if (typeof window !== "undefined" && !("VideoEncoder" in window)) {
      console.error("WebCodecs API is not supported");
    } else {
      console.log("WebCodecs API is supported");
      handleUpdateDevices();
    }
  }, [handleUpdateDevices]);

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

  return (
    <>
      <ChakraProvider theme={theme}>
        <Flex
          direction="row"
          justifyContent="flex-end"
          alignItems="flex-start"
          columnGap={10}
          w="100vw"
          h="100vh"
        >
          <VStack justifyContent="center" flexGrow={2} h="100%">
            <DeviceSelect
              devices={devices}
              onDeviceChange={handleDeviceChange}
              onClick={handleUpdateDevices}
            />
            <WebcamPreview
              videoTrack={videoTrack}
              directoryHandle={directoryHandle}
              resolution={resolution}
            />
            <DirecotrySelect
              directoryHandle={directoryHandle}
              onDirectorySelect={handleDirectorySelect}
            />
          </VStack>
          <VStack p="5" borderLeftWidth={2} borderColor="gray.200" overflowY="scroll" h="100vh">
            <RightMenu videoTrack={videoTrack} onResolutionChange={setResolution} />
          </VStack>
        </Flex>
      </ChakraProvider>
    </>
  );
}
