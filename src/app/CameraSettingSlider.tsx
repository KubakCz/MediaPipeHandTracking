import { Box, Slider, SliderFilledTrack, SliderThumb, SliderTrack } from "@chakra-ui/react";

interface CameraSettingSliderProps {
  label: string;
  value: number;
  setValue: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: number) => void;
  onChangeEnd?: (value: number) => void;
}

export default function CameraSettingSlider({
  label,
  value,
  setValue,
  min,
  max,
  step,
  onChange,
  onChangeEnd,
}: CameraSettingSliderProps) {
  function handleChange(newValue: number) {
    setValue(newValue);
    onChange && onChange(newValue);
  }

  return (
    <Box bg="gray.100" borderWidth="1px" borderRadius="lg" m="16px" p="8px">
      <label>{label}</label>
      <Slider
        aria-label="slider-ex-1"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={handleChange}
        onChangeEnd={onChangeEnd}
      >
        <SliderTrack>
          <SliderFilledTrack />
        </SliderTrack>
        <SliderThumb />
      </Slider>
    </Box>
  );
}
