"use client"

import { Button, Flex, Text } from "@chakra-ui/react";
import { IconShoppingCart } from "@tabler/icons-react";
import Link from "next/link";
import { useCart } from "@/components/cart";
import { C } from "@/theme/colors";

// Barra fixa no rodape mostrando quantos itens estao no carrinho. So aparece
// quando tem algo, para nao ocupar espaco a toa.
export function CartBar() {
    const cart = useCart();

    if (cart.items.length == 0) {
        return undefined;
    }

    const count = cart.items.length;

    return <Flex
        position="fixed"
        bottom="0"
        left="0"
        right="0"
        zIndex={30}
        justify="center"
        p="1rem"
        bg={C.surface}
        borderTopWidth="0.1rem"
        borderColor={C.line}
        boxShadow="0 -4px 16px rgba(0,0,0,0.12)"
    >
        <Flex w="80vw" maxW="42rem" align="center" justify="space-between" gap="4">
            <Text textStyle="xl" color={C.ink}>
                {count} {count == 1 ? "item escolhido" : "itens escolhidos"}
            </Text>
            <Link href="/request/cart">
                <Button size="xl" bg={C.accent} color="white" _hover={{ filter: "brightness(0.95)" }}>
                    <IconShoppingCart /> Ver carrinho
                </Button>
            </Link>
        </Flex>
    </Flex>
}
