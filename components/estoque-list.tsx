"use client"

import {
    BaixarEstoque,
    EntrarEstoque,
    FornecedorNome,
    ListEstoque,
    ProdutoEstoque,
    ResultadoBaixa,
    decimal,
    moeda,
} from "@/api/cotacoes";
import { Badge, Box, Button, Flex, Input, Text, VStack } from "@chakra-ui/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { IconArrowDown, IconArrowUp } from "@tabler/icons-react";
import { C } from "@/theme/colors";

// Estoque com ponto de pedido. A baixa aqui e a simulacao da saida: no sistema
// de verdade quem chama isso e a retirada do armario e a entrega da requisicao.
//
// A regra roda na baixa: saldo que chega no ponto de pedido manda o item para a
// lista a cotar, e se o item tem fornecedor exclusivo vira pedido de compra
// direto, sem passar por cotacao.
export function EstoqueList() {
    const [produtos, setProdutos] = useState<ProdutoEstoque[] | undefined>(undefined);
    const [aberto, setAberto] = useState<string | undefined>(undefined);
    const [quantidade, setQuantidade] = useState("");
    const [resultado, setResultado] = useState<ResultadoBaixa | undefined>(undefined);

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

    function baixar(codigo: string) {
        const qtde = Number(quantidade.replace(",", "."));
        if (isNaN(qtde) || qtde <= 0) {
            return;
        }

        setResultado(BaixarEstoque(codigo, qtde, ""));
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
        setResultado(undefined);
        setProdutos(ListEstoque());
    }

    return <VStack gap="0.5rem" w="100%" align="stretch">
        {/* O que a ultima baixa provocou, com o atalho para onde o item foi
            parar. */}
        {resultado != undefined ? <VStack
            gap="0.5rem"
            align="stretch"
            px="1rem"
            py="0.8rem"
            bg={resultado.pedido != undefined || resultado.requisicao != undefined ? C.successSoft : C.surfaceHover}
            borderWidth="0.1rem"
            borderColor={resultado.pedido != undefined || resultado.requisicao != undefined ? C.success : C.line}
            borderRadius="lg"
        >
            <Text fontSize="0.95rem" color={C.ink}>{resultado.mensagem}</Text>

            {resultado.pedido != undefined ? <Link
                href={"/restricted/pedidos/" + String(resultado.pedido.id)}
                style={{ width: "100%" }}
            >
                <Text fontSize="0.95rem" color={C.accent}>Abrir o pedido {resultado.pedido.numero}</Text>
            </Link> : undefined}

            {resultado.requisicao != undefined ? <Link href="/restricted/cotacoes" style={{ width: "100%" }}>
                <Text fontSize="0.95rem" color={C.accent}>Ver na lista a cotar</Text>
            </Link> : undefined}
        </VStack> : undefined}

        {produtos.map((produto) => {
            const noPonto = produto.saldo <= produto.pontoPedido;
            const selecionado = aberto == produto.codigo;

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
