"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import { ChakraProvider, Flex, VStack, useToast } from "@chakra-ui/react";
import { theme } from "./theme";
import DeviceSelect from "./DeviceSelect";
import WebcamPreview from "./CameraPreview/WebcamPreview";
import RightMenu from "./RightMenu/RightMenu";
import BottomMenu from "./BottomMenu/BottomMenu";
import { HandLandmarker } from "./HandLandmarker/HandLandmarker";
import { handDataToJSON } from "./HandLandmarker/HandDataToJson";
import { dateTimeString } from "./utils/dateTimeFormat";

export default function App() {
  const [directoryHandle, setDirectoryHandle] = useState<FileSystemDirectoryHandle | undefined>();
  const [videoStream, setVideoStream] = useState<MediaStream | null | undefined>();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const handLandmarkerRef = useRef<HandLandmarker>();

  // Force redraw of the page
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  const toast = useToast();

  /**
   * Effect for checking WebCodecs API support.
   */
  useEffect(() => {
    if (typeof window !== "undefined" && !("VideoEncoder" in window)) {
      console.error("WebCodecs API is not supported");
      alert(
        "Looks like your browser does not support the WebCodecs API. The application won't work as expected. Please update your browser or use a different one."
      );
    } else {
      console.log("WebCodecs API is supported");
    }
  }, []);

  /**
   * Effect for initializing HandLandmarker.
   */
  useEffect(() => {
    console.log("Initializing HandLandmarker");
    // Initialize handLandmarker
    handLandmarkerRef.current = new HandLandmarker(
      new Worker(new URL("HandLandmarker/HandLandmarkerWorker.ts", import.meta.url))
    );
    handLandmarkerRef.current
      .init()
      .then(() => {
        console.log("HandLandmarker initialized");
      })
      .catch((error) => {
        console.error("Error initializing HandLandmarker", error);
        window.alert(
          "Error initializing HandLandmarker. Please reload the page. You can find more information in the console."
        );
      });
  }, []);

  /**
   * Handle camera change. Setups the stream and updates the state.
   */
  function handleDeviceChange(selectedDevice: InputDeviceInfo | undefined) {
    if (isRecording) throw new Error("Cannot switch camera while recording");

    if (videoStream) videoStream.getTracks().forEach((track) => track.stop());
    setVideoStream(undefined); // Nothing selected

    if (!selectedDevice) return;

    setVideoStream(null); // Source selected, but not yet loaded

    // Set new camera
    const deviceCapabilities = selectedDevice.getCapabilities();
    const maxFps = deviceCapabilities.frameRate?.max || 30;
    const maxWidth = deviceCapabilities.width?.max || 1280;
    const maxHeight = deviceCapabilities.height?.max || 720;
    const constraints: MediaStreamConstraints = {
      video: {
        deviceId: selectedDevice.deviceId,
        width: 1920 <= maxWidth ? 1920 : 1280, // Use 1080p if available, otherwise 720p
        height: 1080 <= maxHeight ? 1080 : 720,
        frameRate: maxFps, // Use the highest possible frame rate
      },
    };
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        setVideoStream(stream);
      })
      .catch((error) => {
        setVideoStream(undefined);
        console.error("Error getting user media", error);
      });
  }

  /**
   * Handle directory selection. Updates the state.
   */
  function handleDirectorySelect(
    directoryHandle: FileSystemDirectoryHandle | undefined,
    error?: Error
  ) {
    if (directoryHandle) {
      setDirectoryHandle(directoryHandle);
    }
    if (error) {
      console.error("Error selecting directory", error);
    }
  }

  /**
   * Callback for when recording fails to start.
   */
  function handleRecordingStartFailed() {
    setIsRecording(false);
  }

  /**
   * Callback for when recording stops.
   */
  async function handleRecordingStop(videoChunks: EncodedVideoChunk[], startTime: number) {
    if (!directoryHandle) throw new Error("No directory selected");
    if (!handLandmarkerRef.current) throw new Error("HandLandmarker not set");

    // Process recorded video
    setIsProcessing(true);
    const handData = await handLandmarkerRef.current.processVideo(videoChunks);
    setIsProcessing(false);

    // Save video data to file
    let fileWriter: FileSystemWritableFileStream | undefined;
    try {
      console.log("Saving hand data");
      const fileHandle = await directoryHandle?.getFileHandle(
        `handData_${dateTimeString(new Date(startTime))}.json`, // TODO: Add file name input (optional)
        {
          create: true,
        }
      );
      fileWriter = await fileHandle?.createWritable();
      await fileWriter?.write(handDataToJSON(handData));
    } catch (e) {
      console.error("Error saving hand data", e);
      toast({
        title: "Error saving hand data",
        description:
          "An error occurred while saving the hand data. See the console for more information.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      if (fileWriter) await fileWriter.close();
      console.log("Video saved successfully");
      toast({
        title: "Video saved successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    }
  }

  function getCurrentVideoTrack() {
    if (!videoStream) return videoStream;
    return videoStream.getVideoTracks()[0];
  }

  return (
    <>
      <ChakraProvider theme={theme}>
        <Flex direction="row" justifyContent="flex-end" alignItems="center" w="100vw" h="100vh">
          <VStack justifyContent="center" alignItems="center" flexGrow={1}>
            <VStack alignItems="flex-start">
              <DeviceSelect isDisabled={isRecording} onDeviceChange={handleDeviceChange} />
              <WebcamPreview
                videoStream={videoStream}
                directoryHandle={directoryHandle}
                handLandmarkerRef={handLandmarkerRef}
                isRecording={isRecording}
                isProcessing={isProcessing}
                onRecordingStop={handleRecordingStop}
              />
              <BottomMenu
                directoryHandle={directoryHandle}
                onDirectorySelect={handleDirectorySelect}
                isRecording={isRecording}
                redordButtonDisabled={directoryHandle === undefined || videoStream === undefined}
                onRecordClick={() => setIsRecording(!isRecording)}
              />
            </VStack>
          </VStack>
          <VStack p="5" borderLeftWidth={2} borderColor="gray.200" overflowY="scroll" h="100vh">
            <RightMenu
              videoTrack={getCurrentVideoTrack()}
              handLandmarker={handLandmarkerRef.current}
              onResolutionChange={forceUpdate}
              isDisabled={isRecording}
            />
          </VStack>
        </Flex>
      </ChakraProvider>
    </>
  );
}
