import { Box } from "@chakra-ui/react";
import { CSSProperties } from "react";

/**
 * Component to display when there is no camera preview available.
 */
export default function NoPreview({
  aspectRatio = 16 / 9,
  children,
}: {
  aspectRatio?: number;
  height?: CSSProperties["height"];
  children?: React.ReactNode;
}) {
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
      bg="gray.100"
      borderWidth="1px"
    >
      {children}
    </Box>
  );
}
