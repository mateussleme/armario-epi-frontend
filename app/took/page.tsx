import { UpdateInventory } from "@/api/controls";
import { ItemBadge } from "@/components/item-badge";
import { ItemVerifier } from "@/components/item-verifier";
import { TakeConfirm } from "@/components/take-confirm";
import { VerificationResult } from "@/types/VerificationResult";
import { AbsoluteCenter, Text, VStack } from "@chakra-ui/react";
import { IconShoppingBagCheck, IconShoppingBagX } from "@tabler/icons-react";
import { ViewTransition } from "react";

export default async function Took({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
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

    return (
        <>
            <AbsoluteCenter bg={result.valid ? "green.subtle" : "red.subtle"} w="100vw" h="100vh">
                <VStack gap="3rem" w="80vw">
                    <VStack gap="1rem">
                        <ViewTransition name="mainIcon">
                            <Text color={result.valid ? "fg.success" : "red"}>
                                {result.valid ?
                                    <IconShoppingBagCheck size={"min(10vw, 10vh)"} />
                                    : <IconShoppingBagX size={"min(10vw, 10vh)"} />
                                }
                            </Text>
                        </ViewTransition>
                        <ViewTransition name="mainText">
                            <Text textStyle="4xl" fontWeight="normal">{result.valid ? "Confirme a retirada" : "Corrija a retirada"}</Text>
                        </ViewTransition>
                    </VStack>

                    <ViewTransition name="mainContent">
                        {Object.entries(itemStates).map(function (data, i) {
                            return <ItemBadge key={i} itemId={data[0]} state={data[1]} />;
                        })}
                        {result.valid ?
                            <>
                                <TakeConfirm />
                            </> : <>
                                <Text textStyle="3xl" fontWeight="bold" textAlign="center">Abra a porta e realize a devolução ou retirada dos itens</Text>
                            </>
                        }
                    </ViewTransition>
                </VStack>
            </AbsoluteCenter>
            {!result.valid ?
                <ItemVerifier isInitial={false} />
                : undefined}
        </>
    );
}
