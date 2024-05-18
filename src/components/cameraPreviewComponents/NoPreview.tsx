import { Box } from "@chakra-ui/react";

interface NoPreviewProps {
  /**
   * Aspect ratio of the preview.
   */
  aspectRatio?: number;
  /**
   * Children to display over the preview.
   */
  children?: React.ReactNode;
}

/**
 * Component to display when there is no camera preview available.
 */
export default function NoPreview({ aspectRatio = 16 / 9, children }: NoPreviewProps) {
  return (
    <Box
      aspectRatio={aspectRatio}
      h="480px"
      // w="100%"
      // maxHeight="calc(100vh - 500px)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      fontWeight="semibold"
      fontSize="lg"
      bg="gray.200"
      borderWidth="1px"
    >
      {children}
    </Box>
  );
}
