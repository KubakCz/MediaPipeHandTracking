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
    <Accordion allowToggle width="300px">
      <AccordionItem>
        <AccordionButton>
          <Box as="span" flex="1" textAlign="left">
            <Heading size="md">Motive Connection</Heading>
          </Box>
          <AccordionIcon />
        </AccordionButton>
        <AccordionPanel pb="4">
          <ConnectionSettings />
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem></AccordionItem>
      <AccordionItem>
        <AccordionButton>
          <Box as="span" flex="1" textAlign="left">
            <Heading size="md">Camera Settings</Heading>
          </Box>
          <AccordionIcon />
        </AccordionButton>
        <AccordionPanel pb="4">
          <CameraSettings
            videoTrack={videoTrack || null}
            handLandmarker={handLandmarker}
            onResolutionChange={onResolutionChange}
            isDisabled={isDisabled}
          />
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}
