"use client"

import { Box, Flex, Grid, GridItem, Input, Text, VStack } from "@chakra-ui/react";
import { IconSearch } from "@tabler/icons-react";
import { ReactNode, useMemo, useState } from "react";
import { C } from "@/theme/colors";

export type SearchItem = {
    // Ver comentario em search-list.tsx sobre a importancia do id.
    id: string;
    terms: string;
    sort: string;
    node: ReactNode;
};

function normalize(value: string) {
    return value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

// Mesma ideia do SearchList, mas para as telas em grade (abastecimento,
// instrucoes, retirada), onde os itens sao tiles e nao linhas.
export function SearchGrid({
    items,
    placeholder = "Buscar...",
    emptyText = "Nada encontrado.",
}: {
    items: SearchItem[];
    placeholder?: string;
    emptyText?: string;
}) {
    const [query, setQuery] = useState("");

    const filtered = useMemo(() => {
        // Ordem alfabetica sempre. localeCompare cuida dos acentos.
        const sorted = [...items].sort((a, b) => a.sort.localeCompare(b.sort, "pt-BR"));

        const q = normalize(query.trim());
        if (q == "") {
            return sorted;
        }

        const words = q.split(/\s+/);
        return sorted.filter((item) => {
            const terms = normalize(item.terms);
            return words.every((word) => terms.includes(word));
        });
    }, [items, query]);

    return <VStack gap="1.5rem" w="100%">
        <Flex
            w="100%"
            align="center"
            gap="3"
            px="1.5rem"
            py="0.75rem"
            bg={C.surface}
            borderWidth="0.1rem"
            borderColor={C.line}
            borderRadius="xl"
        >
            <Box color={C.faint} flexShrink={0}>
                <IconSearch size={22} />
            </Box>
            <Input
                value={query}
                onChange={(event) => { setQuery(event.currentTarget.value) }}
                placeholder={placeholder}
                variant="flushed"
                border="none"
                px="0"
                textStyle="xl"
                color={C.ink}
                _focus={{ boxShadow: "none" }}
            />
        </Flex>

        {filtered.length == 0 ? <Box
            w="100%"
            px="2rem"
            py="2rem"
            textAlign="center"
            borderWidth="0.1rem"
            borderStyle="dashed"
            borderColor={C.line}
            borderRadius="xl"
        >
            <Text textStyle="xl" color={C.sub}>{emptyText}</Text>
        </Box> : undefined}

        <Grid templateColumns="repeat(6, 1fr)" gap="6" w="100%" alignItems="stretch">
            {filtered.map((item) => (
                <GridItem colSpan={2} key={item.id}>{item.node}</GridItem>
            ))}
        </Grid>
    </VStack>
}
