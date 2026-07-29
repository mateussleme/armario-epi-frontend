"use client"

import { GetItemData } from "@/api/item-data";
import { ItemData } from "@/types/ItemData";
import { AspectRatio, Box, Flex, Image, Spinner, Text, VStack } from "@chakra-ui/react"
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type StyleData = {
    background: string;
    text: string;
}

const STYLE_MAP: Record<string, StyleData> = {
    ["available"]: {
        background: "bg.success",
        text: "Disponível"
    },
    ["required"]: {
        background: "orange.emphasized",
        text: "Obrigatório retirar"
    },
    ["return"]: {
        background: "red.emphasized",
        text: "Devolver"
    },
    ["took"]: {
        background: "bg.success",
        text: "Retirado"
    },
}

export function ItemBadge({ itemId, state }: { itemId: string, state: string }) {
    const [itemData, setItemData] = useState(undefined as ItemData | undefined);
    const styleData = STYLE_MAP[state];

    useEffect(() => {
        GetItemData(itemId).then((newData) => {
            setItemData(newData);
        })
    }, [itemId]);

    return <Box
        w="100%"
        px="2rem"
        py="1rem"
        bg={styleData.background}
        borderWidth="0.1rem"
        borderColor={"border.emphasized"}
        borderRadius="xl"
    >
        <Flex gap="4" justify="space-between" align="center">
            <AspectRatio w="4.5rem" ratio={1} borderRadius={"lg"} overflow={"hidden"}>
                {itemData != undefined ?
                    <Image src={itemData.imageUri} objectFit="cover" />
                    : <Spinner borderWidth={"0.5rem"} animationDuration="1.5s" color={"fg.info"} />
                }
            </AspectRatio>
            <VStack align="end">
                <Text textStyle="3xl">{itemData != undefined ? itemData.title : "..."}</Text>
                <Text textStyle="xl" fontWeight="semibold">{styleData.text}</Text>
            </VStack>
        </Flex>
    </Box>
}