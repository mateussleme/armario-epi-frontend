import { PodeEntrar } from "@/api/demo";
import { MenuItem } from "@/components/menu-item";
import { PedidosList } from "@/components/pedidos-list";
import { Box, Flex, Text, VStack } from "@chakra-ui/react";
import { IconShoppingCart } from "@tabler/icons-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { ViewTransition } from "react";
import { C, MAX_W } from "@/theme/colors";

// Pedidos de compra. Nascem da cotacao, agrupados por fornecedor.
//
// Ainda mockado no navegador, como o resto do modulo de compras. Ver
// api/cotacoes.ts.
export default async function Pedidos() {
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
                            <IconShoppingCart size={40} style={{ width: "min(8vw, 8vh)", height: "min(8vw, 8vh)" }} />
                        </Text>
                    </ViewTransition>
                    <ViewTransition name="mainText">
                        <Text textStyle="3xl" fontWeight="normal" color={C.ink}>Pedidos de Compra</Text>
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
                                Tela de demonstração: os dados são de exemplo e não ficam salvos no banco.
                            </Text>
                        </Box>

                        <PedidosList />
                        <MenuItem action="cotacoes" />
                        <MenuItem action="back" override="/restricted" />
                    </VStack>
                </ViewTransition>
            </VStack>
        </Flex>
    );
}
