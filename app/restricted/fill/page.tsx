import { GetAllItems, GetItemData } from "@/api/item-data";
import { GetUser } from "@/api/users";
import { InfoItem } from "@/components/info-item";
import { MenuItem } from "@/components/menu-item";
import { SearchGrid, SearchItem } from "@/components/search-grid";
import { Flex, VStack, Text, Button } from "@chakra-ui/react";
import { IconForklift, IconArrowBackUp } from "@tabler/icons-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { ViewTransition } from "react";
import { C, MAX_W } from "@/theme/colors";

export default async function Fill() {
    await connection();

    const cookieStore = await cookies();
    const user = cookieStore.get("user")?.value ?? "";
    const userData = await GetUser(user);
    if (!(userData?.admin ?? false)) {
        redirect("/");
    }
    // Busca os dados aqui no servidor para a busca por nome funcionar.
    //
    // A busca e por codigo e descricao, nao por endereco: o endereco muda quando
    // o armario e reorganizado, e ninguem decora posicao.
    const searchItems: SearchItem[] = [];
    for (const item of await GetAllItems()) {
        const data = await GetItemData(item);
        searchItems.push({
            id: item,
            terms: [item, data?.title ?? "", data?.description ?? ""].join(" "),
            sort: data?.title ?? item,
            node: <InfoItem itemId={item} override={`/restricted/fill/${item}`} data={data} />,
        });
    }

    return (
        <Flex justify="center" bg={C.bg} w="100vw" minH="100vh" py="3rem" px="4">
            <VStack gap="3rem" w="80vw" maxW={MAX_W}>
                <VStack gap="1rem">
                    <ViewTransition name="mainIcon">
                        <Text color={C.warning}>
                            <IconForklift size={40} style={{ width: "min(10vw, 10vh)", height: "min(10vw, 10vh)" }} />
                        </Text>
                    </ViewTransition>
                    <ViewTransition name="mainText">
                        <Text textStyle="4xl" fontWeight="normal" color={C.ink}>Abastecer</Text>
                    </ViewTransition>
                </VStack>

                <ViewTransition name="mainContent">
                    <VStack gap="1.5rem" w="100%">
                        <SearchGrid
                            items={searchItems}
                            placeholder="Buscar por código ou descrição"
                            emptyText="Nenhum produto encontrado."
                        />
                        <MenuItem action="back" override="/restricted" />
                    </VStack>
                </ViewTransition>
            </VStack>
        </Flex>
    );
}
