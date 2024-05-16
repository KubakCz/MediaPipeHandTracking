import { Select } from "@chakra-ui/react";

interface DeviceSelectProps {
  devices: InputDeviceInfo[];
  onDeviceChange?: (selectedDevice: InputDeviceInfo | undefined) => void;
  onClick?: () => void;
}

export default function DeviceSelect({ devices, onDeviceChange, onClick }: DeviceSelectProps) {
  function handleSelectDevice(event: React.ChangeEvent<HTMLSelectElement>) {
    if (!onDeviceChange) return;

    const deviceId = event.target.value;
    const device = devices.find((device) => device.deviceId === deviceId);
    onDeviceChange(device);
  }

  return (
    <>
      <Select
        onChange={handleSelectDevice}
        onMouseDown={onClick}
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
