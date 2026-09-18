import { GetLocaisAtivos } from "@/api/locais";
import { GetUser } from "@/api/users";
import { ProductForm } from "@/components/product-form";
import { Flex, VStack, Text } from "@chakra-ui/react";
import { IconPlus } from "@tabler/icons-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { ViewTransition } from "react";
import { C, MAX_W } from "@/theme/colors";

export default async function NewItem() {
    await connection();

    const cookieStore = await cookies();
    const user = cookieStore.get("user")?.value ?? "";
    const userData = await GetUser(user);
    if (!(userData?.admin ?? false)) {
        redirect("/");
    }

    const locais = (await GetLocaisAtivos()) ?? [];

    // Nao usa AbsoluteCenter: ele centraliza com posicionamento absoluto, e
    // formulario e quase sempre mais alto que a tela, entao o conteudo sobra
    // para fora nas duas pontas e nao da para rolar ate o inicio nem ate o fim.
    return (
        <Flex justify="center" bg={C.bg} w="100vw" minH="100vh" py="3rem" px="4">
            <VStack gap="3rem" w="80vw" maxW={MAX_W}>
                <VStack gap="1rem">
                    <ViewTransition name="mainIcon">
                        <Text color={C.accent}>
                            <IconPlus size={40} style={{ width: "min(10vw, 10vh)", height: "min(10vw, 10vh)" }} />
                        </Text>
                    </ViewTransition>
                    <ViewTransition name="mainText">
                        <Text textStyle="4xl" fontWeight="normal" color={C.ink}>Novo produto</Text>
                    </ViewTransition>
                </VStack>

                <ViewTransition name="mainContent">
                    <ProductForm locais={locais} />
                </ViewTransition>
            </VStack>
        </Flex>
    );
}
