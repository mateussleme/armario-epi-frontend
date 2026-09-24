"use client"

import {
    Cotacao,
    CotacaoFornecedorItem,
    FornecedorNome,
    GetCotacao,
    QuantidadeDoItem,
    STATUS_FECHADA,
    SetDadosFornecedor,
    SetStatus,
    SetValorItem,
    SetVencedor,
    TIPOS_FRETE,
    Totais,
    UnitarioComImpostos,
    ValorTotalItem,
    comoTexto,
    decimal,
    moeda,
    numeroDigitado,
} from "@/api/cotacoes";
import { MenuItem } from "@/components/menu-item";
import { SelectField } from "@/components/select-field";
import { Badge, Box, Button, Flex, Input, Text, VStack } from "@chakra-ui/react";
import { IconChevronDown, IconTrophy } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { C } from "@/theme/colors";

// Entrada de valores, no formato da tela "Cotação - Entrada de valores". Grid de
// cima: um fornecedor por linha, com validade, numero da cotacao dele, condicao
// de pagamento, frete e desconto. Grid de baixo: os itens do fornecedor
// selecionado, com vencedor, valor unitario, impostos, leadtimes e fabricante.
// Trocar o fornecedor de cima recarrega o de baixo.
//
// O que a pessoa digita fica num rascunho separado do valor guardado: so o texto
// preserva a virgula no meio da digitacao. A chave inclui o fornecedor, entao
// trocar de fornecedor nao mistura os campos.
export function CotacaoValores({ id }: { id: number }) {
    const [cotacao, setCotacao] = useState<Cotacao | undefined>(undefined);
    const [carregado, setCarregado] = useState(false);
    const [ativo, setAtivo] = useState("");
    const [rascunhos, setRascunhos] = useState<Record<string, string>>({});
    // Impostos ficam recolhidos: sao sete campos por item, e na maioria das
    // linhas ninguem preenche nenhum.
    const [impostosAbertos, setImpostosAbertos] = useState<number[]>([]);

    useEffect(() => {
        // Timeout pelo mesmo motivo do resto do projeto: setState direto no
        // corpo do efeito dispara render em cascata.
        const primeira = setTimeout(() => {
            const inicial = GetCotacao(id);
            setCotacao(inicial);
            setCarregado(true);
            if (inicial != undefined && inicial.fornecedores.length > 0) {
                setAtivo(inicial.fornecedores[0].fornecedor);
            }
        }, 0);

        return () => { clearTimeout(primeira) };
    }, [id]);

    function recarregar() {
        setCotacao(GetCotacao(id));
    }

    function escrever(chave: string, valor: string) {
        setRascunhos({ ...rascunhos, [chave]: valor });
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
    const fornecedorAtivo = atual.fornecedores.find((f) => f.fornecedor == ativo);
    const faltaAlgum = atual.fornecedores.some((f) => Totais(atual, f.fornecedor).semValor > 0);
    const totaisAtivo = fornecedorAtivo != undefined ? Totais(atual, fornecedorAtivo.fornecedor) : undefined;

    // Os campos ficam em componentes de modulo, e nao aqui dentro: definidos
    // dentro do render eles remontariam a cada tecla e o input perderia o foco.
    const ctx: Ctx = { rascunhos, escrever, recarregar };

    return <VStack gap="1.25rem" w="100%" align="stretch">
        <Flex align="baseline" gap="3" wrap="wrap">
            <Text fontSize="1.35rem" color={C.ink}>Cotação {atual.numero}</Text>
            <Text fontSize="0.95rem" color={C.sub}>entrada de valores</Text>
        </Flex>

        {/* Grid de cima: os fornecedores. A linha selecionada abre os dados
            gerais da proposta. */}
        <VStack gap="0.5rem" align="stretch">
            {atual.fornecedores.map((fornecedor) => {
                const selecionado = fornecedor.fornecedor == ativo;
                const totais = Totais(atual, fornecedor.fornecedor);

                return <VStack
                    key={fornecedor.fornecedor}
                    gap="0.6rem"
                    align="stretch"
                    px="1rem"
                    py="0.7rem"
                    bg={selecionado ? C.accentSoft : C.surface}
                    borderWidth="0.1rem"
                    borderColor={selecionado ? C.accent : C.line}
                    borderRadius="lg"
                    cursor={selecionado ? undefined : "pointer"}
                    onClick={() => { setAtivo(fornecedor.fornecedor) }}
                >
                    <Flex align="center" gap="3">
                        <Box flex="1" minW="0">
                            <Text fontSize="1.05rem" color={C.ink} lineClamp={2}>
                                {FornecedorNome(fornecedor.fornecedor)}
                            </Text>
                            <Text fontSize="0.85rem" color={C.sub}>
                                {fornecedor.fornecedor}
                                {totais.prazo > 0 ? ` · entrega em ${totais.prazo} dias` : ""}
                            </Text>
                        </Box>

                        {totais.semValor > 0 ? <Badge bg={C.warningSoft} color={C.warningInk} px="2" py="1" borderRadius="md" fontSize="0.75rem">
                            FALTAM {totais.semValor}
                        </Badge> : <Text fontSize="1.05rem" color={C.ink} whiteSpace="nowrap">
                            {moeda(totais.total)}
                        </Text>}
                    </Flex>

                    {selecionado ? <VStack gap="0.5rem" align="stretch">
                        <Flex gap="2" wrap="wrap">
                            <Box flex="1" minW="9rem">
                                <Text fontSize="0.8rem" color={C.sub} mb="0.2rem">Validade da cotação</Text>
                                <Input
                                    type="date"
                                    value={fornecedor.validade}
                                    fontSize="1rem"
                                    bg={C.surface}
                                    borderColor={C.line}
                                    color={C.ink}
                                    onChange={(e) => {
                                        SetDadosFornecedor(atual.id, fornecedor.fornecedor, {
                                            validade: e.currentTarget.value,
                                        });
                                        recarregar();
                                    }}
                                />
                            </Box>
                            <CampoTexto
                                rotulo="Nº da cotação do fornecedor"
                                valor={fornecedor.numeroCotacaoFornecedor}
                                onChange={(valor) => {
                                    SetDadosFornecedor(atual.id, fornecedor.fornecedor, {
                                        numeroCotacaoFornecedor: valor,
                                    });
                                    recarregar();
                                }}
                            />
                        </Flex>

                        <Flex gap="2" wrap="wrap">
                            <CampoTexto
                                rotulo="Condição de pagamento"
                                valor={fornecedor.condicaoPagamento}
                                onChange={(valor) => {
                                    SetDadosFornecedor(atual.id, fornecedor.fornecedor, { condicaoPagamento: valor });
                                    recarregar();
                                }}
                            />
                            <Box flex="1" minW="9rem">
                                <Text fontSize="0.8rem" color={C.sub} mb="0.2rem">Tipo de frete</Text>
                                <SelectField
                                    value={String(fornecedor.tipoFrete)}
                                    onChange={(valor) => {
                                        SetDadosFornecedor(atual.id, fornecedor.fornecedor, {
                                            tipoFrete: Number(valor),
                                        });
                                        recarregar();
                                    }}
                                    options={TIPOS_FRETE}
                                />
                            </Box>
                        </Flex>

                        <Flex gap="2" wrap="wrap">
                            <CampoNumero
                                ctx={ctx}
                                chave={"freteF:" + fornecedor.fornecedor}
                                rotulo="Frete fornecedor"
                                valor={fornecedor.freteFornecedor}
                                onChange={(valor) => {
                                    SetDadosFornecedor(atual.id, fornecedor.fornecedor, { freteFornecedor: valor });
                                }}
                            />
                            <CampoNumero
                                ctx={ctx}
                                chave={"freteM:" + fornecedor.fornecedor}
                                rotulo="Frete MK"
                                valor={fornecedor.freteMk}
                                onChange={(valor) => {
                                    SetDadosFornecedor(atual.id, fornecedor.fornecedor, { freteMk: valor });
                                }}
                            />
                            <CampoNumero
                                ctx={ctx}
                                chave={"desc:" + fornecedor.fornecedor}
                                rotulo="Desconto"
                                valor={fornecedor.desconto}
                                onChange={(valor) => {
                                    SetDadosFornecedor(atual.id, fornecedor.fornecedor, { desconto: valor });
                                }}
                            />
                        </Flex>
                    </VStack> : undefined}
                </VStack>
            })}
        </VStack>

        {/* Grid de baixo: os itens do fornecedor selecionado. */}
        {fornecedorAtivo != undefined ? <VStack gap="0.5rem" align="stretch">
            <Text fontSize="1.05rem" color={C.sub} px="0.25rem">
                Itens de {FornecedorNome(fornecedorAtivo.fornecedor)}
            </Text>

            {fornecedorAtivo.itens.map((valor: CotacaoFornecedorItem) => {
                const item = atual.itens.find((i) => i.id == valor.item);
                const quantidade = QuantidadeDoItem(atual, valor.item);
                const abertos = impostosAbertos.includes(valor.item);
                const prefixo = fornecedorAtivo.fornecedor + ":" + String(valor.item);

                return <VStack
                    key={valor.item}
                    gap="0.5rem"
                    align="stretch"
                    px="1rem"
                    py="0.7rem"
                    bg={C.surface}
                    borderWidth="0.1rem"
                    borderColor={valor.vencedor ? C.success : valor.valorUnitario > 0 ? C.line : C.warning}
                    borderRadius="lg"
                >
                    <Flex align="center" gap="3">
                        {/* Vencedor: e daqui que sai o pedido de compra. Marcar
                            num fornecedor desmarca o mesmo item nos outros. */}
                        <Flex
                            role="button"
                            align="center"
                            justify="center"
                            w="2rem"
                            h="2rem"
                            flexShrink={0}
                            borderRadius="md"
                            borderWidth="0.1rem"
                            borderColor={valor.vencedor ? C.success : C.line}
                            bg={valor.vencedor ? C.success : C.surface}
                            color={valor.vencedor ? "white" : C.faint}
                            cursor="pointer"
                            onClick={() => {
                                SetVencedor(atual.id, fornecedorAtivo.fornecedor, valor.item, !valor.vencedor);
                                recarregar();
                            }}
                        >
                            <IconTrophy size={16} />
                        </Flex>

                        <Box flex="1" minW="0">
                            <Text fontSize="1.05rem" color={C.ink} lineClamp={2}>
                                {item?.descricao ?? String(valor.item)}
                            </Text>
                            <Text fontSize="0.85rem" color={C.sub}>
                                {item?.produto} · {decimal(quantidade)} {item?.unidade}
                                {valor.valorUnitario > 0 ? ` · c/ imp. ${moeda(UnitarioComImpostos(atual, valor))}` : ""}
                            </Text>
                        </Box>

                        {valor.valorUnitario > 0 ? <Text fontSize="1.05rem" color={C.ink} whiteSpace="nowrap">
                            {moeda(ValorTotalItem(atual, valor))}
                        </Text> : undefined}
                    </Flex>

                    <Flex gap="2" wrap="wrap">
                        <CampoNumero
                                ctx={ctx}
                            chave={"uni:" + prefixo}
                            rotulo="Valor unitário"
                            valor={valor.valorUnitario}
                            onChange={(novo) => {
                                SetValorItem(atual.id, fornecedorAtivo.fornecedor, valor.item, { valorUnitario: novo });
                            }}
                        />
                        <CampoNumero
                                ctx={ctx}
                            chave={"lti:" + prefixo}
                            rotulo="Lead time item"
                            sufixo="dias"
                            valor={valor.leadTimeItem}
                            onChange={(novo) => {
                                SetValorItem(atual.id, fornecedorAtivo.fornecedor, valor.item, { leadTimeItem: novo });
                            }}
                        />
                        <CampoNumero
                                ctx={ctx}
                            chave={"ltt:" + prefixo}
                            rotulo="Lead time transp."
                            sufixo="dias"
                            valor={valor.leadTimeTransporte}
                            onChange={(novo) => {
                                SetValorItem(atual.id, fornecedorAtivo.fornecedor, valor.item, {
                                    leadTimeTransporte: novo,
                                });
                            }}
                        />
                    </Flex>

                    <Flex
                        role="button"
                        align="center"
                        gap="1"
                        cursor="pointer"
                        color={C.accent}
                        onClick={() => {
                            setImpostosAbertos(abertos
                                ? impostosAbertos.filter((i) => i != valor.item)
                                : [...impostosAbertos, valor.item]);
                        }}
                    >
                        <Text fontSize="0.85rem">Impostos e fabricante</Text>
                        <Box transform={abertos ? "rotate(180deg)" : undefined} transition="transform .15s">
                            <IconChevronDown size={16} />
                        </Box>
                    </Flex>

                    {abertos ? <VStack gap="0.5rem" align="stretch">
                        <Flex gap="2" wrap="wrap">
                            <CampoNumero
                                ctx={ctx}
                                chave={"ipi:" + prefixo}
                                rotulo="IPI"
                                sufixo="%"
                                valor={valor.ipi}
                                onChange={(novo) => {
                                    SetValorItem(atual.id, fornecedorAtivo.fornecedor, valor.item, { ipi: novo });
                                }}
                            />
                            <CampoNumero
                                ctx={ctx}
                                chave={"icms:" + prefixo}
                                rotulo="ICMS"
                                sufixo="%"
                                valor={valor.icms}
                                onChange={(novo) => {
                                    SetValorItem(atual.id, fornecedorAtivo.fornecedor, valor.item, { icms: novo });
                                }}
                            />
                            <CampoNumero
                                ctx={ctx}
                                chave={"pis:" + prefixo}
                                rotulo="PIS"
                                sufixo="%"
                                valor={valor.pis}
                                onChange={(novo) => {
                                    SetValorItem(atual.id, fornecedorAtivo.fornecedor, valor.item, { pis: novo });
                                }}
                            />
                            <CampoNumero
                                ctx={ctx}
                                chave={"cof:" + prefixo}
                                rotulo="COFINS"
                                sufixo="%"
                                valor={valor.cofins}
                                onChange={(novo) => {
                                    SetValorItem(atual.id, fornecedorAtivo.fornecedor, valor.item, { cofins: novo });
                                }}
                            />
                        </Flex>
                        <Flex gap="2" wrap="wrap">
                            <CampoNumero
                                ctx={ctx}
                                chave={"st:" + prefixo}
                                rotulo="ICMS-ST"
                                sufixo="R$"
                                valor={valor.icmsSt}
                                onChange={(novo) => {
                                    SetValorItem(atual.id, fornecedorAtivo.fornecedor, valor.item, { icmsSt: novo });
                                }}
                            />
                            <CampoNumero
                                ctx={ctx}
                                chave={"dif:" + prefixo}
                                rotulo="DIFAL"
                                sufixo="R$"
                                valor={valor.difal}
                                onChange={(novo) => {
                                    SetValorItem(atual.id, fornecedorAtivo.fornecedor, valor.item, { difal: novo });
                                }}
                            />
                            <CampoNumero
                                ctx={ctx}
                                chave={"fat:" + prefixo}
                                rotulo="Fator impostos"
                                sufixo="%"
                                valor={valor.fatorImpostos}
                                onChange={(novo) => {
                                    SetValorItem(atual.id, fornecedorAtivo.fornecedor, valor.item, {
                                        fatorImpostos: novo,
                                    });
                                }}
                            />
                        </Flex>
                        <CampoTexto
                            rotulo="Fabricante"
                            valor={valor.fabricante}
                            onChange={(novo) => {
                                SetValorItem(atual.id, fornecedorAtivo.fornecedor, valor.item, { fabricante: novo });
                                recarregar();
                            }}
                        />
                    </VStack> : undefined}
                </VStack>
            })}
        </VStack> : undefined}

        {/* Rodape com os totais do fornecedor selecionado, como na tela dele. */}
        {totaisAtivo != undefined ? <VStack
            gap="0.3rem"
            align="stretch"
            px="1rem"
            py="0.8rem"
            bg={C.surfaceHover}
            borderWidth="0.1rem"
            borderColor={C.line}
            borderRadius="lg"
        >
            <Total rotulo="Total de descontos" valor={totaisAtivo.desconto} />
            <Total rotulo="Total IPI" valor={totaisAtivo.ipi} />
            <Total rotulo="Total ICMS" valor={totaisAtivo.icms} />
            <Total rotulo="Total ICMS-ST" valor={totaisAtivo.icmsSt} />
            <Total rotulo="Total produtos + frete" valor={totaisAtivo.total} forte />
        </VStack> : undefined}

        {/* Fechar so quando todos os fornecedores tem valor em todos os itens.
            Enquanto falta algo, a cotacao continua pendente. */}
        <Button
            bg={faltaAlgum ? C.surfaceHover : C.success}
            color={faltaAlgum ? C.faint : "white"}
            disabled={faltaAlgum}
            onClick={() => {
                SetStatus(atual.id, STATUS_FECHADA);
                recarregar();
            }}
        >
            {faltaAlgum ? "Fechar cotação (faltam valores)" : "Fechar cotação"}
        </Button>

        <MenuItem action="back" override={"/restricted/cotacoes/" + String(atual.id)} />
    </VStack>
}

type Ctx = {
    rascunhos: Record<string, string>;
    escrever: (chave: string, valor: string) => void;
    recarregar: () => void;
};

// Campo de numero com rascunho: o texto digitado fica guardado a parte para a
// virgula sobreviver no meio da digitacao.
function CampoNumero({
    ctx,
    chave,
    rotulo,
    valor,
    onChange,
    sufixo,
}: {
    ctx: Ctx;
    chave: string;
    rotulo: string;
    valor: number;
    onChange: (valor: number) => void;
    sufixo?: string;
}) {
    return <Box flex="1" minW="7rem">
        <Text fontSize="0.8rem" color={C.sub} mb="0.2rem">
            {rotulo}{sufixo != undefined ? ` (${sufixo})` : ""}
        </Text>
        <Input
            value={ctx.rascunhos[chave] ?? comoTexto(valor)}
            placeholder="0"
            inputMode="decimal"
            fontSize="1rem"
            bg={C.surface}
            borderColor={C.line}
            color={C.ink}
            onChange={(e) => {
                const digitado = e.currentTarget.value;
                ctx.escrever(chave, digitado);
                onChange(numeroDigitado(digitado));
                ctx.recarregar();
            }}
        />
    </Box>
}

function CampoTexto({
    rotulo,
    valor,
    onChange,
}: {
    rotulo: string;
    valor: string;
    onChange: (valor: string) => void;
}) {
    return <Box flex="1" minW="9rem">
        <Text fontSize="0.8rem" color={C.sub} mb="0.2rem">{rotulo}</Text>
        <Input
            value={valor}
            fontSize="1rem"
            bg={C.surface}
            borderColor={C.line}
            color={C.ink}
            onChange={(e) => { onChange(e.currentTarget.value) }}
        />
    </Box>
}

function Total({ rotulo, valor, forte }: { rotulo: string, valor: number, forte?: boolean }) {
    return <Flex align="baseline" justify="space-between" gap="3">
        <Text fontSize={forte ? "1rem" : "0.9rem"} color={forte ? C.ink : C.sub}>{rotulo}</Text>
        <Text fontSize={forte ? "1.15rem" : "0.95rem"} color={C.ink}>{moeda(valor)}</Text>
    </Flex>
}
