"use client"

import {
    AddFornecedor,
    BaixarCsv,
    Cotacao,
    CotacaoCsv,
    FornecedorNome,
    GerarCotacao,
    GerarPedidos,
    GetCotacao,
    ItensSemValor,
    ItensSemVencedor,
    ItensVencidos,
    ListPedidosDaCotacao,
    Pedido,
    PedidoTotais,
    LimpaValores,
    ListFornecedores,
    RemoveFornecedor,
    RemoveItem,
    STATUS_ABERTA,
    STATUS_FECHADA,
    STATUS_PENDENTE,
    SetCabecalho,
    SetQuantidadeItem,
    SetStatus,
    Totais,
    comoTexto,
    dataHora,
    decimal,
    moeda,
    numeroDigitado,
    statusLabel,
} from "@/api/cotacoes";
import { MenuItem } from "@/components/menu-item";
import { SelectField } from "@/components/select-field";
import { Badge, Box, Button, Flex, Input, Text, VStack } from "@chakra-ui/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { IconCurrencyDollar, IconFileSpreadsheet, IconPlus, IconScale, IconShoppingCart, IconTrash, IconTrophy } from "@tabler/icons-react";
import { C } from "@/theme/colors";

// A cotacao: cabecalho com os dados gerais, o grid dos fornecedores e o grid dos
// itens, como no modulo de compras do ERP. Gerar Cotacao mescla os dois e cria
// as linhas de valor, liberando a entrada de valores.
//
// Os botoes seguem o status, igual a faixa de Workflow da tela dele: aberta
// oferece Gerar, pendente oferece Inserir Valores, Limpa Valores e Reabrir,
// fechada so oferece Reabrir.
export function CotacaoView({ id }: { id: number }) {
    const [cotacao, setCotacao] = useState<Cotacao | undefined>(undefined);
    const [carregado, setCarregado] = useState(false);
    const [adicionando, setAdicionando] = useState(false);
    const [pedidos, setPedidos] = useState<Pedido[]>([]);
    const [aviso, setAviso] = useState<string | undefined>(undefined);
    // Quantidade fica em texto enquanto a pessoa digita: formatar a cada tecla
    // atrapalharia quem escreve "27,9".
    const [qtdes, setQtdes] = useState<Record<number, string>>({});

    useEffect(() => {
        // Timeout pelo mesmo motivo do resto do projeto: setState direto no
        // corpo do efeito dispara render em cascata.
        const primeira = setTimeout(() => {
            setCotacao(GetCotacao(id));
            setPedidos(ListPedidosDaCotacao(id));
            setCarregado(true);
        }, 0);

        return () => { clearTimeout(primeira) };
    }, [id]);

    function recarregar() {
        setCotacao(GetCotacao(id));
        setPedidos(ListPedidosDaCotacao(id));
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
    const aberta = atual.status == STATUS_ABERTA;
    const fechada = atual.status == STATUS_FECHADA;
    const disponiveis = ListFornecedores().filter(
        (f) => !atual.fornecedores.some((c) => c.fornecedor == f.codigo),
    );
    // Quantos itens ja tem fornecedor vencedor, e quantos ainda nao. Sem
    // vencedor nao ha o que pedir.
    const semVencedor = ItensSemVencedor(atual);
    const vencedoresTotal = atual.itens.length - semVencedor;

    function exportar() {
        BaixarCsv("cotacao-" + atual.numero + ".csv", CotacaoCsv(atual));
    }

    return <VStack gap="1.25rem" w="100%" align="stretch">
        {/* Cabecalho, com os campos da tela dele. Enquanto a cotacao esta aberta
            da para editar; depois de gerada so o status e as observacoes. */}
        <VStack
            gap="0.6rem"
            align="stretch"
            px="1rem"
            py="0.9rem"
            bg={C.surface}
            borderWidth="0.1rem"
            borderColor={C.line}
            borderRadius="xl"
        >
            <Flex align="baseline" gap="3" wrap="wrap">
                <Text fontSize="1.5rem" color={C.ink}>Cotação {atual.numero}</Text>
                <Badge
                    bg={fechada ? C.success : aberta ? C.faint : C.warning}
                    color="white"
                    px="2.5"
                    py="1"
                    borderRadius="md"
                    fontSize="0.8rem"
                >
                    {statusLabel(atual.status).toUpperCase()}
                </Badge>
            </Flex>

            <Campo rotulo="Empresa" valor={atual.empresa} />
            <Campo rotulo="Criação" valor={dataHora(atual.criacao)} />
            <Campo rotulo="Usuário" valor={atual.usuario} />
            <Campo rotulo="Cód. cotação" valor={atual.codCotacao} />
            <Campo rotulo="Código solicitação" valor={atual.codigoSolicitacao} />

            <Flex align="center" gap="3" wrap="wrap">
                <Text fontSize="0.9rem" color={C.sub} w="8rem" flexShrink={0}>Status</Text>
                <Box flex="1" minW="11rem">
                    <SelectField
                        value={atual.status}
                        onChange={(valor) => {
                            SetStatus(atual.id, valor);
                            recarregar();
                        }}
                        options={[
                            { value: STATUS_ABERTA, label: "Aberta" },
                            { value: STATUS_PENDENTE, label: "Pendente" },
                            { value: STATUS_FECHADA, label: "Fechada" },
                        ]}
                    />
                </Box>
            </Flex>

            <Entrada
                rotulo="Aprovador técnico"
                valor={atual.aprovadorTecnico}
                onChange={(valor) => {
                    SetCabecalho(atual.id, { aprovadorTecnico: valor });
                    recarregar();
                }}
            />
            <Entrada
                rotulo="Aprovador comercial"
                valor={atual.aprovadorComercial}
                onChange={(valor) => {
                    SetCabecalho(atual.id, { aprovadorComercial: valor });
                    recarregar();
                }}
            />
            <Entrada
                rotulo="Observação"
                valor={atual.observacao}
                onChange={(valor) => {
                    SetCabecalho(atual.id, { observacao: valor });
                    recarregar();
                }}
            />
        </VStack>

        {/* Grid dos fornecedores. Na tela dele fica a esquerda do grid de itens;
            aqui vai em cima, porque a tela do almoxarifado e estreita. */}
        <VStack gap="0.5rem" align="stretch">
            <Flex align="center" justify="space-between" gap="2">
                <Text fontSize="1.05rem" color={C.sub} px="0.25rem">
                    Fornecedores ({atual.fornecedores.length})
                </Text>
                {disponiveis.length > 0 && !fechada ? <Button
                    size="sm"
                    variant="ghost"
                    color={C.accent}
                    onClick={() => { setAdicionando(!adicionando) }}
                >
                    <IconPlus size={16} /> Fornecedor
                </Button> : undefined}
            </Flex>

            {adicionando ? <Box px="0.25rem">
                <SelectField
                    value=""
                    onChange={(valor) => {
                        AddFornecedor(atual.id, valor);
                        setAdicionando(false);
                        recarregar();
                    }}
                    options={disponiveis.map((f) => ({ value: f.codigo, label: f.codigo + " " + f.razaoSocial }))}
                    placeholder="Escolher fornecedor"
                />
            </Box> : undefined}

            {atual.fornecedores.map((fornecedor) => {
                const totais = Totais(atual, fornecedor.fornecedor);
                const falta = ItensSemValor(atual, fornecedor.fornecedor);
                const vencidos = ItensVencidos(atual, fornecedor.fornecedor);

                return <Flex
                    key={fornecedor.fornecedor}
                    align="center"
                    gap="3"
                    px="1rem"
                    py="0.7rem"
                    bg={C.surface}
                    borderWidth="0.1rem"
                    borderColor={C.line}
                    borderRadius="lg"
                >
                    <Box flex="1" minW="0">
                        <Text fontSize="1.05rem" color={C.ink} lineClamp={2}>
                            {FornecedorNome(fornecedor.fornecedor)}
                        </Text>
                        <Text fontSize="0.85rem" color={C.sub}>
                            {fornecedor.fornecedor}
                            {fornecedor.validade != "" ? ` · vale até ${fornecedor.validade.split("-").reverse().join("/")}` : ""}
                            {totais.prazo > 0 ? ` · ${totais.prazo} dias` : ""}
                        </Text>
                    </Box>

                    {vencidos > 0 ? <Badge bg={C.success} color="white" px="2" py="1" borderRadius="md" fontSize="0.75rem">
                        VENCE {vencidos}
                    </Badge> : undefined}

                    {atual.gerada ? (falta == 0 ? <Text fontSize="1.05rem" color={C.ink} whiteSpace="nowrap">
                        {moeda(totais.total)}
                    </Text> : <Badge bg={C.warningSoft} color={C.warningInk} px="2" py="1" borderRadius="md" fontSize="0.75rem">
                        FALTAM {falta}
                    </Badge>) : undefined}

                    {!fechada ? <Box
                        as="button"
                        color={C.faint}
                        _hover={{ color: C.danger }}
                        onClick={() => {
                            RemoveFornecedor(atual.id, fornecedor.fornecedor);
                            recarregar();
                        }}
                    >
                        <IconTrash size={18} />
                    </Box> : undefined}
                </Flex>
            })}
        </VStack>

        {/* Grid dos itens. A quantidade e editavel enquanto a cotacao esta
            aberta. */}
        <VStack gap="0.5rem" align="stretch">
            <Text fontSize="1.05rem" color={C.sub} px="0.25rem">
                Itens ({atual.itens.length})
            </Text>

            {atual.itens.map((item) => (
                <Flex
                    key={item.id}
                    align="center"
                    gap="3"
                    px="1rem"
                    py="0.7rem"
                    bg={C.surface}
                    borderWidth="0.1rem"
                    borderColor={C.line}
                    borderRadius="lg"
                >
                    <Text fontSize="0.9rem" color={C.faint} w="1.5rem" flexShrink={0} textAlign="center">
                        {item.numeroItem}
                    </Text>

                    <Box flex="1" minW="0">
                        <Text fontSize="1.05rem" color={C.ink} lineClamp={2}>{item.descricao}</Text>
                        <Text fontSize="0.85rem" color={C.sub}>
                            {item.produto} · req. {item.origens.join(", ")}
                            {item.conta != "" ? ` · conta ${item.conta}` : ""}
                        </Text>
                    </Box>

                    {aberta ? <Input
                        w="5.5rem"
                        textAlign="center"
                        fontSize="1rem"
                        value={qtdes[item.id] ?? comoTexto(item.quantidade)}
                        inputMode="decimal"
                        bg={C.surface}
                        borderColor={C.line}
                        color={C.ink}
                        onChange={(e) => {
                            const digitado = e.currentTarget.value;
                            setQtdes({ ...qtdes, [item.id]: digitado });
                            SetQuantidadeItem(atual.id, item.id, numeroDigitado(digitado));
                            recarregar();
                        }}
                    /> : <Text fontSize="1rem" color={C.ink} whiteSpace="nowrap">
                        {decimal(item.quantidade)} {item.unidade}
                    </Text>}

                    {aberta ? <Box
                        as="button"
                        color={C.faint}
                        _hover={{ color: C.danger }}
                        onClick={() => {
                            RemoveItem(atual.id, item.id);
                            recarregar();
                        }}
                    >
                        <IconTrash size={18} />
                    </Box> : undefined}
                </Flex>
            ))}
        </VStack>

        {/* Pedidos gerados a partir desta cotacao. Um por fornecedor. */}
        {pedidos.length > 0 ? <VStack gap="0.5rem" align="stretch">
            <Text fontSize="1.05rem" color={C.sub} px="0.25rem">
                Pedidos gerados ({pedidos.length})
            </Text>

            {pedidos.map((pedido) => (
                <Link key={pedido.id} href={"/restricted/pedidos/" + String(pedido.id)} style={{ width: "100%" }}>
                    <Flex
                        align="center"
                        gap="3"
                        px="1rem"
                        py="0.7rem"
                        bg={C.successSoft}
                        borderWidth="0.1rem"
                        borderColor={C.success}
                        borderRadius="lg"
                        _hover={{ borderColor: C.accent }}
                    >
                        <Box flex="1" minW="0">
                            <Text fontSize="1.05rem" color={C.ink} lineClamp={1}>
                                Pedido {pedido.numero} · {FornecedorNome(pedido.fornecedor)}
                            </Text>
                            <Text fontSize="0.85rem" color={C.sub}>
                                {pedido.itens.length} {pedido.itens.length == 1 ? "item" : "itens"}
                            </Text>
                        </Box>
                        <Text fontSize="1.05rem" color={C.ink} whiteSpace="nowrap">
                            {moeda(PedidoTotais(pedido).total)}
                        </Text>
                    </Flex>
                </Link>
            ))}
        </VStack> : undefined}

        {/* Workflow, na ordem da faixa de botoes dele. */}
        <VStack gap="0.5rem" align="stretch">
            {aberta ? <Button
                bg={C.accent}
                color="white"
                disabled={atual.itens.length == 0 || atual.fornecedores.length == 0}
                onClick={() => {
                    GerarCotacao(atual.id);
                    recarregar();
                }}
            >
                Gerar cotação
            </Button> : undefined}

            {/* Comparativo: quem cobrou quanto em cada item. E o apoio para
                escolher o vencedor sem abrir fornecedor por fornecedor. */}
            {atual.gerada ? <Link href={"/restricted/cotacoes/" + String(atual.id) + "/comparativo"} style={{ width: "100%" }}>
                <Flex
                    w="100%"
                    align="center"
                    justify="center"
                    gap="2"
                    px="1rem"
                    py="0.85rem"
                    bg={C.surface}
                    color={C.ink}
                    borderWidth="0.1rem"
                    borderColor={C.line}
                    borderRadius="lg"
                    _hover={{ borderColor: C.accent }}
                >
                    <IconScale size={20} />
                    <Text fontSize="1.05rem">Comparativo</Text>
                </Flex>
            </Link> : undefined}

            {atual.gerada ? <Link href={"/restricted/cotacoes/" + String(atual.id) + "/valores"} style={{ width: "100%" }}>
                <Flex
                    w="100%"
                    align="center"
                    justify="center"
                    gap="2"
                    px="1rem"
                    py="0.85rem"
                    bg={C.accent}
                    color="white"
                    borderRadius="lg"
                    _hover={{ bg: C.accentHover }}
                >
                    <IconCurrencyDollar size={20} />
                    <Text fontSize="1.05rem">Inserir valores</Text>
                </Flex>
            </Link> : undefined}

            {/* Gerar pedidos: agrupa os itens vencedores por fornecedor, um
                pedido para cada. Fornecedor que ja tem pedido desta cotacao e
                pulado, entao clicar duas vezes nao duplica. */}
            {atual.gerada && vencedoresTotal > 0 ? <Button
                bg={C.success}
                color="white"
                onClick={() => {
                    const gerados = GerarPedidos(atual.id, "");
                    recarregar();
                    if (gerados.length == 0) {
                        setAviso("Nenhum pedido novo: os fornecedores vencedores já têm pedido nesta cotação.");
                        return;
                    }
                    setAviso(undefined);
                }}
            >
                <IconShoppingCart size={18} /> Gerar pedidos
                {semVencedor > 0 ? ` (${semVencedor} ${semVencedor == 1 ? "item fica" : "itens ficam"} de fora)` : ""}
            </Button> : undefined}

            {atual.gerada && vencedoresTotal == 0 ? <Flex
                align="center"
                gap="2"
                px="1rem"
                py="0.7rem"
                bg={C.surfaceHover}
                borderWidth="0.1rem"
                borderColor={C.line}
                borderRadius="lg"
            >
                <Box color={C.faint}><IconTrophy size={18} /></Box>
                <Text fontSize="0.9rem" color={C.sub}>
                    Marque o vencedor de cada item na entrada de valores para gerar os pedidos.
                </Text>
            </Flex> : undefined}

            {aviso != undefined ? <Text fontSize="0.9rem" color={C.warningInk}>{aviso}</Text> : undefined}

            {atual.gerada ? <Button
                variant="outline"
                bg={C.surface}
                color={C.ink}
                borderColor={C.line}
                onClick={exportar}
            >
                <IconFileSpreadsheet size={18} /> Gera Excel
            </Button> : undefined}

            {atual.gerada && !aberta ? <Button
                variant="outline"
                bg={C.surface}
                color={C.ink}
                borderColor={C.line}
                onClick={() => {
                    // Reabrir volta para aberta, onde item e fornecedor podem
                    // mudar de novo. Os valores preenchidos continuam la.
                    SetStatus(atual.id, STATUS_ABERTA);
                    recarregar();
                }}
            >
                Reabrir cotação
            </Button> : undefined}

            {atual.gerada && !fechada ? <Button
                variant="outline"
                bg={C.surface}
                color={C.danger}
                borderColor={C.line}
                onClick={() => {
                    LimpaValores(atual.id);
                    recarregar();
                }}
            >
                Limpa valores
            </Button> : undefined}
        </VStack>

        <MenuItem action="back" override="/restricted/cotacoes" />
    </VStack>
}

function Campo({ rotulo, valor }: { rotulo: string, valor: string }) {
    if (valor == "") {
        return undefined;
    }

    return <Flex align="baseline" gap="3" wrap="wrap">
        <Text fontSize="0.9rem" color={C.sub} w="8rem" flexShrink={0}>{rotulo}</Text>
        <Text fontSize="1rem" color={C.ink}>{valor}</Text>
    </Flex>
}

function Entrada({
    rotulo,
    valor,
    onChange,
}: {
    rotulo: string;
    valor: string;
    onChange: (valor: string) => void;
}) {
    return <Flex align="center" gap="3" wrap="wrap">
        <Text fontSize="0.9rem" color={C.sub} w="8rem" flexShrink={0}>{rotulo}</Text>
        <Input
            flex="1"
            minW="11rem"
            value={valor}
            fontSize="1rem"
            bg={C.surface}
            borderColor={C.line}
            color={C.ink}
            onChange={(e) => { onChange(e.currentTarget.value) }}
        />
    </Flex>
}
