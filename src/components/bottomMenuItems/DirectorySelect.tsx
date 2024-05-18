import { Button, HStack, Input, VStack, Text } from "@chakra-ui/react";

interface DirectorySelectProps {
  /**
   * The selected directory handle.
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
   * If true, the directory selection is disabled.
   */
  isDisabled?: boolean;
}

/**
 * Component for selecting a video and hand data destination directory.
 */
export default function DirectorySelect({
  directoryHandle,
  onDirectorySelect,
  isDisabled,
}: DirectorySelectProps) {
  async function handleBrowse() {
    let directoryHandle: FileSystemDirectoryHandle | undefined = undefined;
    try {
      directoryHandle = await window.showDirectoryPicker();
    } catch (error) {
      onDirectorySelect(undefined, error as Error);
      return;
    }

    // Ask for permission
    if (
      (await directoryHandle!.queryPermission({ mode: "readwrite" })) !== "granted" &&
      (await directoryHandle!.requestPermission({ mode: "readwrite" })) === "denied"
    ) {
      onDirectorySelect(undefined, new Error("Permission denied"));
      return;
    }

    onDirectorySelect(directoryHandle);
  }

  return (
    <VStack alignItems="flex-start">
      <Text>Destination directory:</Text>
      <HStack>
        <Input
          placeholder="Select a directory"
          value={directoryHandle ? directoryHandle.name : ""}
          isInvalid={directoryHandle === undefined}
          readOnly
          isDisabled={isDisabled}
          onClick={handleBrowse}
          w="300px"
        />
        <Button onClick={handleBrowse} isDisabled={isDisabled} size="md">
          Browse
        </Button>
      </HStack>
    </VStack>
  );
}
