import {
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  HStack,
  Heading,
  VStack,
} from "@chakra-ui/react";

interface AccordionMenuItemProps {
  /**
   * Header of the accordion item.
   */
  label: string;
  /**
   * Icon to be displayed next to the header.
   */
  icon: React.ReactNode;
  /**
   * Content of the accordion item.
   */
  children: React.ReactNode;
}

/**
 * One item of the right accordion menu.
 * Defines the header and content of the accordion item.
 */
export default function AccordionMenuItem({ label, icon, children }: AccordionMenuItemProps) {
  return (
    <AccordionItem>
      <AccordionButton>
        <HStack alignItems="center" flexGrow={1}>
          {icon}
          <Heading fontSize="18pt">{label}</Heading>
        </HStack>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel pb="4">
        <VStack alignItems="stretch" textAlign="left" gap="2">
          {children}
        </VStack>
      </AccordionPanel>
    </AccordionItem>
  );
}
