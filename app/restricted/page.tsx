import { GetUser } from "@/api/users";
import { MenuItem } from "@/components/menu-item";
import { Flex, VStack, Text } from "@chakra-ui/react";
import { IconShieldFilled } from "@tabler/icons-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { ViewTransition } from "react";
import { C, MAX_W } from "@/theme/colors";

export default async function Restricted() {
    await connection();

    const cookieStore = await cookies();
    const user = cookieStore.get("user")?.value ?? "";
    const userData = await GetUser(user);
    if (!(userData?.admin ?? false)) {
        redirect("/");
    }

    return (
        <Flex justify="center" bg={C.bg} w="100vw" minH="100vh" py="3rem" px="4">
            <VStack gap="3rem" w="80vw" maxW={MAX_W}>
                <VStack gap="1rem">
                    <ViewTransition name="mainIcon">
                        <Text color={C.accent}>
                            <IconShieldFilled size={40} style={{ width: "min(10vw, 10vh)", height: "min(10vw, 10vh)" }} />
                        </Text>
                    </ViewTransition>
                    <ViewTransition name="mainText">
                        <Text textStyle="4xl" fontWeight="normal" color={C.ink}>Gerenciamento</Text>
                    </ViewTransition>
                </VStack>

                <ViewTransition name="mainContent">
                    <MenuItem action="users" />
                    <MenuItem action="groups" />
                    <MenuItem action="items" />
                    <MenuItem action="separacao" />
                    <MenuItem action="fill" />
                    <MenuItem action="locais" />
                    <MenuItem action="leave" />
                </ViewTransition>
            </VStack>
        </Flex>
    );
}
