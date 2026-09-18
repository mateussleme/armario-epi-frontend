import { GetUserItemsByOrigin } from "@/api/item-data";
import { MenuItem } from "@/components/menu-item";
import { RequestList } from "@/components/request-list";
import { ORIGEM_ALMOXARIFADO } from "@/types/ItemData";
import { Flex, Text, VStack } from "@chakra-ui/react";
import { IconClipboardList } from "@tabler/icons-react";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { ViewTransition } from "react";
import { C, MAX_W } from "@/theme/colors";

export default async function Request() {
    await connection();

    const cookieStore = await cookies();
    const user = cookieStore.get("user")?.value ?? "";

    // So os itens do GES da pessoa que vem do almoxarifado. O que sai do armario
    // continua na tela de Retirada, onde a retirada e direta.
    const result = await GetUserItemsByOrigin(user, ORIGEM_ALMOXARIFADO);
    const items = result?.items ?? [];

    return (
        <Flex justify="center" bg={C.bg} w="100vw" minH="100vh" py="3rem" px="4" pb="8rem">
            <VStack gap="3rem" w="80vw" maxW={MAX_W}>
                <VStack gap="1rem">
                    <ViewTransition name="mainIcon">
                        <Text color={C.info}>
                            <IconClipboardList size={40} style={{ width: "min(10vw, 10vh)", height: "min(10vw, 10vh)" }} />
                        </Text>
                    </ViewTransition>
                    <ViewTransition name="mainText">
                        <Text textStyle="4xl" fontWeight="normal" color={C.ink}>Solicitação de Itens</Text>
                    </ViewTransition>
                </VStack>

                <ViewTransition name="mainContent">
                    <VStack gap="2rem" w="100%">
                        <RequestList items={items} detail={result?.detail} />
                        <MenuItem action="back" override="/" />
                    </VStack>
                </ViewTransition>
            </VStack>
        </Flex>
    );
}
