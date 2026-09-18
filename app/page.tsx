import { MenuItem } from "@/components/menu-item";
import { Flex, VStack, Text } from "@chakra-ui/react";
import { IconList } from "@tabler/icons-react";
import { ViewTransition } from "react";
import { C, MAX_W } from "@/theme/colors";

export default function Home() {
  return (
    <Flex justify="center" bg={C.bg} w="100vw" minH="100vh" py="3rem" px="4">
      <VStack gap="3rem" w="80vw" maxW={MAX_W}>
        <VStack gap="1rem">
          <ViewTransition name="mainIcon">
            <Text color={C.accent}>
              <IconList size={40} style={{ width: "min(10vw, 10vh)", height: "min(10vw, 10vh)" }} />
            </Text>
          </ViewTransition>
          <ViewTransition name="mainText">
            <VStack>
              <Text textStyle="4xl" fontWeight="bold" color={C.ink}>Bem-vindo</Text>
              <Text textStyle="2xl" fontWeight="normal" color={C.sub}>Escolha a ação a ser realizada</Text>
            </VStack>
          </ViewTransition>
        </VStack>

        <ViewTransition name="mainContent">
          <MenuItem action="take" />
          <MenuItem action="request" />
          <MenuItem action="instructions" />
          <MenuItem action="restricted" />
        </ViewTransition>
      </VStack>
    </Flex>
  );
}
