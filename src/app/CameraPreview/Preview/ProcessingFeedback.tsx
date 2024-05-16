import { HStack, Text, Spinner } from "@chakra-ui/react";

export default function ProcessingFeedback() {
  return (
    <HStack justifyContent="center" alignItems="center" w="100%" h="100%">
      <Spinner size="lg" color="brand.400" thickness="4px" speed="0.65s" />
      <Text fontWeight="semibold" fontSize="lg">
        Video processing in progress...
      </Text>
    </HStack>
  );
}
