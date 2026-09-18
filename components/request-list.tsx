"use client"

import { AvailableItem, RequiredDetail } from "@/api/item-data";
import { ItemData } from "@/types/ItemData";
import { Box, Grid, GridItem, Text, VStack } from "@chakra-ui/react";
import { useCart } from "@/components/cart";
import { CartBar } from "@/components/cart-bar";
import { RequestItem } from "@/components/request-item";
import { useRequiredItems } from "@/hooks/useRequiredItems";
import { C } from "@/theme/colors";

type Item = AvailableItem & { data?: ItemData };

export function RequestList({ items, detail }: { items: Item[], detail?: RequiredDetail[] }) {
    const cart = useCart();

    // Item obrigatorio vencido ja entra no carrinho travado, sem a pessoa
    // escolher. Sai da lista de baixo porque o filtro abaixo tira o que ja esta
    // no carrinho.
    useRequiredItems(items, detail ?? []);

    // O item escolhido sai da lista e vai para o carrinho. Quem tira de volta e
    // a tela do carrinho, nao esta.
    const remaining = items.filter((item) => !cart.has(item.id));

    // A barra do carrinho fica fora do if de propósito: antes, quando a lista
    // esvaziava, a tela devolvia so a mensagem e a barra sumia junto, deixando
    // a pessoa sem como chegar no carrinho.
    return <VStack gap="2rem" w="100%">
        {remaining.length > 0 ? <Grid templateColumns="repeat(6, 1fr)" gap="6" w="100%" alignItems="stretch">
            {remaining.map((item) => (
                <GridItem colSpan={2} key={item.id}>
                    <RequestItem itemId={item.id} data={item.data} />
                </GridItem>
            ))}
        </Grid> : <Box
            w="100%"
            px="2rem"
            py="2rem"
            textAlign="center"
            borderWidth="0.1rem"
            borderStyle="dashed"
            borderColor={C.line}
            borderRadius="xl"
        >
            <Text textStyle="xl" color={C.sub}>
                {items.length == 0
                    ? "Você não tem itens de almoxarifado para solicitar."
                    : "Todos os itens já estão no carrinho."}
            </Text>
        </Box>}

        <CartBar />
    </VStack>
}
