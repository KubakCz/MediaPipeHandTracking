"use client";

import { useEffect, useState, useCallback, use } from "react";
import { Button, ChakraProvider } from "@chakra-ui/react";
import DeviceSelect from "./DeviceSelect";
import WebcamPreview from "./WebcamPreview";
import Script from "next/script";

export default function App() {
  const [devices, setDevices] = useState<InputDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<InputDeviceInfo | undefined>();
  const [directoryHandle, setDirectoryHandle] = useState<FileSystemDirectoryHandle | undefined>();

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

  function handleDirectorySelect() {
    window
      .showDirectoryPicker()
      .then((directoryHandle) => {
        setDirectoryHandle(directoryHandle);
      })
      .catch((error) => {
        console.error("Error selecting directory", error);
      });
  }

  return (
    <>
      <ChakraProvider>
        <h1>Hand Capture</h1>
        <DeviceSelect
          devices={devices}
          onDeviceChange={handleDeviceChange}
          onClick={handleUpdateDevices}
        />
        <Button onClick={handleDirectorySelect} m="16px">
          Select directory
        </Button>
        <WebcamPreview device={selectedDevice} directoryHandle={directoryHandle} />
        {/* <Webcam device={selectedDevice} videoRef={videoRef} /> */}
      </ChakraProvider>
    </>
  );
}
