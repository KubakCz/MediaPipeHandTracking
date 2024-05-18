import { Slider, SliderFilledTrack, SliderThumb, SliderTrack } from "@chakra-ui/react";
import SettingsComponent from "./SettingsComponent";

interface SettingsSliderProps {
  /**
   * Label of the slider.
   */
  label: string;
  /**
   * Current value of the slider.
   */
  value: number;
  /**
   * Minimum value of the slider.
   */
  min?: number;
  /**
   * Maximum value of the slider.
   */
  max?: number;
  /**
   * Step size of the slider.
   */
  step?: number;
  /**
   * If true, the slider will be displayed as disabled.
   */
  isDisabled?: boolean;
  /**
   * Callback function to handle slider change.
   * @param value The new value of the slider.
   */
  onChange?: (value: number) => void;
  /**
   * Callback function to handle slider change end.
   * @param value The new value of the slider.
   */
  onChangeEnd?: (value: number) => void;
}

/**
 * Setting slider component.
 * Displays a label and a slider.
 */
export default function SettingsSlider({
  label,
  value,
  min,
  max,
  step,
  isDisabled,
  onChange,
  onChangeEnd,
}: SettingsSliderProps) {
  return (
    <SettingsComponent label={label} isDisabled={isDisabled}>
      <Slider
        my="1"
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
    </SettingsComponent>
  );
}
