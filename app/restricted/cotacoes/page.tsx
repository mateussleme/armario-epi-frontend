import { GetUser } from "@/api/users";
import { CotacoesList } from "@/components/cotacoes-list";
import { ItensACotar } from "@/components/itens-a-cotar";
import { MenuItem } from "@/components/menu-item";
import { Box, Flex, Text, VStack } from "@chakra-ui/react";
import { IconFileDollar } from "@tabler/icons-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { ViewTransition } from "react";
import { C, MAX_W } from "@/theme/colors";

// Reposicao de estoque: a fila do que precisa ser cotado e as cotacoes montadas a
// partir dela.
//
// Tudo aqui ainda e mockado, dentro do navegador: nao existe tabela de fornecedor
// nem de cotacao no banco. A ideia e o Clairton ver o fluxo funcionando e opinar
// antes de fechar o modelo. Ver api/cotacoes.ts.
export default async function Cotacoes() {
    await connection();

    const cookieStore = await cookies();
    const user = cookieStore.get("user")?.value ?? "";
    const userData = await GetUser(user);
    if (!(userData?.admin ?? false)) {
        redirect("/");
    }

    return (
        <Flex justify="center" bg={C.bg} w="100vw" minH="100vh" py="2rem" px="4">
            <VStack gap="2rem" w="90vw" maxW={MAX_W}>
                <VStack gap="0.75rem">
                    <ViewTransition name="mainIcon">
                        <Text color={C.accent}>
                            <IconFileDollar size={40} style={{ width: "min(8vw, 8vh)", height: "min(8vw, 8vh)" }} />
                        </Text>
                    </ViewTransition>
                    <ViewTransition name="mainText">
                        <Text textStyle="3xl" fontWeight="normal" color={C.ink}>Cotações</Text>
                    </ViewTransition>
                </VStack>

                <ViewTransition name="mainContent">
                    <VStack gap="1.5rem" w="100%">
                        {/* Aviso de tela de demonstracao. Sai quando o backend de
                            cotacao existir. */}
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

                        <ItensACotar />
                        <CotacoesList />
                        <MenuItem action="back" override="/restricted" />
                    </VStack>
                </ViewTransition>
            </VStack>
        </Flex>
    );
}
