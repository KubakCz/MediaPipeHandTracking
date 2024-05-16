import { HStack } from "@chakra-ui/react";
import DirectorySelect from "./DirectorySelect";
import RecordButton from "./RecordButton";

interface BottomMenuProps {
  directoryHandle: FileSystemDirectoryHandle | undefined;
  onDirectorySelect: (
    directoryHandle: FileSystemDirectoryHandle | undefined,
    error?: Error
  ) => void;
  isRecording: boolean;
  redordButtonDisabled?: boolean;
  onRecordClick?: () => void;
}

/**
 * Component for the bottom menu.
 */
export default function BottomMenu({
  directoryHandle,
  onDirectorySelect,
  isRecording,
  redordButtonDisabled,
  onRecordClick,
}: BottomMenuProps) {
  return (
    <HStack w="100%" justifyContent="space-between">
      <DirectorySelect directoryHandle={directoryHandle} onDirectorySelect={onDirectorySelect} />
      <RecordButton
        isRecording={isRecording}
        isDisabled={redordButtonDisabled}
        onClick={onRecordClick}
      />
    </HStack>
  );
}
