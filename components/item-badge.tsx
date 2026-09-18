"use client"

import { GetItemData } from "@/api/item-data";
import { ItemData } from "@/types/ItemData";
import { AspectRatio, Box, Flex, Image, Spinner, Text, VStack } from "@chakra-ui/react"
import { IconAlertTriangle } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { C } from "@/theme/colors";

type StyleData = {
    background: string;
    border: string;
    textColor: string;
    text: string;
}

const STYLE_MAP: Record<string, StyleData> = {
    ["available"]: {
        background: C.successSoft,
        border: C.success,
        textColor: C.successInk,
        text: "Disponível"
    },
    ["required"]: {
        background: C.warningSoft,
        border: C.warning,
        textColor: C.warningInk,
        text: "Obrigatório retirar"
    },
    ["return"]: {
        background: C.dangerSoft,
        border: C.danger,
        textColor: C.dangerInk,
        text: "Devolver"
    },
    ["took"]: {
        background: C.successSoft,
        border: C.success,
        textColor: C.successInk,
        text: "Retirado"
    },
}

export function ItemBadge({ itemId, state }: { itemId: string, state: string }) {
    const [itemData, setItemData] = useState<ItemData | undefined>(undefined);
    const [loading, setLoading] = useState(true); // NOVO: Estado para controlar o spinner
    
    const styleData = STYLE_MAP[state];
    
    // Se não estiver carregando e não tiver item, é um item excluído ("fantasma")
    const isGhostItem = !loading && itemData == undefined;

    useEffect(() => {
        setLoading(true);
        GetItemData(itemId).then((newData) => {
            setItemData(newData);
            setLoading(false); // Desliga o spinner quando a resposta chega (mesmo se for undefined)
        })
    }, [itemId]);

    return <Box
        w="100%"
        p="1rem"
        // Se for fantasma, deixa o card neutro e levemente transparente
        bg={isGhostItem ? C.surfaceHover : styleData.background}
        borderWidth="0.1rem"
        borderColor={isGhostItem ? C.line : styleData.border}
        borderRadius="xl"
        opacity={isGhostItem ? 0.6 : 1}
    >
        <VStack gap="3" w="100%">
            <AspectRatio w="100%" ratio={1} borderRadius={"lg"} overflow={"hidden"} bg={C.surface}>
                {loading ? (
                    <Spinner borderWidth={"0.4rem"} animationDuration="1.5s" color={C.accent} />
                ) : itemData != undefined ? (
                    itemData.imageUri != "" ? (
                        <Image src={itemData.imageUri} alt={itemData.title} objectFit="cover" />
                    ) : <Box />
                ) : (
                    // Ícone de alerta caso a imagem/produto não exista mais
                    <Flex align="center" justify="center" w="100%" h="100%" color={C.sub}>
                        <IconAlertTriangle size={40} stroke={1.5} />
                    </Flex>
                )}
            </AspectRatio>
            
            <VStack gap="0" w="100%">
                <Text textStyle="xl" textAlign="center" color={isGhostItem ? C.sub : C.ink} lineClamp={2}>
                    {loading ? "Buscando..." : itemData != undefined ? itemData.title : "Produto excluído"}
                </Text>
                
                {isGhostItem ? (
                     <Text textStyle="sm" fontWeight="semibold" textAlign="center" color={C.sub}>
                         Não encontrado
                     </Text>
                ) : (
                    <Text textStyle="sm" fontWeight="semibold" textAlign="center" color={styleData.textColor}>
                        {styleData.text}
                    </Text>
                )}
            </VStack>
        </VStack>
    </Box>
}