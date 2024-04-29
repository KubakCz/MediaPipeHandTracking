import { Select } from "@chakra-ui/react";

interface ToStringable {
  toString(): string;
}

interface CameraSettingsDropdownProps<T extends ToStringable> {
  label: string;
  value: T;
  options: T[];
  isDisabled?: boolean;
  onChange: (value: T) => void;
}

/**
 * A dropdown component for camera settings.
 */
export default function CameraSettingsDropdown<T extends ToStringable>({
  label,
  value,
  options,
  isDisabled,
  onChange,
}: CameraSettingsDropdownProps<T>) {
  function handleOnChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const selectedValue = options.find((option) => option.toString() === event.target.value);
    if (selectedValue) {
      onChange(selectedValue);
    }
  }

  return (
    <>
      <label>{label}</label>
      <Select value={value.toString()} isDisabled={isDisabled || false} onChange={handleOnChange}>
        {options.map((option, index) => (
          <option key={index} value={option.toString()}>
            {option.toString()}
          </option>
        ))}
      </Select>
    </>
  );
}
