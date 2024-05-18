import { HStack, Spinner, Heading } from "@chakra-ui/react";

interface VideoTextProps {
  /**
   * Text to display.
   */
  text: string;
  /**
   * Whether to show a spinner before the text.
   */
  spinner?: boolean;
}

/**
 * Component to display text over the video preview.
 */
export default function VideoText({ text, spinner }: VideoTextProps) {
  return (
    <HStack justifyContent="center" alignItems="center" w="100%" h="100%">
      {spinner && <Spinner size="lg" color="brand.400" thickness="5px" speed="0.65s" />}
      <Heading size="lg">{text}</Heading>
    </HStack>
  );
}
