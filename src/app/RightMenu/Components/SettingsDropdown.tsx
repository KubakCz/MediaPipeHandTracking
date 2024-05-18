import { Select } from "@chakra-ui/react";
import SettingsComponent from "./SettingsComponent";

interface ToStringable {
  toString(): string;
}

interface SettingsDropdownProps<T extends ToStringable> {
  label: string;
  value: T;
  options: T[];
  isDisabled?: boolean;
  onChange: (value: T) => void;
}

/**
 * A dropdown component for settings.
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
