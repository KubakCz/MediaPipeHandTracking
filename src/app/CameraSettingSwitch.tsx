import { Box, Switch } from "@chakra-ui/react";
import { ChangeEvent } from "react";

interface CameraSettingSwitchProps {
  label: string;
  value: boolean;
  setValue: (value: boolean) => void;
  onChange?: (value: boolean) => void;
}

export default function CameraSettingSlider({
  label,
  value,
  setValue,
  onChange,
}: CameraSettingSwitchProps) {
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const newValue = event.currentTarget.checked;
    setValue(newValue);
    onChange && onChange(newValue);
  }

  return (
    <Box bg="gray.100" borderWidth="1px" borderRadius="lg" m="16px" p="8px">
      <label>{label}</label>
      <Switch isChecked={value} onChange={handleChange} />
    </Box>
  );
}
