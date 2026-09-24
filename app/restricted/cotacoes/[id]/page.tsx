import { GetUser } from "@/api/users";
import { CotacaoView } from "@/components/cotacao-view";
import { Flex, VStack } from "@chakra-ui/react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { ViewTransition } from "react";
import { C, MAX_W } from "@/theme/colors";

// A cotacao. O cabecalho e os dois grids ficam no componente cliente porque os
// dados ainda sao mockados no navegador; aqui so fica a autenticacao.
export default async function CotacaoPage({ params }: { params: Promise<{ id: string }> }) {
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
                    <CotacaoView id={id} />
                </ViewTransition>
            </VStack>
        </Flex>
    );
}
