import { HStack, Switch, Text } from "@chakra-ui/react";

interface TwoWaySwithcProps {
  labelFalse: string;
  labelTrue: string;
  value: boolean;
  isDisabled?: boolean;
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
        isDisabled={isDisabled || false}
        variant="twoWay"
      />
      <Text variant={isDisabled ? "disabled" : ""}>{labelTrue}</Text>
    </HStack>
  );
}
