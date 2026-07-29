import { GetAvailableItems } from "@/api/item-data";
import { ItemBadge } from "@/components/item-badge";
import { ItemVerifier } from "@/components/item-verifier";
import { AbsoluteCenter, Text, VStack } from "@chakra-ui/react";
import { IconShoppingBag } from "@tabler/icons-react";
import { cookies } from "next/headers";
import { ViewTransition } from "react";

export default async function Take() {
    const cookieStore = await cookies();
    const user = cookieStore.get("user")?.value ?? "";
    const items = await GetAvailableItems(user);

    return (
        <>
            <AbsoluteCenter bg="green.subtle" w="100vw" h="100vh">
                <VStack gap="3rem" w="80vw">
                    <VStack gap="1rem">
                        <ViewTransition name="mainIcon">
                            <Text color={"fg.success"}>
                                <IconShoppingBag size={"min(10vw, 10vh)"} />
                            </Text>
                        </ViewTransition>
                        <ViewTransition name="mainText">
                            <Text textStyle="4xl" fontWeight="normal">Retirada de Itens</Text>
                        </ViewTransition>
                    </VStack>

                    <ViewTransition name="mainContent">
                        {(items ?? []).map(function (item, i) {
                            return <ItemBadge key={i} itemId={item.id} state={item.state} />;
                        })}
                        <Text textStyle="3xl" fontWeight="bold">Abra a porta e retire os itens</Text>
                    </ViewTransition>
                </VStack>
            </AbsoluteCenter>
            <ItemVerifier isInitial={true} />
        </>
    );
}
