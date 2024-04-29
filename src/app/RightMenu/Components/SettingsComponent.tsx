import { VStack, Text } from "@chakra-ui/react";

interface SettingsComponentProps {
  label: string;
  children?: React.ReactNode;
}

/**
 * Base settings component used as a wrapper for an input component.
 */
export default function SettingsComponent({ label, children }: SettingsComponentProps) {
  return (
    <VStack alignItems="left" gap="0" >
      <Text size="sm">{label}</Text>
      {children}
    </VStack>
  );
}
