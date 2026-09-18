"use client"

import { GetItemData } from "@/api/item-data";
import { ItemData } from "@/types/ItemData";
import { AspectRatio, Box, Image, Spinner, Stack, Text } from "@chakra-ui/react"
import Link from "next/link"
import { useEffect, useState } from "react";
import { C } from "@/theme/colors";

// O `data` e opcional: quando a pagina ja carregou os dados no servidor (por
// causa da busca), passa pronto e evita uma chamada a mais. Sem ele, o
// componente busca sozinho, como antes.
export function InfoItem({ itemId, override, data }: { itemId: string, override?: string, data?: ItemData }) {
    const [isHovering, setHovering] = useState(false);
    const [itemData, setItemData] = useState(data);

    useEffect(() => {
        if (data != undefined) {
            return;
        }

        GetItemData(itemId).then((newData) => {
            setItemData(newData);
        })
    }, [itemId, data])

    return <Link href={override ?? `/instructions/${itemId}`} style={{ width: "100%" }}>
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
            <Stack align={"center"} gap="6">
                <AspectRatio w="100%" ratio={1} borderRadius={"lg"} overflow={"hidden"}>
                    {itemData != undefined ?
                        <Image src={itemData.imageUri} alt={itemData.title} objectFit="cover" />
                        : <Spinner borderWidth={"0.5rem"} animationDuration="1.5s" color={C.accent} />
                    }
                </AspectRatio>
                <Text textStyle="xl" textAlign={"center"} color={C.ink}>{itemData != undefined ? itemData.title : "..."}</Text>
            </Stack>
        </Box>
    </Link>
}
