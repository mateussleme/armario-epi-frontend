"use client"

import { Cotacao, ListCotacoes, STATUS_ABERTA, STATUS_FECHADA, dataHora, statusLabel } from "@/api/cotacoes";
import { Badge, Box, Flex, Text, VStack } from "@chakra-ui/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { C } from "@/theme/colors";

// Cor do status, para dar para ler a fila de longe: aberta ainda nao foi
// enviada, pendente espera retorno do fornecedor, fechada ja tem os valores.
function estilo(status: string) {
    if (status == STATUS_ABERTA) {
        return { bg: C.surfaceHover, border: C.faint, ink: C.sub };
    }
    if (status == STATUS_FECHADA) {
        return { bg: C.successSoft, border: C.success, ink: C.successInk };
    }
    return { bg: C.warningSoft, border: C.warning, ink: C.warningInk };
}

// As cotacoes ja montadas. Mesma tela dos itens a cotar porque e o mesmo
// trabalho: quem acabou de montar uma quer entrar nela em seguida.
export function CotacoesList() {
    const [cotacoes, setCotacoes] = useState<Cotacao[] | undefined>(undefined);

    useEffect(() => {
        // Timeout pelo mesmo motivo do resto do projeto: setState direto no
        // corpo do efeito dispara render em cascata.
        const primeira = setTimeout(() => { setCotacoes(ListCotacoes()) }, 0);
        return () => { clearTimeout(primeira) };
    }, []);

    if (cotacoes == undefined || cotacoes.length == 0) {
        return undefined;
    }

    return <VStack gap="0.5rem" w="100%" align="stretch">
        <Text fontSize="1.05rem" color={C.sub} px="0.25rem">Cotações</Text>

        {cotacoes.map((cotacao) => {
            const e = estilo(cotacao.status);

            return <Link
                key={cotacao.id}
                href={"/restricted/cotacoes/" + String(cotacao.id)}
                style={{ width: "100%" }}
            >
                <Flex
                    align="center"
                    gap="3"
                    px="1rem"
                    py="0.7rem"
                    bg={e.bg}
                    borderWidth="0.1rem"
                    borderColor={e.border}
                    borderRadius="lg"
                    _hover={{ borderColor: C.accent }}
                >
                    <Box flex="1" minW="0">
                        <Text fontSize="1.05rem" color={C.ink}>
                            Cotação {cotacao.numero} · {cotacao.empresa}
                        </Text>
                        <Text fontSize="0.85rem" color={C.sub}>
                            {dataHora(cotacao.criacao)} · {cotacao.itens.length}{" "}
                            {cotacao.itens.length == 1 ? "item" : "itens"} · {cotacao.fornecedores.length}{" "}
                            {cotacao.fornecedores.length == 1 ? "fornecedor" : "fornecedores"}
                        </Text>
                    </Box>

                    <Badge bg={e.border} color="white" px="2.5" py="1" borderRadius="md" fontSize="0.8rem">
                        {statusLabel(cotacao.status).toUpperCase()}
                    </Badge>
                </Flex>
            </Link>
        })}
    </VStack>
}
