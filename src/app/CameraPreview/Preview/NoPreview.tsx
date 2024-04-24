import { Box } from "@chakra-ui/react";
import { CSSProperties } from "react";

/**
 * Component to display when there is no camera preview available.
 */
export default function NoPreview({
  aspectRatio = 4 / 3,
  height = "480px",
  children,
}: {
  aspectRatio?: number;
  height?: CSSProperties["height"];
  children?: React.ReactNode;
}) {
  return (
    <Box
      h={height}
      aspectRatio={aspectRatio}
      display="flex"
      alignItems="center"
      justifyContent="center"
      fontWeight="semibold"
      fontSize="lg"
      bg="gray.100"
      borderWidth="1px"
      m="16px"
    >
      {children}
    </Box>
  );
}
