import { GetLocais } from "@/api/locais";
import { GetUser } from "@/api/users";
import { LocalItem } from "@/components/local-item";
import { MenuItem } from "@/components/menu-item";
import { SearchList, SearchItem } from "@/components/search-list";
import { Flex, VStack, Text } from "@chakra-ui/react";
import { IconMapPin } from "@tabler/icons-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { ViewTransition } from "react";
import { C, MAX_W } from "@/theme/colors";

export default async function Locais() {
    await connection();

    const cookieStore = await cookies();
    const user = cookieStore.get("user")?.value ?? "";
    const userData = await GetUser(user);
    if (!(userData?.admin ?? false)) {
        redirect("/");
    }

    const locais = (await GetLocais()) ?? [];

    const searchItems: SearchItem[] = locais.map((l) => ({
        id: l.id,
        terms: `${l.id} ${l.nome} ${l.tipo}`,
        sort: l.nome,
        node: <LocalItem id={l.id} nome={l.nome} tipo={l.tipo} ativo={l.ativo} />,
    }));

    return (
        <Flex justify="center" bg={C.bg} w="100vw" minH="100vh" py="3rem" px="4">
            <VStack gap="3rem" w="80vw" maxW={MAX_W}>
                <VStack gap="1rem">
                    <ViewTransition name="mainIcon">
                        <Text color={C.accent}>
                            <IconMapPin size={40} style={{ width: "min(10vw, 10vh)", height: "min(10vw, 10vh)" }} />
                        </Text>
                    </ViewTransition>
                    <ViewTransition name="mainText">
                        <Text textStyle="4xl" fontWeight="normal" color={C.ink}>Locais</Text>
                    </ViewTransition>
                </VStack>

                <ViewTransition name="mainContent">
                    <VStack gap="1rem" w="100%">
                        <MenuItem action="newLocal" />
                        <SearchList
                            items={searchItems}
                            placeholder="Buscar por nome ou código"
                            emptyText="Nenhum local encontrado."
                        />
                        <MenuItem action="back" override="/restricted" />
                    </VStack>
                </ViewTransition>
            </VStack>
        </Flex>
    );
}
