import { VStack, Text } from "@chakra-ui/react";

interface SettingsComponentProps {
  /**
   * Label of the settings component.
   */
  label: string;
  /**
   * Child component to be displayed.
   */
  children?: React.ReactNode;
  /**
   * If true, the label will be displayed as disabled.
   * Does not affect the child component.
   */
  isDisabled?: boolean;
}

/**
 * Base settings component used as a wrapper for an input component.
 * Displays a label and a child input component.
 */
export default function SettingsComponent({ label, children, isDisabled }: SettingsComponentProps) {
  return (
    <VStack alignItems="left" gap="0">
      <Text fontSize="12pt" variant={isDisabled ? "disabled" : ""}>
        {label}
      </Text>
      {children}
    </VStack>
  );
}
