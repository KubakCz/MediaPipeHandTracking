import { Button, Text } from "@chakra-ui/react";
import { PiRecordFill } from "react-icons/pi";

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
    <Button w="140px" h="100%" onClick={onClick} isDisabled={isDisabled} size="xl" gap={2} p={5}>
      <PiRecordFill />
      <Text>{isRecording ? "Stop" : "Record"}</Text>
    </Button>
  );
}
