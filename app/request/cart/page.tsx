import { CartView } from "@/components/cart-view";
import { Flex, Text, VStack } from "@chakra-ui/react";
import { IconShoppingCart } from "@tabler/icons-react";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { ViewTransition } from "react";
import { C, MAX_W } from "@/theme/colors";

export default async function Cart() {
    await connection();

    const cookieStore = await cookies();
    const user = cookieStore.get("user")?.value ?? "";

    return (
        <Flex justify="center" bg={C.bg} w="100vw" minH="100vh" py="3rem" px="4">
            <VStack gap="3rem" w="80vw" maxW={MAX_W}>
                <VStack gap="1rem">
                    <ViewTransition name="mainIcon">
                        <Text color={C.info}>
                            <IconShoppingCart size={40} style={{ width: "min(10vw, 10vh)", height: "min(10vw, 10vh)" }} />
                        </Text>
                    </ViewTransition>
                    <ViewTransition name="mainText">
                        <Text textStyle="4xl" fontWeight="normal" color={C.ink}>Conferir pedido</Text>
                    </ViewTransition>
                </VStack>

                <ViewTransition name="mainContent">
                    <CartView userId={user} />
                </ViewTransition>
            </VStack>
        </Flex>
    );
}
