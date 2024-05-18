import { VStack, Text, Heading, HStack } from "@chakra-ui/react";
import SettingSwitch from "./SettingSwitch";

interface SettingsCategoryProps {
  name: string;
  children?: React.ReactNode;
  isDisabled?: boolean;
  autoValue?: boolean | undefined;
  onAutoChange?: (value: boolean) => void;
  autoLabel?: string;
}

/**
 * Settings category component.
 * Used to group settings of the same type in the right menu.
 * Offers "auto" setting switch.
 */
export default function SettingsCategory({
  name,
  children,
  isDisabled,
  autoValue,
  onAutoChange,
  autoLabel,
}: SettingsCategoryProps) {
  return (
    <VStack alignItems="stretch" my={2}>
      <HStack justifyContent="space-between">
        <Heading fontSize="14pt" variant={isDisabled ? "disabled" : ""}>
          {name}
        </Heading>
        {autoValue !== undefined && (
          <SettingSwitch
            label={autoLabel || "Auto" + name.toLowerCase()}
            value={autoValue}
            isDisabled={isDisabled}
            onChange={onAutoChange}
          />
        )}
      </HStack>
      {children}
    </VStack>
  );
}
