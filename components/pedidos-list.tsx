"use client"

import {
    BuscarPedidosPorItem,
    FornecedorNome,
    ListPedidos,
    Pedido,
    PedidoItem,
    PedidoTotais,
    ResultadoBusca,
    STATUS_PEDIDO_ABERTO,
    STATUS_PEDIDO_CANCELADO,
    dataHora,
    decimal,
    moeda,
    statusPedidoLabel,
} from "@/api/cotacoes";
import { Badge, Box, Flex, Input, Text, VStack } from "@chakra-ui/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { IconSearch } from "@tabler/icons-react";
import { C } from "@/theme/colors";

// Cor pelo status: aberto ainda nao foi enviado, emitido ja esta com o
// fornecedor, cancelado sai do fluxo.
function estilo(status: string) {
    if (status == STATUS_PEDIDO_ABERTO) {
        return { bg: C.surfaceHover, border: C.faint };
    }
    if (status == STATUS_PEDIDO_CANCELADO) {
        return { bg: C.dangerSoft, border: C.danger };
    }
    return { bg: C.successSoft, border: C.success };
}

// Os pedidos de compra. A lista e de cabecalhos, e abrir um mostra os itens.
//
// Com texto na busca, a tela vira pesquisa avancada: procura o produto por
// codigo ou descricao e mostra todos os pedidos que tem aquele item, com ele em
// destaque no meio dos outros itens do mesmo pedido. Foi o jeito que o Clairton
// pediu, no lugar de navegar item por item mexendo no cabecalho.
export function PedidosList() {
    const [pedidos, setPedidos] = useState<Pedido[] | undefined>(undefined);
    const [busca, setBusca] = useState("");

    useEffect(() => {
        // Timeout pelo mesmo motivo do resto do projeto: setState direto no
        // corpo do efeito dispara render em cascata.
        const primeira = setTimeout(() => { setPedidos(ListPedidos()) }, 0);
        return () => { clearTimeout(primeira) };
    }, []);

    if (pedidos == undefined) {
        return <Box w="100%" px="2rem" py="2rem" textAlign="center">
            <Text fontSize="1.05rem" color={C.sub}>Carregando...</Text>
        </Box>
    }

    const procurando = busca.trim() != "";
    const resultados: ResultadoBusca[] = procurando ? BuscarPedidosPorItem(busca) : [];

    return <VStack gap="0.5rem" w="100%" align="stretch">
        <Flex
            w="100%"
            align="center"
            gap="3"
            px="1rem"
            py="0.6rem"
            bg={C.surface}
            borderWidth="0.1rem"
            borderColor={procurando ? C.accent : C.line}
            borderRadius="lg"
        >
            <Box color={C.faint} flexShrink={0}><IconSearch size={20} /></Box>
            <Input
                value={busca}
                onChange={(e) => { setBusca(e.currentTarget.value) }}
                placeholder="Procurar um produto por código ou descrição"
                variant="flushed"
                border="none"
                px="0"
                fontSize="1rem"
                color={C.ink}
                _focus={{ boxShadow: "none" }}
            />
        </Flex>

        {procurando ? <Text fontSize="0.9rem" color={C.sub} px="0.25rem">
            {resultados.length == 0
                ? "Nenhum pedido com esse produto."
                : `${resultados.length} ${resultados.length == 1 ? "pedido tem" : "pedidos têm"} esse produto.`}
        </Text> : undefined}

        {/* Resultado da pesquisa avancada: o pedido inteiro, com o item
            procurado em destaque. */}
        {procurando ? resultados.map((resultado) => (
            <ResultadoPedido key={resultado.pedido.id} resultado={resultado} />
        )) : undefined}

        {!procurando && pedidos.length == 0 ? <Box
            w="100%"
            px="2rem"
            py="2rem"
            textAlign="center"
            borderWidth="0.1rem"
            borderStyle="dashed"
            borderColor={C.line}
            borderRadius="xl"
        >
            <Text fontSize="1.05rem" color={C.sub}>
                Nenhum pedido ainda. Os pedidos nascem da cotação, depois que os vencedores estão marcados,
                ou da baixa de estoque quando o item tem fornecedor exclusivo.
            </Text>
        </Box> : undefined}

        {!procurando ? pedidos.map((pedido) => {
            const e = estilo(pedido.status);
            const totais = PedidoTotais(pedido);

            return <Link key={pedido.id} href={"/restricted/pedidos/" + String(pedido.id)} style={{ width: "100%" }}>
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
                        <Text fontSize="1.05rem" color={C.ink} lineClamp={2}>
                            Pedido {pedido.numero} · {FornecedorNome(pedido.fornecedor)}
                        </Text>
                        <Text fontSize="0.85rem" color={C.sub}>
                            {dataHora(pedido.criacao)} · {pedido.itens.length}{" "}
                            {pedido.itens.length == 1 ? "item" : "itens"} ·{" "}
                            {pedido.cotacao > 0 ? "cotação " + pedido.cotacaoNumero : "reposição automática"}
                        </Text>
                    </Box>

                    <Flex align="center" gap="3" flexShrink={0}>
                        <Text fontSize="1.05rem" color={C.ink} whiteSpace="nowrap">
                            {moeda(totais.total)}
                        </Text>
                        <Badge bg={e.border} color="white" px="2.5" py="1" borderRadius="md" fontSize="0.8rem">
                            {statusPedidoLabel(pedido.status).toUpperCase()}
                        </Badge>
                    </Flex>
                </Flex>
            </Link>
        }) : undefined}
    </VStack>
}

// Um pedido no resultado da pesquisa. Os itens que casaram aparecem primeiro e
// em destaque; os outros ficam recolhidos, para o pedido nao virar uma parede
// de itens que ninguem procurou.
function ResultadoPedido({ resultado }: { resultado: ResultadoBusca }) {
    const [mostrandoOutros, setMostrandoOutros] = useState(false);

    const pedido = resultado.pedido;
    const e = estilo(pedido.status);
    const achados = pedido.itens.filter((i) => resultado.encontrados.includes(i.id));
    const outros = pedido.itens.filter((i) => !resultado.encontrados.includes(i.id));

    return <VStack
        gap="0.4rem"
        align="stretch"
        px="1rem"
        py="0.7rem"
        bg={C.surface}
        borderWidth="0.1rem"
        borderColor={e.border}
        borderRadius="lg"
    >
        <Link href={"/restricted/pedidos/" + String(pedido.id)} style={{ width: "100%" }}>
            <Flex align="center" gap="3">
                <Box flex="1" minW="0">
                    <Text fontSize="1.05rem" color={C.ink} lineClamp={2}>
                        Pedido {pedido.numero} · {FornecedorNome(pedido.fornecedor)}
                    </Text>
                    <Text fontSize="0.85rem" color={C.sub}>
                        {dataHora(pedido.criacao)} · {pedido.itens.length}{" "}
                        {pedido.itens.length == 1 ? "item" : "itens"}
                    </Text>
                </Box>
                <Badge bg={e.border} color="white" px="2.5" py="1" borderRadius="md" fontSize="0.8rem">
                    {statusPedidoLabel(pedido.status).toUpperCase()}
                </Badge>
            </Flex>
        </Link>

        {achados.map((item) => <ItemResultado key={item.id} item={item} destaque />)}

        {outros.length > 0 && !mostrandoOutros ? <Text
            role="button"
            fontSize="0.85rem"
            color={C.accent}
            cursor="pointer"
            onClick={() => { setMostrandoOutros(true) }}
        >
            ver os outros {outros.length} {outros.length == 1 ? "item" : "itens"} do pedido
        </Text> : undefined}

        {mostrandoOutros ? outros.map((item) => <ItemResultado key={item.id} item={item} />) : undefined}
    </VStack>
}

function ItemResultado({ item, destaque }: { item: PedidoItem, destaque?: boolean }) {
    return <Flex
        align="center"
        gap="3"
        px="0.7rem"
        py="0.45rem"
        bg={destaque ? C.accentSoft : C.surfaceHover}
        borderWidth="0.1rem"
        borderColor={destaque ? C.accent : C.line}
        borderRadius="md"
    >
        <Box flex="1" minW="0">
            <Text fontSize="0.95rem" color={destaque ? C.accentInk : C.ink} lineClamp={2}>
                {item.descricao}
            </Text>
            <Text fontSize="0.8rem" color={C.sub}>
                {item.produto} · {decimal(item.quantidade)} {item.unidade} × {moeda(item.valorUnitario)}
            </Text>
        </Box>
        <Text fontSize="0.95rem" color={C.ink} whiteSpace="nowrap">
            {moeda(item.valorUnitario * item.quantidade)}
        </Text>
    </Flex>
}
