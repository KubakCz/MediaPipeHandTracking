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
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

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
