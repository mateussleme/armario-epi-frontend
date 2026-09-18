"use client"

import { ItemData } from "@/types/ItemData";
import { AspectRatio, Box, Image, Text, VStack } from "@chakra-ui/react"
import { IconAlertTriangle, IconPlus } from "@tabler/icons-react";
import { useCart } from "@/components/cart";
import { C } from "@/theme/colors";

// Tile da tela de Solicitacao. Tocar coloca no carrinho e o item sai da lista;
// para tirar, a pessoa usa a tela do carrinho.
export function RequestItem({ itemId, data }: { itemId: string, data?: ItemData }) {
    const cart = useCart();
    const notFound = data == undefined;

    function add() {
        if (notFound) {
            return;
        }

        cart.add({ id: itemId, data });
    }

    return <Box
        as="button"
        w="100%"
        p="1rem"
        bg={C.surface}
        borderWidth="0.1rem"
        borderColor={C.line}
        borderRadius="xl"
        cursor={notFound ? "default" : "pointer"}
        opacity={notFound ? 0.6 : 1}
        _hover={notFound ? undefined : { borderColor: C.accent, bg: C.surfaceHover }}
        onClick={add}
    >
        <VStack gap="3" w="100%">
            <Box position="relative" w="100%">
                <AspectRatio w="100%" ratio={1} borderRadius={"lg"} overflow={"hidden"} bg={C.surface}>
                    {notFound ? <Box color={C.faint}><IconAlertTriangle size={40} /></Box>
                        : (data.imageUri != "" ? <Image src={data.imageUri} alt={data.title} objectFit="cover" /> : <Box />)
                    }
                </AspectRatio>

                {notFound ? undefined : <Box
                    position="absolute"
                    top="0.5rem"
                    right="0.5rem"
                    p="0.4rem"
                    borderRadius="full"
                    bg={C.surface}
                    borderWidth="0.1rem"
                    borderColor={C.line}
                    color={C.sub}
                >
                    <IconPlus size={18} />
                </Box>}
            </Box>

            <Text textStyle="xl" textAlign="center" color={notFound ? C.sub : C.ink} lineClamp={2}>
                {notFound ? itemId : data.title}
            </Text>
        </VStack>
    </Box>
}
