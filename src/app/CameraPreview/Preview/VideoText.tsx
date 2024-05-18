import { HStack, Spinner, Heading } from "@chakra-ui/react";

interface VideoTextProps {
  text: string;
  spinner?: boolean;
}

export default function VideoText({ text, spinner }: VideoTextProps) {
  return (
    <HStack justifyContent="center" alignItems="center" w="100%" h="100%">
      {spinner && <Spinner size="lg" color="brand.400" thickness="5px" speed="0.65s" />}
      <Heading size="lg">{text}</Heading>
    </HStack>
  );
}
