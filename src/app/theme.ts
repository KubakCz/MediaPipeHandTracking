import { defineStyleConfig, extendTheme } from "@chakra-ui/react";

const Button = defineStyleConfig({
  // The styles all button have in common
  baseStyle: {
    fontWeight: "semibold",
    borderRadius: 5,
  },
  // Two sizes: xl and md
  sizes: {
    md: {
      fontSize: "md",
      px: 6,
      py: 4,
    },
    xl: {
      fontSize: "xl",
      fontWeight: "bold",
      px: 8,
      py: 5,
    },
  },
  // One variants: solid
  variants: {
    solid: {
      color: "white",
      background: "brand.800",
      _hover: { background: "brand.900" },
    },
  },
  // The default size and variant values
  defaultProps: {
    size: "md",
  },
});

export const theme = extendTheme({
  colors: {
    brand: {
      400: "#38A169",
      800: "#2A5540",
      900: "#224333",
    },
  },
  components: {
    Button,
  },
});
