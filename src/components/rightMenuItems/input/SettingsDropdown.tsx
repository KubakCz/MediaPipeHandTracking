import { Select } from "@chakra-ui/react";
import SettingsComponent from "./SettingsComponent";

interface ToStringable {
  toString(): string;
}

interface SettingsDropdownProps<T extends ToStringable> {
  /**
   * Label of the dropdown.
   */
  label: string;
  /**
   * Current value of the dropdown.
   */
  value: T;
  /**
   * Options to be displayed in the dropdown.
   */
  options: T[];
  /**
   * Whether the dropdown is disabled.
   */
  isDisabled?: boolean;
  /**
   * Callback function to handle dropdown change.
   * @param value The new value of the dropdown.
   */
  onChange: (value: T) => void;
}

/**
 * A dropdown component for settings.
 * Displays a label and a dropdown with options.
 * @typeparam T Type of the dropdown options that can be converted to a string.
 */
export default function SettingsDropdown<T extends ToStringable>({
  label,
  value,
  options,
  isDisabled,
  onChange,
}: SettingsDropdownProps<T>) {
  function handleOnChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const selectedValue = options.find((option) => option.toString() === event.target.value);
    if (selectedValue) {
      onChange(selectedValue);
    }
  }

  return (
    <SettingsComponent label={label} isDisabled={isDisabled}>
      <Select
        value={value.toString()}
        isDisabled={isDisabled || false}
        onChange={handleOnChange}
        mb={1}
      >
        {options.map((option, index) => (
          <option key={index} value={option.toString()}>
            {option.toString()}
          </option>
        ))}
      </Select>
    </SettingsComponent>
  );
}
