import { GetUser } from "@/api/users";
import { UserForm } from "@/components/user-form";
import { Flex, VStack, Text } from "@chakra-ui/react";
import { IconUserFilled } from "@tabler/icons-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { ViewTransition } from "react";
import { C, MAX_W } from "@/theme/colors";

export default async function EditUser({ params }: { params: Promise<{ userId: string }> }) {
    await connection();

    const cookieStore = await cookies();
    const user = cookieStore.get("user")?.value ?? "";
    const userData = await GetUser(user);
    if (!(userData?.admin ?? false)) {
        redirect("/");
    }

    const userId = (await params).userId;
    const editedUser = await GetUser(decodeURIComponent(userId));
    if (editedUser == undefined) {
        redirect("/restricted/users");
    }

    // Ver comentario em items/novo/page.tsx sobre o AbsoluteCenter.
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
                        <Text textStyle="4xl" fontWeight="normal" color={C.ink}>Editar usuário</Text>
                    </ViewTransition>
                </VStack>

                <ViewTransition name="mainContent">
                    <UserForm user={editedUser} />
                </ViewTransition>
            </VStack>
        </Flex>
    );
}
