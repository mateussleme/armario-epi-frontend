import { GetLocal } from "@/api/locais";
import { GetUser } from "@/api/users";
import { LocalForm } from "@/components/local-form";
import { Flex, VStack, Text } from "@chakra-ui/react";
import { IconMapPin } from "@tabler/icons-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { ViewTransition } from "react";
import { C, MAX_W } from "@/theme/colors";

export default async function EditLocal({ params }: { params: Promise<{ localId: string }> }) {
    await connection();

    const cookieStore = await cookies();
    const user = cookieStore.get("user")?.value ?? "";
    const userData = await GetUser(user);
    if (!(userData?.admin ?? false)) {
        redirect("/");
    }

    const localId = decodeURIComponent((await params).localId);
    const local = await GetLocal(localId);
    if (local == undefined) {
        redirect("/restricted/locais");
    }

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
                        <Text textStyle="4xl" fontWeight="normal" color={C.ink}>Editar local</Text>
                    </ViewTransition>
                </VStack>

                <ViewTransition name="mainContent">
                    <LocalForm local={local} />
                </ViewTransition>
            </VStack>
        </Flex>
    );
}
