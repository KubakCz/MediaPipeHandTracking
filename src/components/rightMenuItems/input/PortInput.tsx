import { Input } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import SettingsComponent from "./SettingsComponent";

interface PortInputProps {
  /**
   * Label of the input.
   */
  label: string;
  /**
   * Current value of the input.
   */
  value: number | null;
  /**
   * Callback function to handle input change.
   * @param value The new port number or null if the input is invalid.
   */
  onChange: (value: number | null) => void;
}

/**
 * Check if the input is a valid port number.
 * @param port The input to check.
 * @returns True if the input is a valid port number.
 */
function isValidPort(port: number): boolean {
  return !isNaN(port) && port >= 0 && port <= 65535;
}

/**
 * Port number input component.
 * Displays a label and an input for a port number.
 * Checks if the input is a valid port number.
 */
export default function PortInput({ label, value, onChange }: PortInputProps) {
  const [portString, setPortString] = useState<string>("0");
  const [isValid, setIsValid] = useState<boolean>(true);

  useEffect(() => {
    if (value) {
      setPortString(value.toString());
      setIsValid(isValidPort(value));
    }
  }, [value]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;

    // Check if the input contains only digits
    const containsOnlyDigits = /^[0-9]*$/.test(newValue);
    if (!containsOnlyDigits) return; // Reject the input if it contains any non-digit characters

    setPortString(newValue);

    // Check if the input is a valid port number
    const portNumber = parseInt(newValue, 10);
    const isValid = isValidPort(portNumber);
    setIsValid(isValid);
    onChange(isValid ? portNumber : null);
  };

  return (
    <SettingsComponent label={label}>
      <Input
        size="sm"
        value={portString}
        onChange={handleInputChange}
        isInvalid={!isValid}
        placeholder="Port Number"
      />
    </SettingsComponent>
  );
}
