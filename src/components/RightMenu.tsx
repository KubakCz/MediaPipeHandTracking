import { Accordion } from "@chakra-ui/react";
import { Resolution } from "../app/utils/resolution";
import { HandLandmarker } from "../app/handLandmarker/handLandmarker";
import { CameraSettings, ConnectionSettings } from "./rightMenuItems";

interface RightMenuProps {
  /**
   * Video track controlled by camera settings.
   */
  videoTrack: MediaStreamTrack | null | undefined;
  /**
   * HandLandmarker controlled by camera settings.
   */
  handLandmarker: HandLandmarker | undefined;
  /**
   * If true, the camera settings will be displayed as disabled.
   */
  cameraSettingsDisabled?: boolean;
  /**
   * Callback function to handle resolution change.
   * @param resolution New resolution.
   */
  onResolutionChange?: (resolution: Resolution) => void;
}

/**
 * Right menu component.
 * Displays connection and camera settings.
 */
export default function RightMenu({
  videoTrack,
  handLandmarker,
  cameraSettingsDisabled,
  onResolutionChange,
}: RightMenuProps) {
  return (
    <Accordion allowToggle width="360px">
      <ConnectionSettings />
      <CameraSettings
        videoTrack={videoTrack || null}
        handLandmarker={handLandmarker}
        onResolutionChange={onResolutionChange}
        isDisabled={cameraSettingsDisabled}
      />
    </Accordion>
  );
}
