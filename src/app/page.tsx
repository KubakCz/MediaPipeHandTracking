"use client";

import { useEffect, useState, useCallback, use } from "react";
import { Button, ChakraProvider } from "@chakra-ui/react";
import DeviceSelect from "./DeviceSelect";
import WebcamPreview from "./CameraPreview/WebcamPreview";
import DirecotrySelect from "./DirectorySelect";
import ConnectionSettings from "./NatNetConnection/ConnectionSettings";

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
      <ChakraProvider>
        <DeviceSelect
          devices={devices}
          onDeviceChange={handleDeviceChange}
          onClick={handleUpdateDevices}
        />
        <DirecotrySelect
          directoryHandle={directoryHandle}
          onDirectorySelect={handleDirectorySelect}
        />
        <WebcamPreview device={selectedDevice} directoryHandle={directoryHandle} />
        <ConnectionSettings />
      </ChakraProvider>
    </>
  );
}
