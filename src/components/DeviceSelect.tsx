import { Select } from "@chakra-ui/react";
import { useState } from "react";

interface DeviceSelectProps {
  /**
   * Whether the device selection is disabled.
   */
  isDisabled?: boolean;
  /**
   * Callback function to handle device change.
   * @param selectedDevice InputDeviceInfo object of the selected device or undefined if no device is selected.
   */
  onDeviceChange?: (selectedDevice: InputDeviceInfo | undefined) => void;
}

/**
 * Camera device selection component.
 */
export default function DeviceSelect({ isDisabled, onDeviceChange }: DeviceSelectProps) {
  const [devices, setDevices] = useState<InputDeviceInfo[]>([]);

  /**
   * Update the list of available devices.
   */
  async function updateDevices() {
    try {
      // Request camera permission
      await navigator.mediaDevices.getUserMedia({ video: true });

      // Get all video devices
      console.log("Updating devices");
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices
        .filter((device) => device.kind === "videoinput")
        .map((device) => device as InputDeviceInfo)
        .sort((a, b) => a.deviceId.localeCompare(b.deviceId));
      console.log("Devices: ", videoDevices);

      // Update devices only if the list has changed
      if (videoDevices.length !== devices.length) {
        console.log("Setting devices");
        setDevices(videoDevices);
      } else {
        const oldDeviceIds = devices.map((device) => device.deviceId);
        const newDeviceIds = videoDevices.map((device) => device.deviceId);
        if (oldDeviceIds.every((id, i) => id === newDeviceIds[i])) return; // No change
        console.log("Setting devices 2");
        setDevices(videoDevices);
      }
    } catch (error) {
      console.error("Error accessing media devices.", error);
    }
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
        onClick={updateDevices}
        isDisabled={isDisabled}
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
