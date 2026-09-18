"use client"

import { Box, Flex, Input, Text, VStack } from "@chakra-ui/react";
import { IconSearch } from "@tabler/icons-react";
import { ReactNode, useMemo, useState } from "react";
import { C } from "@/theme/colors";

export type SearchItem = {
    // Identificador estavel do item. Usado como key da lista: sem isso o React
    // reaproveita o componente errado quando a lista e filtrada, e o item
    // aparece com os dados de outro.
    id: string;
    // Texto usado na busca. Junta tudo que faz sentido procurar (codigo,
    // descricao...), montado por quem usa o componente.
    terms: string;
    // Texto usado para ordenar. Normalmente o nome do item.
    sort: string;
    node: ReactNode;
};

// Normaliza para a busca ignorar acento e maiuscula: procurar por "oculos"
// encontra "Óculos".
function normalize(value: string) {
    return value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

// Campo de busca por palavra, usado nas telas de lista. A lista chega pronta do
// servidor e a filtragem acontece aqui, sem nova ida ao backend a cada tecla.
export function SearchList({
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
        // Ordem alfabetica sempre, com ou sem busca. localeCompare cuida dos
        // acentos: "Óculos" fica junto do "O", nao no fim da lista.
        const sorted = [...items].sort((a, b) => a.sort.localeCompare(b.sort, "pt-BR"));

        const q = normalize(query.trim());
        if (q == "") {
            return sorted;
        }

        // Cada palavra digitada precisa aparecer, em qualquer ordem: "luva nitr"
        // encontra "Luva nitrílica".
        const words = q.split(/\s+/);
        return sorted.filter((item) => {
            const terms = normalize(item.terms);
            return words.every((word) => terms.includes(word));
        });
    }, [items, query]);

    return <VStack gap="1rem" w="100%">
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

        {filtered.map((item) => (
            <Box key={item.id} w="100%">{item.node}</Box>
        ))}
    </VStack>
}
