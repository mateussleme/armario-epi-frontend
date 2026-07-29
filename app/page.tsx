import { MenuItem } from "@/components/menu-item";
import { AbsoluteCenter, VStack, Text } from "@chakra-ui/react";
import { IconList } from "@tabler/icons-react";
import { ViewTransition } from "react";

export default function Home() {
  return (
    <AbsoluteCenter w="100vw" h="100vh">
      <VStack gap="3rem" w="80vw">
        <VStack gap="1rem">
          <ViewTransition name="mainIcon">
            <IconList size={"min(10vw, 10vh)"} />
          </ViewTransition>
          <ViewTransition name="mainText">
            <VStack>
              <Text textStyle="4xl" fontWeight="bold">Bem-vindo</Text>
              <Text textStyle="2xl" fontWeight="normal">Escolha a ação a ser realizada</Text>
            </VStack>
          </ViewTransition>
        </VStack>

        <ViewTransition name="mainContent">
          <MenuItem action="take" />
          <MenuItem action="instructions" />
          <MenuItem action="restricted" />
        </ViewTransition>
      </VStack>
    </AbsoluteCenter>
  );
}
