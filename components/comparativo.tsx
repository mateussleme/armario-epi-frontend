"use client"

import {
    Comparativo,
    Cotacao,
    FornecedorNome,
    GetCotacao,
    ItensVencidos,
    SetVencedor,
    SetVencedorFornecedor,
    TotalMelhorCombinacao,
    TotalSeLevarTudo,
    ItensSemValor,
    decimal,
    moeda,
} from "@/api/cotacoes";
import { MenuItem } from "@/components/menu-item";
import { Badge, Box, Button, Flex, Text, VStack } from "@chakra-ui/react";
import { IconTrophy } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { C } from "@/theme/colors";

// Comparativo da cotacao: a ferramenta auxiliar que o comprador usa para
// decidir. Por item, o que cada fornecedor cobrou, com o melhor preco em
// destaque, e o vencedor marcavel ali mesmo.
//
// Em cima, os dois numeros que interessam: quanto sairia com um fornecedor so
// levando tudo, e quanto sairia comprando cada item de quem cobrou menos.
export function ComparativoView({ id }: { id: number }) {
    const [cotacao, setCotacao] = useState<Cotacao | undefined>(undefined);
    const [carregado, setCarregado] = useState(false);

    useEffect(() => {
        // Timeout pelo mesmo motivo do resto do projeto: setState direto no
        // corpo do efeito dispara render em cascata.
        const primeira = setTimeout(() => {
            setCotacao(GetCotacao(id));
            setCarregado(true);
        }, 0);

        return () => { clearTimeout(primeira) };
    }, [id]);

    function recarregar() {
        setCotacao(GetCotacao(id));
    }

    if (!carregado) {
        return <Text fontSize="1.05rem" color={C.sub}>Carregando...</Text>
    }

    if (cotacao == undefined) {
        return <VStack gap="1rem" w="100%">
            <Text fontSize="1.05rem" color={C.sub}>
                Cotação não encontrada. Os dados da demonstração se perdem ao recarregar a página.
            </Text>
            <MenuItem action="back" override="/restricted/cotacoes" />
        </VStack>
    }

    const atual = cotacao;
    const linhas = Comparativo(atual);
    const melhorTotal = TotalMelhorCombinacao(atual);

    return <VStack gap="1.25rem" w="100%" align="stretch">
        <Flex align="baseline" gap="3" wrap="wrap">
            <Text fontSize="1.35rem" color={C.ink}>Cotação {atual.numero}</Text>
            <Text fontSize="0.95rem" color={C.sub}>comparativo</Text>
        </Flex>

        {/* Resumo por fornecedor: quanto sairia se ele levasse a cotacao
            inteira. Quem deixou item sem preco nao atende tudo, e isso aparece
            na linha. */}
        <VStack gap="0.5rem" align="stretch">
            <Text fontSize="1.05rem" color={C.sub} px="0.25rem">Se um fornecedor levar tudo</Text>

            {atual.fornecedores.map((fornecedor) => {
                const falta = ItensSemValor(atual, fornecedor.fornecedor);
                const total = TotalSeLevarTudo(atual, fornecedor.fornecedor);
                const vencidos = ItensVencidos(atual, fornecedor.fornecedor);

                return <Flex
                    key={fornecedor.fornecedor}
                    align="center"
                    gap="3"
                    px="1rem"
                    py="0.7rem"
                    bg={C.surface}
                    borderWidth="0.1rem"
                    borderColor={vencidos > 0 ? C.success : C.line}
                    borderRadius="lg"
                >
                    <Box flex="1" minW="0">
                        <Text fontSize="1.05rem" color={C.ink} lineClamp={2}>
                            {FornecedorNome(fornecedor.fornecedor)}
                        </Text>
                        <Text fontSize="0.85rem" color={falta > 0 ? C.warningInk : C.sub}>
                            {falta > 0
                                ? `não cotou ${falta} ${falta == 1 ? "item" : "itens"}`
                                : "cotou todos os itens"}
                            {vencidos > 0 ? ` · vence ${vencidos}` : ""}
                        </Text>
                    </Box>

                    <Flex align="center" gap="2" flexShrink={0}>
                        <Text fontSize="1.05rem" color={falta > 0 ? C.faint : C.ink} whiteSpace="nowrap">
                            {moeda(total)}
                        </Text>
                        {falta == 0 ? <Button
                            size="sm"
                            variant="outline"
                            bg={C.surface}
                            color={C.successInk}
                            borderColor={C.success}
                            onClick={() => {
                                SetVencedorFornecedor(atual.id, fornecedor.fornecedor, true);
                                recarregar();
                            }}
                        >
                            Levar tudo
                        </Button> : undefined}
                    </Flex>
                </Flex>
            })}

            <Flex
                align="center"
                gap="3"
                px="1rem"
                py="0.7rem"
                bg={C.accentSoft}
                borderWidth="0.1rem"
                borderColor={C.accent}
                borderRadius="lg"
            >
                <Box flex="1" minW="0">
                    <Text fontSize="1.05rem" color={C.accentInk}>Melhor preço item a item</Text>
                    <Text fontSize="0.85rem" color={C.sub}>
                        comprando cada item de quem cobrou menos, sem frete
                    </Text>
                </Box>
                <Text fontSize="1.05rem" color={C.accentInk} whiteSpace="nowrap">
                    {moeda(melhorTotal)}
                </Text>
            </Flex>
        </VStack>

        {/* Item por item, as propostas em ordem de preco. */}
        <VStack gap="0.75rem" align="stretch">
            <Text fontSize="1.05rem" color={C.sub} px="0.25rem">Item a item</Text>

            {linhas.map((linha) => (
                <VStack
                    key={linha.item}
                    gap="0.4rem"
                    align="stretch"
                    px="1rem"
                    py="0.8rem"
                    bg={C.surface}
                    borderWidth="0.1rem"
                    borderColor={C.line}
                    borderRadius="lg"
                >
                    <Box>
                        <Text fontSize="1.05rem" color={C.ink} lineClamp={2}>{linha.descricao}</Text>
                        <Text fontSize="0.85rem" color={C.sub}>
                            {linha.produto} · {decimal(linha.quantidade)} {linha.unidade}
                        </Text>
                    </Box>

                    {linha.propostas.map((proposta) => {
                        const semPreco = proposta.unitario <= 0;

                        return <Flex
                            key={proposta.fornecedor}
                            align="center"
                            gap="3"
                            px="0.7rem"
                            py="0.5rem"
                            bg={proposta.vencedor ? C.successSoft : semPreco ? C.surfaceHover : C.surface}
                            borderWidth="0.1rem"
                            borderColor={proposta.vencedor ? C.success : C.line}
                            borderRadius="md"
                        >
                            {/* Marcar o vencedor daqui evita ter que voltar para
                                a entrada de valores so para decidir. */}
                            <Flex
                                role="button"
                                align="center"
                                justify="center"
                                w="1.8rem"
                                h="1.8rem"
                                flexShrink={0}
                                borderRadius="md"
                                borderWidth="0.1rem"
                                borderColor={proposta.vencedor ? C.success : C.line}
                                bg={proposta.vencedor ? C.success : C.surface}
                                color={proposta.vencedor ? "white" : C.faint}
                                cursor={semPreco ? "not-allowed" : "pointer"}
                                opacity={semPreco ? 0.5 : 1}
                                onClick={() => {
                                    if (semPreco) {
                                        return;
                                    }
                                    SetVencedor(atual.id, proposta.fornecedor, linha.item, !proposta.vencedor);
                                    recarregar();
                                }}
                            >
                                <IconTrophy size={15} />
                            </Flex>

                            <Box flex="1" minW="0">
                                <Text fontSize="0.95rem" color={C.ink} lineClamp={1}>
                                    {FornecedorNome(proposta.fornecedor)}
                                </Text>
                                <Text fontSize="0.8rem" color={C.sub}>
                                    {semPreco ? "não cotou" : moeda(proposta.unitario) + " un"}
                                    {proposta.prazo > 0 ? ` · ${proposta.prazo} dias` : ""}
                                </Text>
                            </Box>

                            {proposta.melhor ? <Badge bg={C.accent} color="white" px="2" py="1" borderRadius="md" fontSize="0.7rem">
                                MENOR
                            </Badge> : undefined}

                            {!semPreco ? <Text fontSize="1rem" color={C.ink} whiteSpace="nowrap">
                                {moeda(proposta.total)}
                            </Text> : undefined}
                        </Flex>
                    })}
                </VStack>
            ))}
        </VStack>

        <MenuItem action="back" override={"/restricted/cotacoes/" + String(atual.id)} />
    </VStack>
}
