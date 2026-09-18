import { GetItemData, GetUserItemsByOrigin } from "@/api/item-data";
import { ItemBadge } from "@/components/item-badge";
import { ItemVerifier } from "@/components/item-verifier";
import { MenuItem } from "@/components/menu-item";
import { RequiredAlert, RequiredWarning } from "@/components/required-alert";
import { requiredReason } from "@/types/Required";
import { ORIGEM_ARMARIO } from "@/types/ItemData";
import { Flex, Grid, GridItem, Text, VStack } from "@chakra-ui/react";
import { IconShoppingBag } from "@tabler/icons-react";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { ViewTransition } from "react";
import { C, MAX_W } from "@/theme/colors";

export default async function Take() {
    await connection();

    const cookieStore = await cookies();
    const user = cookieStore.get("user")?.value ?? "";

    // So os itens que saem do armario. Antes a tela trazia todos, entao item de
    // almoxarifado aparecia aqui esperando a pessoa pegar de uma porta onde ele
    // nunca esteve.
    const result = await GetUserItemsByOrigin(user, ORIGEM_ARMARIO);
    const items = result?.items ?? [];

    // No armario o sistema nao sabe o que a pessoa vai pegar, mas sabe o que ela
    // tem que pegar. Entao o aviso vem antes de abrir a porta, e nao so como
    // marcacao no card la embaixo.
    const detailByProduct = new Map((result?.detail ?? []).map((d) => [d.produto, d]));
    const warnings: RequiredWarning[] = [];
    for (const item of items) {
        if (item.state != "required") {
            continue;
        }

        const data = item.data ?? (await GetItemData(item.id));
        const detail = detailByProduct.get(item.id);

        warnings.push({
            id: item.id,
            title: data?.title ?? item.id,
            reason: detail != undefined
                ? requiredReason(detail.diasValidade, detail.diasDesdeUso)
                : "obrigatório no seu grupo",
        });
    }

    // Nao usa AbsoluteCenter: ele centraliza com posicionamento absoluto, e quando
    // o conteudo fica maior que a tela sobra para fora nas duas pontas, sem como
    // rolar ate o inicio.
    return (
        <>
            <Flex justify="center" bg={C.bg} w="100vw" minH="100vh" py="3rem" px="4">
                <VStack gap="3rem" w="80vw" maxW={MAX_W}>
                    <VStack gap="1rem">
                        <ViewTransition name="mainIcon">
                            <Text color={C.success}>
                                <IconShoppingBag size={40} style={{ width: "min(10vw, 10vh)", height: "min(10vw, 10vh)" }} />
                            </Text>
                        </ViewTransition>
                        <ViewTransition name="mainText">
                            <Text textStyle="4xl" fontWeight="normal" color={C.ink}>Retirada de Itens</Text>
                        </ViewTransition>
                    </VStack>

                    <ViewTransition name="mainContent">
                        <VStack gap="2rem" w="100%">
                            <RequiredAlert items={warnings} />

                            <Grid templateColumns="repeat(6, 1fr)" gap="6" w="100%" alignItems="stretch">
                                {items.map(function (item, i) {
                                    return (
                                        <GridItem colSpan={2} key={i}>
                                            <ItemBadge itemId={item.id} state={item.state} />
                                        </GridItem>
                                    );
                                })}
                            </Grid>
                            <Text textStyle="3xl" fontWeight="bold" textAlign="center" color={C.ink}>Abra a porta e retire os itens</Text>
                            {/* closesDoor fecha a porta ao sair: se a pessoa desistiu
                                no meio do fluxo, a porta nao pode ficar aberta. */}
                            <MenuItem action="back" override="/" closesDoor={true} />
                        </VStack>
                    </ViewTransition>
                </VStack>
            </Flex>
            <ItemVerifier isInitial={true} />
        </>
    );
}
