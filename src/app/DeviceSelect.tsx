import { Select } from "@chakra-ui/react";
import { on } from "events";
import { useState } from "react";

interface DeviceSelectProps {
  onDeviceChange?: (selectedDevice: InputDeviceInfo | undefined) => void;
}

export default function DeviceSelect({ onDeviceChange }: DeviceSelectProps) {
  const [devices, setDevices] = useState<InputDeviceInfo[]>([]);

  async function updateDevices() {
    const allDevices = await navigator.mediaDevices.enumerateDevices();
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
  }

  function handleDeviceChange(event: React.ChangeEvent<HTMLSelectElement>) {
    if (!onDeviceChange) return;

    const deviceId = event.target.value;
    const device = devices.find((device) => device.deviceId === deviceId);
    onDeviceChange(device);
  }

  return (
    <>
      <Select
        onChange={handleDeviceChange}
        onMouseDown={updateDevices}
        variant="outline"
        placeholder="Select camera source"
        maxWidth="350px"
      >
        {devices.map((device) => (
          <option key={device.deviceId} value={device.deviceId}>
            {device.label}
          </option>
        ))}
      </Select>
    </>
  );
}
