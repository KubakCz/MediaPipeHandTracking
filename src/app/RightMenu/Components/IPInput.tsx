import { Heading, Input, Text, VStack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import SettingsComponent from "./SettingsComponent";

interface IPInputProps {
  label: string;
  value: string | null;
  onChange: (value: string | null) => void;
}

const ipPattern =
  /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

/**
 * IP address input component.
 * Checks if the input is a valid IP address.
 */
export default function IPInput({ label, value, onChange }: IPInputProps) {
  const [ipString, setIpString] = useState<string>("127.0.0.1");

  useEffect(() => {
    if (value) {
      setIpString(value);
    }
  }, [value]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;

    // Check if the input contains only allowed characters
    const containsAllowedChars = /^[0-9.]*$/.test(newValue);
    if (!containsAllowedChars) return;

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
