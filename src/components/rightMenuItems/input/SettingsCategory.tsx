import { VStack, Heading, HStack } from "@chakra-ui/react";
import SettingsSwitch from "./SettingsSwitch";

interface SettingsCategoryProps {
  /**
   * Name of the category.
   */
  name: string;
  /**
   * Settings components to be displayed in the category.
   */
  children?: React.ReactNode;
  /**
   * If true, the name and auto switch will be displayed as disabled.
   */
  isDisabled?: boolean;
  /**
   * Value of the "auto" setting switch.
   * If undefined, the switch will not be displayed.
   */
  autoValue?: boolean | undefined;
  /**
   * Callback function to handle auto setting change.
   */
  onAutoChange?: (value: boolean) => void;
  /**
   * Label of the "auto" setting switch.
   * If not provided, the label will be "Auto" + category name in lowercase.
   */
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
          <SettingsSwitch
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
