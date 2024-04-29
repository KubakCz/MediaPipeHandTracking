import { Switch } from "@chakra-ui/react";

/**
 * Properties for the camera setting switch component.
 */
interface CameraSettingSwitchProps {
  label: string;
  value: boolean;
  isDisabled?: boolean;
  onChange: (value: boolean) => void;
}

/**
 * Camera setting switch component.
 * Used to toggle on and off camera settings.
 */
export default function CameraSettingSwitch({
  label,
  value,
  isDisabled,
  onChange,
}: CameraSettingSwitchProps) {
  return (
    <div>
      <label>{label}</label>
      <Switch
        isChecked={value}
        onChange={(event) => onChange(event.currentTarget.checked)}
        isDisabled={isDisabled || false}
      />
    </div>
  );
}
