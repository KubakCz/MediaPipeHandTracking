import { Button, Input } from "@chakra-ui/react";
import { on } from "events";

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
    <div
      style={{
        margin: "16px",
        display: "flex",
        gap: "16px",
        justifyContent: "flex-start",
        alignItems: "baseline",
      }}
    >
      <p>Destination directory:</p>
      <Input
        placeholder="Select a directory"
        value={directoryHandle ? directoryHandle.name : ""}
        isInvalid={directoryHandle === undefined}
        readOnly
        onChange={handleDirectoryPathChange}
        style={{ width: "300px" }}
      />
      <Button onClick={handleBrowse}>Browse</Button>
    </div>
  );
}
