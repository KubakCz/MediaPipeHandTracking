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

interface RightMenuProps {
  videoTrack: MediaStreamTrack | null | undefined;
  onResolutionChange: (resolution: Resolution) => void;
}

export default function RightMenu({ videoTrack, onResolutionChange }: RightMenuProps) {
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
            // handLandmarker={handLandmarkerRef.current!} // TO BE FIXED
            handLandmarker={null}
            onResolutionChange={onResolutionChange}
          />
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}
