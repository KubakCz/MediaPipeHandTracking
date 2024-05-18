import { HStack } from "@chakra-ui/react";
import { DirectorySelect, RecordButton } from "./bottomMenuItems";

interface BottomMenuProps {
  /**
   * Currently selected directory handle.
   */
  directoryHandle: FileSystemDirectoryHandle | undefined;
  /**
   * Callback when a directory is selected.
   * @param directoryHandle New directory handle.
   * @param error Error that occurred during directory selection.
   */
  onDirectorySelect: (
    directoryHandle: FileSystemDirectoryHandle | undefined,
    error?: Error
  ) => void;
  /**
   * Whether the app is currently recording.
   */
  isRecording: boolean;
  /**
   * If true, the directory selection is disabled.
   */
  directorySelectDisabled?: boolean;
  /**
   * If true, the record button is disabled.
   */
  redordButtonDisabled?: boolean;
  /**
   * Callback when the record button is clicked.
   */
  onRecordClick?: () => void;
}

/**
 * Bottom menu component.
 * Displays directory selection and record button.
 */
export default function BottomMenu({
  directoryHandle,
  onDirectorySelect,
  isRecording,
  directorySelectDisabled,
  redordButtonDisabled,
  onRecordClick,
}: BottomMenuProps) {
  return (
    <HStack w="100%" justifyContent="space-between">
      <DirectorySelect
        isDisabled={directorySelectDisabled}
        directoryHandle={directoryHandle}
        onDirectorySelect={onDirectorySelect}
      />
      <RecordButton
        isRecording={isRecording}
        isDisabled={redordButtonDisabled}
        onClick={onRecordClick}
      />
    </HStack>
  );
}
