import { Button, HStack, Input, VStack } from "@chakra-ui/react";

interface DirectorySelectProps {
  directoryHandle: FileSystemDirectoryHandle | undefined;
  onDirectorySelect: (
    directoryHandle: FileSystemDirectoryHandle | undefined,
    error?: Error
  ) => void;
  isDisabled?: boolean;
}

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
      <p>Destination directory:</p>
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
