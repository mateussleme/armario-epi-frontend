import { GetItemData, GetUserItems } from "@/api/item-data";
import { ItemBadge } from "@/components/item-badge";
import { ItemVerifier } from "@/components/item-verifier";
import { RequiredAlert, RequiredWarning } from "@/components/required-alert";
import { requiredReason } from "@/types/Required";
import { TakeConfirm } from "@/components/take-confirm";
import { VerificationResult } from "@/types/VerificationResult";
import { Flex, Grid, GridItem, Text, VStack } from "@chakra-ui/react";
import { IconShoppingBagCheck, IconShoppingBagX } from "@tabler/icons-react";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { ViewTransition } from "react";
import { C, MAX_W } from "@/theme/colors";

export default async function Took({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    await connection();

    const cookieStore = await cookies();
    const user = cookieStore.get("user")?.value ?? "";

    const resultRaw = (await searchParams).result ?? "0";
    const resultJson = (Array.isArray(resultRaw) ? resultRaw[0] : resultRaw);
    const result = JSON.parse(resultJson) as VerificationResult;

    const itemStates = {} as Record<string, string>;
    for (const [id, state] of Object.entries(result.availableItems)) {
        if (state == "required") {
            itemStates[id] = state;
        }
    }

    for (const [id, count] of Object.entries(result.itemsChanged)) {
        if (result.availableItems[id] && count >= -1) {
            itemStates[id] = "took";
        } else {
            itemStates[id] = "return";
        }
    }

    // O que continua "required" aqui e item obrigatorio que a pessoa nao pegou.
    // Avisar na confirmacao e o ultimo momento em que da para resolver sozinho,
    // antes de virar caso de notificar o superior.
    const pendentes = Object.entries(itemStates)
        .filter(([, state]) => state == "required")
        .map(([id]) => id);

    const warnings: RequiredWarning[] = [];
    if (pendentes.length > 0) {
        const userItems = await GetUserItems(user);
        const detailByProduct = new Map((userItems?.detail ?? []).map((d) => [d.produto, d]));

        for (const id of pendentes) {
            const data = await GetItemData(id);
            const detail = detailByProduct.get(id);

            warnings.push({
                id,
                title: data?.title ?? id,
                reason: detail != undefined
                    ? requiredReason(detail.diasValidade, detail.diasDesdeUso)
                    : "obrigatório no seu grupo",
            });
        }
    }

    return (
        <>
            <Flex justify="center" bg={C.bg} w="100vw" minH="100vh" py="3rem" px="4">
                <VStack gap="3rem" w="80vw" maxW={MAX_W}>
                    <VStack gap="1rem">
                        <ViewTransition name="mainIcon">
                            <Text color={result.valid ? C.success : C.danger}>
                                {result.valid ?
                                    <IconShoppingBagCheck size={40} style={{ width: "min(10vw, 10vh)", height: "min(10vw, 10vh)" }} />
                                    : <IconShoppingBagX size={40} style={{ width: "min(10vw, 10vh)", height: "min(10vw, 10vh)" }} />
                                }
                            </Text>
                        </ViewTransition>
                        <ViewTransition name="mainText">
                            <Text textStyle="4xl" fontWeight="normal" color={C.ink}>{result.valid ? "Confirme a retirada" : "Corrija a retirada"}</Text>
                        </ViewTransition>
                    </VStack>

                    <ViewTransition name="mainContent">
                        <VStack gap="2rem" w="100%">
                            <RequiredAlert
                                items={warnings}
                                title={warnings.length == 1
                                    ? "Você está saindo sem retirar este item obrigatório"
                                    : `Você está saindo sem retirar ${warnings.length} itens obrigatórios`}
                            />

                            <Grid templateColumns="repeat(6, 1fr)" gap="6" w="100%" alignItems="stretch">
                                {Object.entries(itemStates).map(function (data, i) {
                                    return (
                                        <GridItem colSpan={2} key={i}>
                                            <ItemBadge itemId={data[0]} state={data[1]} />
                                        </GridItem>
                                    );
                                })}
                            </Grid>
                            {result.valid ?
                                <TakeConfirm
                                    userId={user}
                                    taken={Object.entries(itemStates)
                                        .filter(([, state]) => state == "took")
                                        .map(([id]) => id)}
                                />
                                : <Text textStyle="3xl" fontWeight="bold" textAlign="center" color={C.dangerInk}>Abra a porta e realize a devolução ou retirada dos itens</Text>
                            }
                        </VStack>
                    </ViewTransition>
                </VStack>
            </Flex>
            {!result.valid ?
                <ItemVerifier isInitial={false} />
                : undefined}
        </>
    );
}
