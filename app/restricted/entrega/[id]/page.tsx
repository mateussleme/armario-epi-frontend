import { GetSolicitacao, GetSolicitacaoItens, STATUS_AGUARDANDO } from "@/api/solicitacoes";
import { GetUser } from "@/api/users";
import { EntregaConfirm } from "@/components/entrega-confirm";
import { Flex, Text, VStack } from "@chakra-ui/react";
import { IconHandGrab } from "@tabler/icons-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { ViewTransition } from "react";
import { C, MAX_W } from "@/theme/colors";

export default async function EntregaItem({ params }: { params: Promise<{ id: string }> }) {
    await connection();

    const cookieStore = await cookies();
    const user = cookieStore.get("user")?.value ?? "";
    const userData = await GetUser(user);
    if (!(userData?.admin ?? false)) {
        redirect("/");
    }

    const id = Number(decodeURIComponent((await params).id));
    if (isNaN(id)) {
        redirect("/restricted/entrega");
    }

    const requisicao = await GetSolicitacao(id);
    if (requisicao == undefined || requisicao.status != STATUS_AGUARDANDO) {
        redirect("/restricted/entrega");
    }

    const itens = await GetSolicitacaoItens(id);

    return (
        <Flex justify="center" bg={C.bg} w="100vw" minH="100vh" py="2rem" px="4">
            <VStack gap="1.5rem" w="90vw" maxW={MAX_W}>
                <ViewTransition name="mainText">
                    <VStack gap="0.25rem">
                        <Flex gap="3" align="center">
                            <Text color={C.success}><IconHandGrab size={28} /></Text>
                            <Text textStyle="3xl" fontWeight="normal" color={C.ink}>
                                {requisicao.pessoaNome}
                            </Text>
                        </Flex>
                        <Text fontSize="1rem" color={C.sub}>
                            Requisição {requisicao.id} · {requisicao.totalItens} {requisicao.totalItens == 1 ? "item" : "itens"}
                        </Text>
                    </VStack>
                </ViewTransition>

                <ViewTransition name="mainContent">
                    <EntregaConfirm requisicao={requisicao} itens={itens} />
                </ViewTransition>
            </VStack>
        </Flex>
    );
}
