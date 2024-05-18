import { VStack, Text } from "@chakra-ui/react";

interface SettingsComponentProps {
  label: string;
  children?: React.ReactNode;
  isDisabled?: boolean;
}

/**
 * Base settings component used as a wrapper for an input component.
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
