import { HStack, Switch, Text } from "@chakra-ui/react";

interface TwoWaySwithcProps {
  /**
   * Label for the false state (left side).
   */
  labelFalse: string;
  /**
   * Label for the true state (right side).
   */
  labelTrue: string;
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
 * Two way switch component with labels on both sides.
 * Used to toggle between two states.
 */
export default function TwoWaySwitch({
  labelFalse,
  labelTrue,
  value,
  isDisabled,
  onChange,
}: TwoWaySwithcProps) {
  return (
    <HStack gap={5}>
      <Text variant={isDisabled ? "disabled" : ""}>{labelFalse}</Text>
      <Switch
        isChecked={value}
        onChange={(event) => onChange && onChange(event.currentTarget.checked)}
        isDisabled={isDisabled}
        variant="twoWay"
      />
      <Text variant={isDisabled ? "disabled" : ""}>{labelTrue}</Text>
    </HStack>
  );
}
