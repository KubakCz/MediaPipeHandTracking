import { Input } from "@chakra-ui/react";
import { useEffect, useState } from "react";

interface PortInputProps {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
}

function isValidPort(port: number): boolean {
  return !isNaN(port) && port >= 0 && port <= 65535;
}

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
    if (!containsOnlyDigits) return;

    setPortString(newValue);

    // Check if the input is a valid port number
    const portNumber = parseInt(newValue, 10);
    const isValid = isValidPort(portNumber);
    setIsValid(isValid);
    onChange(isValid ? portNumber : null);
  };

  return (
    <>
      <p>{label}</p>
      <Input
        value={portString}
        onChange={handleInputChange}
        isInvalid={!isValid}
        placeholder="Port Number"
      />
    </>
  );
}
