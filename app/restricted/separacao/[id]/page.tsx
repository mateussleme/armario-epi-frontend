import { GetSolicitacao, GetSolicitacaoItens } from "@/api/solicitacoes";
import { GetUser } from "@/api/users";
import { PickingList } from "@/components/picking-list";
import { Flex, Text, VStack } from "@chakra-ui/react";
import { IconChecklist } from "@tabler/icons-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { ViewTransition } from "react";
import { C, MAX_W } from "@/theme/colors";

export default async function Picking({ params }: { params: Promise<{ id: string }> }) {
    await connection();

    const cookieStore = await cookies();
    const user = cookieStore.get("user")?.value ?? "";
    const userData = await GetUser(user);
    if (!(userData?.admin ?? false)) {
        redirect("/");
    }

    const id = Number(decodeURIComponent((await params).id));
    if (isNaN(id)) {
        redirect("/restricted/separacao");
    }

    const requisicao = await GetSolicitacao(id);
    if (requisicao == undefined) {
        redirect("/restricted/separacao");
    }

    const itens = await GetSolicitacaoItens(id);

    const data = new Date(requisicao.data).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

    // Cabecalho curto: numero da requisicao e horario, que e o que o
    // almoxarifado usa para saber se esta atrasado. Nome de quem pediu fica na
    // lista, que e de onde a pessoa acabou de vir.
    //
    // Nao ha cancelar aqui: quem cancela e o requisitante, e so enquanto a
    // separacao nao comecou. Quem faz o picking nao desfaz requisicao alheia.
    return (
        <Flex justify="center" bg={C.bg} w="100vw" minH="100vh" py="2rem" px="4">
            <VStack gap="1.5rem" w="90vw" maxW={MAX_W}>
                <ViewTransition name="mainText">
                    <Flex gap="3" align="center">
                        <Text color={C.accent}>
                            <IconChecklist size={28} />
                        </Text>
                        <Text textStyle="3xl" fontWeight="normal" color={C.ink}>
                            Requisição {requisicao.id}
                        </Text>
                        <Text textStyle="lg" color={C.sub}>{data}</Text>
                    </Flex>
                </ViewTransition>

                <ViewTransition name="mainContent">
                    {/* Quem abriu e marcou o primeiro item fica registrado como
                        responsavel pela separacao. */}
                    <PickingList requisicao={requisicao} itens={itens} separador={user} />
                </ViewTransition>
            </VStack>
        </Flex>
    );
}
