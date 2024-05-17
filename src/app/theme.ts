import { defineStyleConfig, extendTheme } from "@chakra-ui/react";

const Button = defineStyleConfig({
  baseStyle: {
    fontWeight: "semibold",
  },
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
  variants: {
    solid: {
      color: "white",
      background: "brand.800",
      _hover: { background: "brand.900" },
    },
  },
  defaultProps: {
    size: "md",
    variant: "solid",
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
