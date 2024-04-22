import { Box, Slider, SliderFilledTrack, SliderThumb, SliderTrack } from "@chakra-ui/react";
import { on } from "events";

interface CameraSettingSliderProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  isDisabled?: boolean;
  onChange?: (value: number) => void;
  onChangeEnd?: (value: number) => void;
}

/**
 * Camera setting slider component.
 * Used to adjust camera settings with a slider.
 */
export default function CameraSettingSlider({
  label,
  value,
  min,
  max,
  step,
  isDisabled,
  onChange,
  onChangeEnd,
}: CameraSettingSliderProps) {
  return (
    <>
      <label>{label}</label>
      <Slider
        aria-label="slider-ex-1"
        value={value}
        min={min}
        max={max}
        step={step}
        isDisabled={isDisabled || false}
        onChange={onChange}
        onChangeEnd={onChangeEnd}
      >
        <SliderTrack>
          <SliderFilledTrack />
        </SliderTrack>
        <SliderThumb />
      </Slider>
    </>
  );
}
