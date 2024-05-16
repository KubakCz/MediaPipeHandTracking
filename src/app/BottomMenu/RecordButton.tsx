import { Button } from "@chakra-ui/react";

/**
 * Props for the RecordButton component.
 */
interface RecordButtonProps {
  isRecording: boolean;
  isDisabled?: boolean;
  onClick?: () => void;
}

/**
 * Button component for starting and stopping recording.
 */
export default function RecordButton({ isRecording, isDisabled, onClick }: RecordButtonProps) {
  return (
    <Button h="100%" w="150px" onClick={onClick} isDisabled={isDisabled} colorScheme={"red"}>
      {isRecording ? "Stop" : "Record"}
    </Button>
  );
}
