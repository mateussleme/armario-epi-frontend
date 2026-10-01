"use client"

import {
    BaixarEstoque,
    EntrarEstoque,
    FornecedorNome,
    ListEstoque,
    ProdutoEstoque,
    ReposicaoAberta,
    ReposicaoDoProduto,
    ResultadoBaixa,
    decimal,
    moeda,
} from "@/api/cotacoes";
import { Badge, Box, Button, Flex, Input, Text, VStack } from "@chakra-ui/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { IconArrowDown, IconArrowUp, IconCheck, IconExternalLink } from "@tabler/icons-react";
import { C } from "@/theme/colors";

// Estoque com ponto de pedido. A baixa aqui e a simulacao da saida: no sistema
// de verdade quem chama isso e a retirada do armario e a entrega da requisicao.
//
// A regra roda na baixa: saldo que chega no ponto de pedido manda o item para a
// lista a cotar, e se o item tem fornecedor exclusivo vira pedido de compra
// direto, sem passar por cotacao.
//
// O que a baixa provocou aparece dentro do card do proprio item, e nao num aviso
// solto no topo: com a lista rolando, o aviso ficava longe do item que o gerou.
export function EstoqueList() {
    const [produtos, setProdutos] = useState<ProdutoEstoque[] | undefined>(undefined);
    const [aberto, setAberto] = useState<string | undefined>(undefined);
    const [quantidade, setQuantidade] = useState("");
    // Resultado da ultima baixa, guardado por codigo de produto.
    const [resultados, setResultados] = useState<Record<string, ResultadoBaixa>>({});
    const [soReposicao, setSoReposicao] = useState(false);

    useEffect(() => {
        // Timeout pelo mesmo motivo do resto do projeto: setState direto no
        // corpo do efeito dispara render em cascata.
        const primeira = setTimeout(() => { setProdutos(ListEstoque()) }, 0);
        return () => { clearTimeout(primeira) };
    }, []);

    if (produtos == undefined) {
        return <Box w="100%" px="2rem" py="2rem" textAlign="center">
            <Text fontSize="1.05rem" color={C.sub}>Carregando...</Text>
        </Box>
    }

    // Onde esta a reposicao de cada produto agora: na fila a cotar, numa cotacao
    // ou num pedido. E o que o filtro usa e o que vira link no card.
    const situacoes: Record<string, ReposicaoAberta | undefined> = {};
    for (const produto of produtos) {
        situacoes[produto.codigo] = ReposicaoDoProduto(produto.codigo);
    }

    const emReposicao = produtos.filter((p) => situacoes[p.codigo] != undefined).length;
    const lista = soReposicao ? produtos.filter((p) => situacoes[p.codigo] != undefined) : produtos;

    function baixar(codigo: string) {
        const qtde = Number(quantidade.replace(",", "."));
        if (isNaN(qtde) || qtde <= 0) {
            return;
        }

        setResultados({ ...resultados, [codigo]: BaixarEstoque(codigo, qtde, "") });
        setQuantidade("");
        setProdutos(ListEstoque());
    }

    function entrar(codigo: string) {
        const qtde = Number(quantidade.replace(",", "."));
        if (isNaN(qtde) || qtde <= 0) {
            return;
        }

        EntrarEstoque(codigo, qtde);
        setQuantidade("");
        const novos = { ...resultados };
        delete novos[codigo];
        setResultados(novos);
        setProdutos(ListEstoque());
    }

    return <VStack gap="0.5rem" w="100%" align="stretch">
        {/* Filtro para ver so o que ja esta sendo reposto, que e a pergunta que
            o comprador faz: o que ja mandei comprar? */}
        <Flex align="center" justify="space-between" gap="2" wrap="wrap">
            <Text fontSize="0.9rem" color={C.sub}>
                {emReposicao > 0
                    ? `${emReposicao} ${emReposicao == 1 ? "item em reposição" : "itens em reposição"}`
                    : "Nenhum item em reposição"}
            </Text>
            <Flex
                role="button"
                align="center"
                gap="2"
                px="0.7rem"
                py="0.4rem"
                borderRadius="md"
                borderWidth="0.1rem"
                borderColor={soReposicao ? C.accent : C.line}
                bg={soReposicao ? C.accentSoft : C.surface}
                cursor={emReposicao > 0 || soReposicao ? "pointer" : "not-allowed"}
                opacity={emReposicao > 0 || soReposicao ? 1 : 0.5}
                onClick={() => {
                    if (emReposicao == 0 && !soReposicao) {
                        return;
                    }
                    setSoReposicao(!soReposicao);
                }}
            >
                <Flex
                    align="center"
                    justify="center"
                    w="1.1rem"
                    h="1.1rem"
                    borderRadius="sm"
                    borderWidth="0.1rem"
                    borderColor={soReposicao ? C.accent : C.line}
                    bg={soReposicao ? C.accent : C.surface}
                    color="white"
                >
                    {soReposicao ? <IconCheck size={12} /> : undefined}
                </Flex>
                <Text fontSize="0.85rem" color={soReposicao ? C.accentInk : C.sub}>
                    Só os em reposição
                </Text>
            </Flex>
        </Flex>

        {lista.map((produto) => {
            const noPonto = produto.saldo <= produto.pontoPedido;
            const selecionado = aberto == produto.codigo;
            const situacao = situacoes[produto.codigo];
            const resultado = resultados[produto.codigo];

            return <VStack
                key={produto.codigo}
                gap="0.6rem"
                align="stretch"
                px="1rem"
                py="0.7rem"
                bg={selecionado ? C.accentSoft : C.surface}
                borderWidth="0.1rem"
                borderColor={selecionado ? C.accent : noPonto ? C.warning : C.line}
                borderRadius="lg"
                cursor="pointer"
                onClick={() => {
                    setAberto(selecionado ? undefined : produto.codigo);
                    setQuantidade("");
                }}
            >
                <Flex align="center" gap="3">
                    <Box flex="1" minW="0">
                        <Text fontSize="1.05rem" color={C.ink} lineClamp={2}>{produto.descricao}</Text>
                        <Text fontSize="0.85rem" color={C.sub}>
                            {produto.codigo}
                            {produto.fornecedorPrincipal != undefined
                                ? ` · ${FornecedorNome(produto.fornecedorPrincipal)}`
                                : " · sem fornecedor principal"}
                            {produto.ultimoValor > 0 ? ` · última ${moeda(produto.ultimoValor)}` : ""}
                        </Text>
                    </Box>

                    <Flex align="center" gap="2" flexShrink={0}>
                        {produto.exclusivo ? <Badge bg={C.infoSoft} color={C.infoInk} px="2" py="1" borderRadius="md" fontSize="0.7rem">
                            EXCLUSIVO
                        </Badge> : undefined}
                        <Box textAlign="right">
                            <Text fontSize="1.05rem" color={noPonto ? C.warningInk : C.ink} whiteSpace="nowrap">
                                {decimal(produto.saldo)} {produto.unidade}
                            </Text>
                            <Text fontSize="0.8rem" color={C.faint} whiteSpace="nowrap">
                                ponto {decimal(produto.pontoPedido)}
                            </Text>
                        </Box>
                    </Flex>
                </Flex>

                {/* Onde a reposicao deste item esta. Fica no card, com o link
                    direto para a cotacao ou o pedido. */}
                {situacao != undefined ? <Link
                    href={situacao.link}
                    style={{ width: "fit-content" }}
                    onClick={(e) => { e.stopPropagation() }}
                >
                    <Flex align="center" gap="1.5" color={C.accent}>
                        <IconExternalLink size={14} />
                        <Text fontSize="0.85rem">{situacao.rotulo}</Text>
                    </Flex>
                </Link> : undefined}

                {/* O que a ultima baixa deste item provocou. */}
                {resultado != undefined ? <Text
                    fontSize="0.85rem"
                    color={resultado.pedido != undefined || resultado.requisicao != undefined ? C.successInk : C.sub}
                >
                    {resultado.mensagem}
                </Text> : undefined}

                {selecionado ? <Flex gap="2" wrap="wrap" align="end">
                    <Box flex="1" minW="7rem">
                        <Text fontSize="0.8rem" color={C.sub} mb="0.2rem">Quantidade</Text>
                        <Input
                            value={quantidade}
                            placeholder="0"
                            inputMode="decimal"
                            fontSize="1rem"
                            bg={C.surface}
                            borderColor={C.line}
                            color={C.ink}
                            onClick={(e) => { e.stopPropagation() }}
                            onChange={(e) => { setQuantidade(e.currentTarget.value.replace(/[^\d,]/g, "")) }}
                        />
                    </Box>
                    <Button
                        bg={C.accent}
                        color="white"
                        onClick={(e) => {
                            e.stopPropagation();
                            baixar(produto.codigo);
                        }}
                    >
                        <IconArrowDown size={16} /> Baixa
                    </Button>
                    <Button
                        variant="outline"
                        bg={C.surface}
                        color={C.ink}
                        borderColor={C.line}
                        onClick={(e) => {
                            e.stopPropagation();
                            entrar(produto.codigo);
                        }}
                    >
                        <IconArrowUp size={16} /> Entrada
                    </Button>
                </Flex> : undefined}

                {selecionado ? <Text fontSize="0.8rem" color={C.sub}>
                    Repõe {decimal(produto.loteReposicao)} {produto.unidade} quando o saldo chega em{" "}
                    {decimal(produto.pontoPedido)}
                    {produto.exclusivo ? ", gerando pedido direto por ser fornecedor exclusivo" : ", indo para a lista a cotar"}.
                </Text> : undefined}
            </VStack>
        })}
    </VStack>
}
