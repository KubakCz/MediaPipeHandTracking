"use client";

/*
This script contains the main page component.
This component handles:
- Selecting a camera source
- Displaying the selected camera
- Updating the camera source list
*/

import React from "react";
import { ChakraProvider } from '@chakra-ui/react'
import { Select, Button } from '@chakra-ui/react'
import Webcam from "./webcam";

export default function App() {
    const [devices, setDevices] = React.useState<MediaDeviceInfo[]>([]);
    const [selectedDevice, setSelectedDevice] = React.useState<MediaDeviceInfo | undefined>();

    function handleUpdateDevices() {
        navigator.mediaDevices.enumerateDevices()
            .then(devices => {
                const videoDevices = devices.filter(device => device.kind === 'videoinput');
                console.log("Found", videoDevices.length, "video devices");
                setDevices(videoDevices);
            });
    }

    function handleSelectCamera(event: React.ChangeEvent<HTMLSelectElement>) {
        const deviceId = event.target.value;
        const device = devices.find(device => device.deviceId === deviceId);
        console.log("Selected device", device);
        setSelectedDevice(device);
    }

    // Update devices on load
    React.useEffect(() => {
        handleUpdateDevices();
    }
        , []);

    return (<ChakraProvider>
        <h1>MediaPipe Hand Tracking</h1>
        <Select onChange={handleSelectCamera} variant="outline" placeholder="Select camera source" maxWidth="300px" margin="16px">
            {devices.map(device => <option key={device.deviceId} value={device.deviceId}>{device.label}</option>)}
        </Select>
        <Button onClick={handleUpdateDevices} margin="16px">Update Devices</Button>
        <Webcam device={selectedDevice} />
    </ChakraProvider>);
}
