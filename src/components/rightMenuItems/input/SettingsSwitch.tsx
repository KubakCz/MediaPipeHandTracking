import { Switch, Text, HStack } from "@chakra-ui/react";

interface SettingsSwitchProps {
  /**
   * Label of the switch.
   */
  label: string;
  /**
   * Current value of the switch.
   */
  value: boolean;
  /**
   * If true, the switch will be displayed as disabled.
   */
  isDisabled?: boolean;
  /**
   * Callback function to handle switch change.
   * @param value New value of the switch.
   */
  onChange?: (value: boolean) => void;
}

/**
 * Camera setting switch component.
 * Displays a label and a switch.
 */
export default function SettingsSwitch({
  label,
  value,
  isDisabled,
  onChange,
}: SettingsSwitchProps) {
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
