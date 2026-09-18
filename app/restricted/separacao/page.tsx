import { GetSolicitacoes } from "@/api/solicitacoes";
import { GetUser } from "@/api/users";
import { MenuItem } from "@/components/menu-item";
import { SeparacaoList } from "@/components/separacao-list";
import { Flex, Text, VStack } from "@chakra-ui/react";
import { IconClipboardCheck } from "@tabler/icons-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { ViewTransition } from "react";
import { C, MAX_W } from "@/theme/colors";

export default async function Separacao() {
    await connection();

    const cookieStore = await cookies();
    const user = cookieStore.get("user")?.value ?? "";
    const userData = await GetUser(user);
    if (!(userData?.admin ?? false)) {
        redirect("/");
    }

    // Sem status traz tudo que ainda está em aberto. Cancelada não aparece: sair
    // da lista é o propósito dela.
    const requisicoes = await GetSolicitacoes();

    return (
        <Flex justify="center" bg={C.bg} w="100vw" minH="100vh" py="2rem" px="4">
            <VStack gap="2rem" w="90vw" maxW={MAX_W}>
                <VStack gap="0.75rem">
                    <ViewTransition name="mainIcon">
                        <Text color={C.accent}>
                            <IconClipboardCheck size={40} style={{ width: "min(8vw, 8vh)", height: "min(8vw, 8vh)" }} />
                        </Text>
                    </ViewTransition>
                    <ViewTransition name="mainText">
                        <Text textStyle="3xl" fontWeight="normal" color={C.ink}>Lista de Separação</Text>
                    </ViewTransition>
                </VStack>

                <ViewTransition name="mainContent">
                    <VStack gap="1rem" w="100%">
                        {/* A cor da linha e o relogio ficam do lado do cliente: a
                            tela pode passar o dia aberta no almoxarifado, e o
                            atraso precisa aparecer sem ninguem recarregar. */}
                        <SeparacaoList requisicoes={requisicoes} />
                        <MenuItem action="back" override="/restricted" />
                    </VStack>
                </ViewTransition>
            </VStack>
        </Flex>
    );
}
