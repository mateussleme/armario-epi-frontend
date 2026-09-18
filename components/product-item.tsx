"use client"
import { GetItemData } from "@/api/item-data";
import { ItemData } from "@/types/ItemData";
import { AspectRatio, Box, Flex, Image, Spinner, Stack, Text } from "@chakra-ui/react"
import Link from "next/link";
import { useEffect, useState } from "react";
import { C } from "@/theme/colors";

// O `data` e opcional: quando a pagina ja carregou os dados no servidor (que e o
// caso da lista, por causa da busca), passa pronto e evita uma chamada a mais.
// Quando nao vem, o componente busca sozinho.
export function ProductItem({ itemId, quantity, data }: { itemId: string, quantity?: number, data?: ItemData }) {
    const [isHovering, setHovering] = useState(false);
    const [itemData, setItemData] = useState(data);

    useEffect(() => {
        if (data != undefined) {
            return;
        }

        GetItemData(itemId).then((newData) => {
            setItemData(newData);
        })
    }, [itemId, data]);

    // Linha de baixo: codigo, porta, endereco e estoque, separados por ponto.
    // Porta e endereco so aparecem quando estao preenchidos.
    const detalhes = [itemId];
    if (itemData?.porta != undefined && itemData.porta > 0) {
        detalhes.push(`Porta ${itemData.porta}`);
    }
    if (itemData?.endereco) {
        detalhes.push(itemData.endereco);
    }
    if (quantity != undefined) {
        detalhes.push(`${quantity} uni.`);
    }

    return <Link href={"/restricted/items/" + encodeURIComponent(itemId)} style={{ width: "100%" }}>
        <Box
            w="100%"
            px="2rem"
            py="1rem"
            bg={isHovering ? C.surfaceHover : C.surface}
            borderWidth="0.1rem"
            borderColor={isHovering ? C.accent : C.line}
            borderRadius="xl"
            onMouseEnter={() => { setHovering(true) }}
            onMouseLeave={() => { setHovering(false) }}
        >
            <Flex gap="4" justify="space-between" align="center">
                <AspectRatio w="4.5rem" ratio={1} borderRadius={"lg"} overflow={"hidden"}>
                    {itemData != undefined ?
                        <Image src={itemData.imageUri} alt={itemData.title} objectFit="cover" />
                        : <Spinner borderWidth={"0.5rem"} animationDuration="1.5s" color={C.accent} />
                    }
                </AspectRatio>
                <Stack gap="0" align="end">
                    <Text textStyle="3xl" color={C.ink}>{itemData != undefined ? itemData.title : "..."}</Text>
                    <Text textStyle="lg" color={C.sub}>{detalhes.join(" · ")}</Text>
                </Stack>
            </Flex>
        </Box>
    </Link>
}
