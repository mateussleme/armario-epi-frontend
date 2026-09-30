import { DEMO } from "@/api/demo";
import { MenuItem } from "@/components/menu-item";
import { Box, Flex, VStack, Text } from "@chakra-ui/react";
import { IconList } from "@tabler/icons-react";
import { ViewTransition } from "react";
import { C, MAX_W } from "@/theme/colors";

export default function Home() {
  // No modo demonstracao (Vercel) a home leva direto para o modulo de compras:
  // retirada, solicitacao e instrucoes dependem do banco, do leitor RFID e do
  // reconhecimento facial, que nao existem ali.
  if (DEMO) {
    return (
      <Flex justify="center" bg={C.bg} w="100vw" minH="100vh" py="3rem" px="4">
        <VStack gap="2rem" w="80vw" maxW={MAX_W}>
          <VStack gap="1rem">
            <ViewTransition name="mainIcon">
              <Text color={C.accent}>
                <IconList size={40} style={{ width: "min(10vw, 10vh)", height: "min(10vw, 10vh)" }} />
              </Text>
            </ViewTransition>
            <ViewTransition name="mainText">
              <VStack gap="0.5rem">
                <Text textStyle="4xl" fontWeight="bold" color={C.ink}>Módulo de Compras</Text>
                <Text textStyle="xl" fontWeight="normal" color={C.sub} textAlign="center">
                  Demonstração das telas
                </Text>
              </VStack>
            </ViewTransition>
          </VStack>

          <ViewTransition name="mainContent">
            <VStack gap="1rem" w="100%">
              <Box
                w="100%"
                px="1rem"
                py="0.7rem"
                bg={C.warningSoft}
                borderWidth="0.1rem"
                borderColor={C.warning}
                borderRadius="lg"
              >
                <Text fontSize="0.9rem" color={C.warningInk}>
                  Os dados são de exemplo e ficam apenas nesta aba do navegador: nada é salvo no banco.
                  Recarregar a página começa de novo. As telas do armário (retirada, solicitação e
                  separação) não entram aqui porque dependem do leitor RFID e do reconhecimento facial.
                </Text>
              </Box>

              <MenuItem action="estoque" />
              <MenuItem action="cotacoes" />
              <MenuItem action="pedidos" />
            </VStack>
          </ViewTransition>
        </VStack>
      </Flex>
    );
  }

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
