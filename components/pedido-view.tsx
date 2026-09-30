"use client"

import {
    BaixarCsv,
    Fornecedor,
    GetPedido,
    ListFornecedores,
    Pedido,
    PedidoCsv,
    PedidoTotais,
    RemovePedidoItem,
    STATUS_PEDIDO,
    STATUS_PEDIDO_CANCELADO,
    SetPedidoCabecalho,
    SetPedidoItem,
    TIPOS_FRETE,
    dataHora,
    decimal,
    moeda,
    statusPedidoLabel,
} from "@/api/cotacoes";
import { MenuItem } from "@/components/menu-item";
import { SelectField } from "@/components/select-field";
import { Badge, Box, Button, Flex, Input, Text, VStack } from "@chakra-ui/react";
import Link from "next/link";
import { IconCheck, IconFileSpreadsheet, IconPrinter, IconSend, IconTrash } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { C } from "@/theme/colors";

// O pedido de compra, no desenho da tela "Pedidos a Fornecedor" do ERP:
// cabecalho com os dados do fornecedor e do transporte, grid de itens com
// solicitante, comprador e centro de custo, e os totais no rodape.
//
// A diferenca e a navegacao, e foi escolha dele: la o grid de itens manda no
// cabecalho; aqui a lista de pedidos e que leva ao pedido, e quem procura por
// produto usa a pesquisa avancada da lista.
//
// Os valores vem congelados da cotacao. Mexer na cotacao depois nao mexe aqui,
// que e o comportamento certo: o pedido e o compromisso com o fornecedor.
export function PedidoView({ id }: { id: number }) {
    const [pedido, setPedido] = useState<Pedido | undefined>(undefined);
    const [carregado, setCarregado] = useState(false);

    useEffect(() => {
        // Timeout pelo mesmo motivo do resto do projeto: setState direto no
        // corpo do efeito dispara render em cascata.
        const primeira = setTimeout(() => {
            setPedido(GetPedido(id));
            setCarregado(true);
        }, 0);

        return () => { clearTimeout(primeira) };
    }, [id]);

    function recarregar() {
        setPedido(GetPedido(id));
    }

    if (!carregado) {
        return <Text fontSize="1.05rem" color={C.sub}>Carregando...</Text>
    }

    if (pedido == undefined) {
        return <VStack gap="1rem" w="100%">
            <Text fontSize="1.05rem" color={C.sub}>
                Pedido não encontrado. Os dados da demonstração se perdem ao recarregar a página.
            </Text>
            <MenuItem action="back" override="/restricted/pedidos" />
        </VStack>
    }

    const atual = pedido;
    const totais = PedidoTotais(atual);
    const cancelado = atual.status == STATUS_PEDIDO_CANCELADO;
    const cadastro: Fornecedor | undefined = ListFornecedores().find((f) => f.codigo == atual.fornecedor);
    const todosEnviados = atual.itens.length > 0 && atual.itens.every((i) => i.enviado);

    return <VStack gap="1.25rem" w="100%" align="stretch">
        {/* Cabecalho: pedido, empresa e o cadastro do fornecedor. */}
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
                <Text fontSize="1.5rem" color={C.ink}>Pedido {atual.numero}</Text>
                <Badge
                    bg={cancelado ? C.danger : C.success}
                    color="white"
                    px="2.5"
                    py="1"
                    borderRadius="md"
                    fontSize="0.8rem"
                >
                    {statusPedidoLabel(atual.status).toUpperCase()}
                </Badge>
            </Flex>

            <Campo rotulo="Empresa" valor={atual.empresa} />
            <Campo rotulo="Id. pedido" valor={atual.idPedido} />

            {/* Dados do fornecedor, como no bloco de cima da tela dele. */}
            <Box h="0.1rem" bg={C.line} my="0.2rem" />
            <Campo rotulo="Razão social" valor={cadastro?.razaoSocial ?? atual.fornecedor} />
            <Campo rotulo="Cód." valor={atual.fornecedor} />
            <Campo rotulo="CNPJ" valor={cadastro?.cnpj ?? ""} />
            <Campo rotulo="Insc. estadual" valor={cadastro?.inscricaoEstadual ?? ""} />
            <Campo
                rotulo="Endereço"
                valor={cadastro != undefined ? `${cadastro.endereco}, ${cadastro.numero}` : ""}
            />
            <Campo
                rotulo="Cidade"
                valor={cadastro != undefined ? `${cadastro.cidade} / ${cadastro.estado} · ${cadastro.cep}` : ""}
            />
            <Campo rotulo="Telefone" valor={cadastro?.telefone ?? ""} />
            <Campo rotulo="Contato" valor={cadastro?.contato ?? ""} />
            <Campo rotulo="E-mail" valor={cadastro?.email ?? ""} />

            <Box h="0.1rem" bg={C.line} my="0.2rem" />
            <Campo rotulo="Criação" valor={dataHora(atual.criacao)} />
            <Campo rotulo="Comprador" valor={atual.usuario} />
            {totais.prazo > 0 ? <Campo rotulo="Prazo de entrega" valor={String(totais.prazo) + " dias"} /> : undefined}

            {/* Pedido nascido do ponto de pedido nao tem cotacao de origem:
                fornecedor exclusivo nao passa por cotacao. */}
            <Flex align="baseline" gap="3" wrap="wrap">
                <Text fontSize="0.9rem" color={C.sub} w="8rem" flexShrink={0}>Origem</Text>
                {atual.cotacao > 0 ? <Link href={"/restricted/cotacoes/" + String(atual.cotacao)}>
                    <Text fontSize="1rem" color={C.accent}>Cotação {atual.cotacaoNumero}</Text>
                </Link> : <Text fontSize="1rem" color={C.ink}>Reposição automática do estoque</Text>}
            </Flex>

            <Flex align="center" gap="3" wrap="wrap">
                <Text fontSize="0.9rem" color={C.sub} w="8rem" flexShrink={0}>Status</Text>
                <Box flex="1" minW="11rem">
                    <SelectField
                        value={atual.status}
                        onChange={(valor) => {
                            SetPedidoCabecalho(atual.id, { status: valor });
                            recarregar();
                        }}
                        options={STATUS_PEDIDO}
                    />
                </Box>
            </Flex>

            {/* Condicao de pagamento, transporte e frete: vieram da proposta do
                fornecedor e ainda podem ser negociados aqui. */}
            <Entrada
                rotulo="Cond. pgto."
                valor={atual.condicaoPagamento}
                onChange={(valor) => {
                    SetPedidoCabecalho(atual.id, { condicaoPagamento: valor });
                    recarregar();
                }}
            />
            <Entrada
                rotulo="Transp."
                valor={atual.transportadora}
                onChange={(valor) => {
                    SetPedidoCabecalho(atual.id, { transportadora: valor });
                    recarregar();
                }}
            />

            <Flex align="center" gap="3" wrap="wrap">
                <Text fontSize="0.9rem" color={C.sub} w="8rem" flexShrink={0}>Tipo de frete</Text>
                <Box flex="1" minW="11rem">
                    <SelectField
                        value={String(atual.tipoFrete)}
                        onChange={(valor) => {
                            SetPedidoCabecalho(atual.id, { tipoFrete: Number(valor) });
                            recarregar();
                        }}
                        options={TIPOS_FRETE}
                    />
                </Box>
            </Flex>

            <Entrada
                rotulo="Observação"
                valor={atual.observacao}
                onChange={(valor) => {
                    SetPedidoCabecalho(atual.id, { observacao: valor });
                    recarregar();
                }}
            />
        </VStack>

        {/* Grid de itens, com as colunas da tela dele. */}
        <VStack gap="0.5rem" align="stretch">
            <Flex align="center" justify="space-between" gap="2" wrap="wrap">
                <Text fontSize="1.05rem" color={C.sub} px="0.25rem">
                    Itens ({atual.itens.length})
                </Text>
                {!cancelado && atual.itens.length > 0 ? <Button
                    size="sm"
                    variant="ghost"
                    color={todosEnviados ? C.sub : C.accent}
                    onClick={() => {
                        for (const item of atual.itens) {
                            SetPedidoItem(atual.id, item.id, { enviado: !todosEnviados });
                        }
                        recarregar();
                    }}
                >
                    <IconSend size={16} /> {todosEnviados ? "Desmarcar enviados" : "Marcar tudo enviado"}
                </Button> : undefined}
            </Flex>

            {atual.itens.map((item) => (
                <VStack
                    key={item.id}
                    gap="0.4rem"
                    align="stretch"
                    px="1rem"
                    py="0.7rem"
                    bg={C.surface}
                    borderWidth="0.1rem"
                    borderColor={C.line}
                    borderRadius="lg"
                >
                    <Flex align="center" gap="3">
                        <Text fontSize="0.9rem" color={C.faint} w="1.5rem" flexShrink={0} textAlign="center">
                            {item.numeroItem}
                        </Text>

                        <Box flex="1" minW="0">
                            <Text fontSize="1.05rem" color={C.ink} lineClamp={2}>{item.descricao}</Text>
                            <Text fontSize="0.85rem" color={C.sub}>
                                {item.produto} · {decimal(item.quantidade)} {item.unidade} ×{" "}
                                {moeda(item.valorUnitario)}
                                {item.leadTimeItem + item.leadTimeTransporte > 0
                                    ? ` · ${item.leadTimeItem + item.leadTimeTransporte} dias`
                                    : ""}
                            </Text>
                            <Text fontSize="0.8rem" color={C.faint}>
                                {item.solicitante} · compra {item.comprador}
                                {item.centroCusto != "" ? ` · c. custo ${item.centroCusto}` : ""}
                                {item.conta != "" ? ` · conta ${item.conta}` : ""}
                                {" · req. " + item.origens.join(", ")}
                            </Text>
                        </Box>

                        <Text fontSize="1.05rem" color={C.ink} whiteSpace="nowrap">
                            {moeda(item.valorUnitario * item.quantidade)}
                        </Text>

                        {!cancelado ? <Box
                            as="button"
                            color={C.faint}
                            _hover={{ color: C.danger }}
                            onClick={() => {
                                RemovePedidoItem(atual.id, item.id);
                                recarregar();
                            }}
                        >
                            <IconTrash size={18} />
                        </Box> : undefined}
                    </Flex>

                    {/* Enviado e impresso, as duas colunas de controle do grid
                        dele, aqui como marcas que da para tocar. */}
                    <Flex gap="2" wrap="wrap">
                        <Marca
                            ligado={item.enviado}
                            texto="Enviado"
                            icone={<IconSend size={13} />}
                            onClick={() => {
                                SetPedidoItem(atual.id, item.id, { enviado: !item.enviado });
                                recarregar();
                            }}
                        />
                        <Marca
                            ligado={item.impresso}
                            texto="Impresso"
                            icone={<IconPrinter size={13} />}
                            onClick={() => {
                                SetPedidoItem(atual.id, item.id, { impresso: !item.impresso });
                                recarregar();
                            }}
                        />
                        <Marca
                            ligado={item.recebido >= item.quantidade}
                            texto={item.recebido >= item.quantidade
                                ? "Recebido"
                                : item.recebido > 0 ? `Recebido ${decimal(item.recebido)}` : "Receber"}
                            icone={<IconCheck size={13} />}
                            onClick={() => {
                                SetPedidoItem(atual.id, item.id, {
                                    recebido: item.recebido >= item.quantidade ? 0 : item.quantidade,
                                });
                                recarregar();
                            }}
                        />
                    </Flex>
                </VStack>
            ))}
        </VStack>

        {/* Rodape com os mesmos totais da tela dele. */}
        <VStack
            gap="0.3rem"
            align="stretch"
            px="1rem"
            py="0.8rem"
            bg={C.surfaceHover}
            borderWidth="0.1rem"
            borderColor={C.line}
            borderRadius="lg"
        >
            <Total rotulo="Total dos produtos" valor={totais.produtos} />
            <Total rotulo="Total do IPI" valor={totais.ipi} />
            <Total rotulo="Valor de ICMS-ST" valor={totais.icmsSt} />
            <Total rotulo="Total do saldo" valor={totais.saldo} />
            <Total rotulo="Valor frete" valor={totais.frete} />
            <Total rotulo="Total do pedido c/ IPI + frete" valor={totais.total} forte />
        </VStack>

        <Button
            variant="outline"
            bg={C.surface}
            color={C.ink}
            borderColor={C.line}
            onClick={() => { BaixarCsv("pedido-" + atual.numero + ".csv", PedidoCsv(atual)) }}
        >
            <IconFileSpreadsheet size={18} /> Gera Excel
        </Button>

        <MenuItem action="back" override="/restricted/pedidos" />
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

function Total({ rotulo, valor, forte }: { rotulo: string, valor: number, forte?: boolean }) {
    return <Flex align="baseline" justify="space-between" gap="3">
        <Text fontSize={forte ? "1rem" : "0.9rem"} color={forte ? C.ink : C.sub}>{rotulo}</Text>
        <Text fontSize={forte ? "1.15rem" : "0.95rem"} color={C.ink}>{moeda(valor)}</Text>
    </Flex>
}

// Marca de controle do item, no lugar do checkbox da tela dele: na tela do
// armario o dedo nao acerta um quadradinho.
function Marca({
    ligado,
    texto,
    icone,
    onClick,
}: {
    ligado: boolean;
    texto: string;
    icone: React.ReactNode;
    onClick: () => void;
}) {
    return <Flex
        role="button"
        align="center"
        gap="1.5"
        px="0.7rem"
        py="0.35rem"
        borderRadius="md"
        borderWidth="0.1rem"
        borderColor={ligado ? C.success : C.line}
        bg={ligado ? C.successSoft : C.surface}
        color={ligado ? C.successInk : C.sub}
        cursor="pointer"
        onClick={onClick}
    >
        {icone}
        <Text fontSize="0.8rem">{texto}</Text>
    </Flex>
}
