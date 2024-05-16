import { Button, HStack, Input, VStack } from "@chakra-ui/react";

interface DirectorySelectProps {
  directoryHandle: FileSystemDirectoryHandle | undefined;
  onDirectorySelect: (
    directoryHandle: FileSystemDirectoryHandle | undefined,
    error?: Error
  ) => void;
}

export default function DirectorySelect({
  directoryHandle,
  onDirectorySelect,
}: DirectorySelectProps) {
  async function handleBrowse() {
    let directoryHandle = undefined;

    try {
      directoryHandle = await window.showDirectoryPicker();
    } catch (error) {
      onDirectorySelect(undefined, error as Error);
    }

    onDirectorySelect(directoryHandle);
  }

  async function handleDirectoryPathChange(event: React.ChangeEvent<HTMLInputElement>) {}

  return (
    <VStack alignItems="flex-start">
      <p>Destination directory:</p>
      <HStack>
        <Input
          placeholder="Select a directory"
          value={directoryHandle ? directoryHandle.name : ""}
          isInvalid={directoryHandle === undefined}
          readOnly
          onChange={handleDirectoryPathChange}
          style={{ width: "300px" }}
        />
        <Button onClick={handleBrowse}>Browse</Button>
      </HStack>
    </VStack>
  );
}
