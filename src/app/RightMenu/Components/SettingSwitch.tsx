import { Switch, Text, HStack } from "@chakra-ui/react";

/**
 * Properties for the camera setting switch component.
 */
interface SettingSwitchProps {
  label: string;
  value: boolean;
  isDisabled?: boolean;
  onChange?: (value: boolean) => void;
}

/**
 * Camera setting switch component.
 * Used to toggle on and off camera settings.
 */
export default function SettingSwitch({ label, value, isDisabled, onChange }: SettingSwitchProps) {
  return (
    <HStack gap={3}>
      <Text variant={isDisabled ? "disabled" : ""}>{label}</Text>
      <Switch
        isChecked={value}
        onChange={(event) => onChange && onChange(event.currentTarget.checked)}
        isDisabled={isDisabled || false}
      />
    </HStack>
  );
}
