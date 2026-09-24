import { GetUser } from "@/api/users";
import { CotacaoValores } from "@/components/cotacao-valores";
import { Flex, VStack } from "@chakra-ui/react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { ViewTransition } from "react";
import { C, MAX_W } from "@/theme/colors";

// Preenchimento dos valores da cotacao, um fornecedor por vez.
export default async function CotacaoValoresPage({ params }: { params: Promise<{ id: string }> }) {
    await connection();

    const cookieStore = await cookies();
    const user = cookieStore.get("user")?.value ?? "";
    const userData = await GetUser(user);
    if (!(userData?.admin ?? false)) {
        redirect("/");
    }

    const id = Number(decodeURIComponent((await params).id));
    if (isNaN(id)) {
        redirect("/restricted/cotacoes");
    }

    return (
        <Flex justify="center" bg={C.bg} w="100vw" minH="100vh" py="2rem" px="4">
            <VStack gap="1.5rem" w="90vw" maxW={MAX_W}>
                <ViewTransition name="mainContent">
                    <CotacaoValores id={id} />
                </ViewTransition>
            </VStack>
        </Flex>
    );
}
