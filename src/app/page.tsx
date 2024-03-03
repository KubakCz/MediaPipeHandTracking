"use client";

/*
This script contains the main page component.
This component handles:
- Selecting a camera source
- Displaying the selected camera
- Updating the camera source list
*/

import React from "react";
import { ChakraProvider } from "@chakra-ui/react";
import { Select, Button } from "@chakra-ui/react";
import fixWebmDuration from "fix-webm-duration";
import Webcam from "./webcam";

export default function App() {
  const [devices, setDevices] = React.useState<InputDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = React.useState<MediaDeviceInfo | undefined>();
  const [videoRecorder, setVideoRecorder] = React.useState<MediaRecorder | undefined>(undefined);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  function handleUpdateDevices() {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const videoDevices = devices
        .filter((device) => device.kind === "videoinput")
        .map((device) => device as InputDeviceInfo);
      console.log("Found", videoDevices.length, "video devices");
      setDevices(videoDevices);
    });
  }

  function handleSelectCamera(event: React.ChangeEvent<HTMLSelectElement>) {
    // Stop old camera
    if (videoRef.current) {
      const stream = videoRef.current.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    }

    // Select new camera
    const deviceId = event.target.value;
    const device = devices.find((device) => device.deviceId === deviceId);
    console.log("Selected device", device);
    setSelectedDevice(device);
  }

  function handleRecord() {
    if (videoRecorder) {
      console.log("Stop recording");
      videoRecorder.stop();
      setVideoRecorder(undefined);
    } else {
      const options = {
        mimeType: 'video/webm;codecs="vp9"',
      };
      const sourceStream = videoRef.current!.srcObject as MediaStream;

      console.log("Start recording", sourceStream, options);
      const recorder = new MediaRecorder(sourceStream, options);
      let data: Blob[] = [];

      recorder.ondataavailable = (event) => {
        data.push(event.data);
      };

      const videoStartTime = Date.now();
      recorder.onstop = () => {
        const duration = Date.now() - videoStartTime;
        console.log("Recording stopped", duration);
        const blob = new Blob(data, { type: "video/webm" });
        fixWebmDuration(blob, duration, (fixedBlob) => {
          const url = URL.createObjectURL(fixedBlob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "video.webm";
          a.click();
        });
      };

      recorder.start();
      setVideoRecorder(recorder);
    }
  }

  // Update devices on load
  React.useEffect(() => {
    handleUpdateDevices();
  }, []);

  return (
    <ChakraProvider>
      <h1>Hand Capture</h1>
      <Select
        onChange={handleSelectCamera}
        variant="outline"
        placeholder="Select camera source"
        maxWidth="300px"
        margin="16px"
      >
        {devices.map((device) => (
          <option key={device.deviceId} value={device.deviceId}>
            {device.label}
          </option>
        ))}
      </Select>
      <Button onClick={handleUpdateDevices} margin="16px">
        Update Devices
      </Button>
      <Webcam device={selectedDevice} videoRef={videoRef} />
      {selectedDevice && (
        <Button onClick={handleRecord} margin="16px">
          {videoRecorder ? "Stop recording" : "Record"}
        </Button>
      )}
    </ChakraProvider>
  );
}
