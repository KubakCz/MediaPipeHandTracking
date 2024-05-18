import { Input } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import SettingsComponent from "./SettingsComponent";

interface IPInputProps {
  /**
   * Label of the input.
   */
  label: string;
  /**
   * Current value of the input.
   */
  value: string | null;
  /**
   * Callback function to handle IP address change.
   * @param value New IP address or null if the input is invalid.
   */
  onChange: (value: string | null) => void;
}

// Regular expression for an IP address
const ipPattern =
  /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

/**
 * IP address input component.
 * Displays a label and an input for an IP address.
 * Checks if the input is a valid IP address.
 */
export default function IPInput({ label, value, onChange }: IPInputProps) {
  const [ipString, setIpString] = useState<string>("127.0.0.1"); // Holds the current input value, even if it is invalid

  useEffect(() => {
    if (value) {
      setIpString(value);
    }
  }, [value]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;

    // Check if the input contains only allowed characters
    const containsAllowedChars = /^[0-9.]*$/.test(newValue);
    if (!containsAllowedChars) return; // Reject the input if it contains any invalid characters

    setIpString(newValue);

    // Check if the input is a valid IP address
    const isValid = ipPattern.test(newValue);
    onChange(isValid ? newValue : null);
  };

  return (
    <SettingsComponent label={label}>
      <Input
        size="sm"
        value={ipString}
        onChange={handleInputChange}
        isInvalid={!ipPattern.test(ipString)}
        placeholder="IP Address"
      />
    </SettingsComponent>
  );
}
