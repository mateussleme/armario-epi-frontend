import { PodeEntrar } from "@/api/demo";
import { EstoqueList } from "@/components/estoque-list";
import { MenuItem } from "@/components/menu-item";
import { Box, Flex, Text, VStack } from "@chakra-ui/react";
import { IconBuildingWarehouse } from "@tabler/icons-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { ViewTransition } from "react";
import { C, MAX_W } from "@/theme/colors";

// Estoque e ponto de pedido. A baixa aqui simula a saida que, no sistema de
// verdade, vem da retirada do armario e da entrega da requisicao.
//
// Ainda mockado no navegador, como o resto do modulo de compras.
export default async function Estoque() {
    await connection();

    const cookieStore = await cookies();
    const user = cookieStore.get("user")?.value ?? "";
    if (!(await PodeEntrar(user))) {
        redirect("/");
    }

    return (
        <Flex justify="center" bg={C.bg} w="100vw" minH="100vh" py="2rem" px="4">
            <VStack gap="2rem" w="90vw" maxW={MAX_W}>
                <VStack gap="0.75rem">
                    <ViewTransition name="mainIcon">
                        <Text color={C.accent}>
                            <IconBuildingWarehouse size={40} style={{ width: "min(8vw, 8vh)", height: "min(8vw, 8vh)" }} />
                        </Text>
                    </ViewTransition>
                    <ViewTransition name="mainText">
                        <Text textStyle="3xl" fontWeight="normal" color={C.ink}>Estoque</Text>
                    </ViewTransition>
                </VStack>

                <ViewTransition name="mainContent">
                    <VStack gap="1.5rem" w="100%">
                        <Box
                            w="100%"
                            px="1rem"
                            py="0.6rem"
                            bg={C.warningSoft}
                            borderWidth="0.1rem"
                            borderColor={C.warning}
                            borderRadius="lg"
                        >
                            <Text fontSize="0.9rem" color={C.warningInk}>
                                Tela de demonstração: a baixa aqui simula a saída de estoque. O saldo que chega
                                no ponto de pedido gera a reposição.
                            </Text>
                        </Box>

                        <EstoqueList />
                        <MenuItem action="cotacoes" />
                        <MenuItem action="back" override="/restricted" />
                    </VStack>
                </ViewTransition>
            </VStack>
        </Flex>
    );
}
