import { GetUser, GetUsers } from "@/api/users";
import { MenuItem } from "@/components/menu-item";
import { UserItem } from "@/components/user-item";
import { SearchList, SearchItem } from "@/components/search-list";
import { Flex, VStack, Text } from "@chakra-ui/react";
import { IconUserFilled } from "@tabler/icons-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { ViewTransition } from "react";
import { C, MAX_W } from "@/theme/colors";

export default async function Users() {
    await connection();

    const cookieStore = await cookies();
    const user = cookieStore.get("user")?.value ?? "";
    const userData = await GetUser(user);
    if (!(userData?.admin ?? false)) {
        redirect("/");
    }

    const users = await GetUsers();
    if (users == undefined) {
        redirect("/");
    }

    const searchItems: SearchItem[] = users.map((u) => ({
        id: u.id,
        terms: `${u.id} ${u.name}`,
        sort: u.name,
        node: <UserItem userId={u.id} userName={u.name} />,
    }));

    // Ver comentario em restricted/items/page.tsx sobre o AbsoluteCenter.
    return (
        <Flex justify="center" bg={C.bg} w="100vw" minH="100vh" py="3rem" px="4">
            <VStack gap="3rem" w="80vw" maxW={MAX_W}>
                <VStack gap="1rem">
                    <ViewTransition name="mainIcon">
                        <Text color={C.accent}>
                            <IconUserFilled size={40} style={{ width: "min(10vw, 10vh)", height: "min(10vw, 10vh)" }} />
                        </Text>
                    </ViewTransition>
                    <ViewTransition name="mainText">
                        <Text textStyle="4xl" fontWeight="normal" color={C.ink}>Usuários</Text>
                    </ViewTransition>
                </VStack>

                <ViewTransition name="mainContent">
                    <VStack gap="1rem" w="100%">
                        <MenuItem action="newUser" />
                        <SearchList
                            items={searchItems}
                            placeholder="Buscar por nome ou matrícula"
                            emptyText="Nenhum usuário encontrado."
                        />
                        <MenuItem action="back" override="/restricted" />
                    </VStack>
                </ViewTransition>
            </VStack>
        </Flex>
    );
}
