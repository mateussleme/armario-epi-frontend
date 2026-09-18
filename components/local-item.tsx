"use client"
import { labelTipo } from "@/types/Local";
import { Box, Flex, Stack, Text } from "@chakra-ui/react"
import Link from "next/link";
import { useState } from "react";
import { C } from "@/theme/colors";

export function LocalItem({
    id,
    nome,
    tipo,
    ativo,
}: {
    id: string;
    nome: string;
    tipo: string;
    ativo: boolean;
}) {
    const [isHovering, setHovering] = useState(false);

    return <Link href={"/restricted/locais/" + encodeURIComponent(id)} style={{ width: "100%" }}>
        <Box
            w="100%"
            px="2rem"
            py="1rem"
            bg={isHovering ? C.surfaceHover : C.surface}
            borderWidth="0.1rem"
            borderColor={isHovering ? C.accent : C.line}
            borderRadius="xl"
            opacity={ativo ? 1 : 0.6}
            onMouseEnter={() => { setHovering(true) }}
            onMouseLeave={() => { setHovering(false) }}
        >
            <Flex gap="4" justify="space-between" align="center">
                <Stack gap="0">
                    <Text textStyle="sm" color={C.sub}>{id}</Text>
                    {!ativo ? <Text textStyle="sm" color={C.warning}>Desativado</Text> : undefined}
                </Stack>
                <Stack gap="0" align="end">
                    <Text textStyle="3xl" color={C.ink}>{nome}</Text>
                    <Text textStyle="lg" color={C.sub}>{labelTipo(tipo)}</Text>
                </Stack>
            </Flex>
        </Box>
    </Link>
}
