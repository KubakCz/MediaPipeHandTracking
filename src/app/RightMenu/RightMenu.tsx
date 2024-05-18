import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Heading,
} from "@chakra-ui/react";
import CameraSettings from "./CameraSettings";
import ConnectionSettings from "./ConnectionSettings";
import { Resolution } from "../utils/resolution";
import { HandLandmarker } from "../HandLandmarker/HandLandmarker";

interface RightMenuProps {
  videoTrack: MediaStreamTrack | null | undefined;
  handLandmarker: HandLandmarker | undefined;
  isDisabled?: boolean;
  onResolutionChange?: (resolution: Resolution) => void;
}

export default function RightMenu({
  videoTrack,
  handLandmarker,
  isDisabled,
  onResolutionChange,
}: RightMenuProps) {
  return (
    <Accordion allowToggle width="360px">
      <ConnectionSettings />
      <CameraSettings
        videoTrack={videoTrack || null}
        handLandmarker={handLandmarker}
        onResolutionChange={onResolutionChange}
        isDisabled={isDisabled}
      />
    </Accordion>
  );
}
