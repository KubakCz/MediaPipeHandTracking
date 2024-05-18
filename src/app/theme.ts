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

const Slider = defineStyleConfig({
  baseStyle: {
    filledTrack: {
      bg: "brand.400",
    },
  },
});

const Switch = defineStyleConfig({
  baseStyle: {
    track: {
      _checked: {
        bg: "brand.400",
      },
    },
  },
  variants: {
    twoWay: {
      track: {
        bg: "brand.400",
        _checked: {
          bg: "brand.400",
        },
      },
    },
  },
});

const Text = defineStyleConfig({
  variants: {
    disabled: {
      color: "gray.400",
    },
  },
});

const Heading = defineStyleConfig({
  variants: {
    disabled: {
      color: "gray.400",
    },
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
    Slider,
    Switch,
    Text,
    Heading,
  },
});
