"use client"

import {
    AddRequisicao,
    Agrupar,
    BaixarCsv,
    CriarCotacao,
    LinhaACotar,
    ListFornecedores,
    ListRequisicoes,
    RemoveRequisicao,
    RequisicaoItem,
    decimal,
    moeda,
} from "@/api/cotacoes";
import { SelectField } from "@/components/select-field";
import { Badge, Box, Button, Flex, Input, Text, VStack } from "@chakra-ui/react";
import { IconBuildingStore, IconCheck, IconFileSpreadsheet, IconPlus, IconSearch, IconTrash } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { C } from "@/theme/colors";

// Ignora acento e maiuscula na busca, igual ao search-list do resto do projeto.
function normalizar(valor: string) {
    return valor.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

// A fila de itens de requisicao de compra esperando cotacao, no formato da tela
// "Consulta Requisicoes" do ERP: seleciona as linhas, clica em Cotar, escolhe os
// fornecedores e monta a cotacao.
//
// A leitura acontece no efeito, e nao no primeiro render, porque o estado
// mockado mora no sessionStorage e o servidor nao tem isso.
export function ItensACotar() {
    const router = useRouter();

    const [requisicoes, setRequisicoes] = useState<RequisicaoItem[] | undefined>(undefined);
    const [busca, setBusca] = useState("");
    const [agrupar, setAgrupar] = useState(false);
    const [usarUltimaCompra, setUsarUltimaCompra] = useState(true);
    const [marcados, setMarcados] = useState<number[]>([]);
    const [escolhendoFornecedor, setEscolhendoFornecedor] = useState(false);
    const [fornecedoresMarcados, setFornecedoresMarcados] = useState<string[]>([]);
    const [novo, setNovo] = useState(false);
    const [numeroRequisicao, setNumeroRequisicao] = useState("");
    const [produto, setProduto] = useState("");
    const [descricao, setDescricao] = useState("");
    const [quantidade, setQuantidade] = useState("");
    const [unidade, setUnidade] = useState("PÇ");

    useEffect(() => {
        // Sai num timeout, e nao direto no corpo do efeito, para nao disparar
        // render em cascata na montagem. Mesmo motivo da lista de separacao.
        const primeira = setTimeout(() => { setRequisicoes(ListRequisicoes()) }, 0);
        return () => { clearTimeout(primeira) };
    }, []);

    const fornecedores = ListFornecedores();

    if (requisicoes == undefined) {
        return <Box w="100%" px="2rem" py="2rem" textAlign="center">
            <Text fontSize="1.05rem" color={C.sub}>Carregando...</Text>
        </Box>
    }

    // Copia local so para o TypeScript: dentro das funcoes abaixo ele nao
    // enxerga o retorno acima e volta a achar que pode ser undefined.
    const fila = requisicoes;

    // Filtro por texto sobre tudo que da para procurar na linha. A tela dele tem
    // filtro por coluna; aqui e um campo so, que no celular funciona melhor.
    const palavras = normalizar(busca.trim()).split(/\s+/).filter((p) => p != "");
    const filtradas = fila.filter((item) => {
        if (palavras.length == 0) {
            return true;
        }

        const termos = normalizar([item.requisicao, item.produto, item.descricao, item.unidade].join(" "));
        return palavras.every((palavra) => termos.includes(palavra));
    });

    const linhas = Agrupar(filtradas, agrupar);
    // A selecao e por linha de requisicao, entao continua valendo com ou sem
    // agrupamento: a linha agrupada esta marcada quando todas as suas estao.
    const linhasMarcadas = linhas.filter((linha) => linha.ids.every((id) => marcados.includes(id)));
    const todasMarcadas = linhas.length > 0 && linhasMarcadas.length == linhas.length;

    function alternar(linha: LinhaACotar) {
        const marcada = linha.ids.every((id) => marcados.includes(id));
        setMarcados(marcada
            ? marcados.filter((id) => !linha.ids.includes(id))
            : [...marcados, ...linha.ids.filter((id) => !marcados.includes(id))]);
    }

    function alternarTodas() {
        setMarcados(todasMarcadas ? [] : linhas.flatMap((linha) => linha.ids));
    }

    // Cotar: abre a lista de fornecedores. Com "fornecedor da ultima compra"
    // ligado, quem ja vendeu esses itens antes ja vem marcado.
    function cotar() {
        const principais: string[] = [];
        if (usarUltimaCompra) {
            for (const linha of linhasMarcadas) {
                const codigo = linha.fornecedorUltimaCompra;
                if (codigo != undefined && !principais.includes(codigo)) {
                    principais.push(codigo);
                }
            }
        }

        setFornecedoresMarcados(principais);
        setEscolhendoFornecedor(true);
    }

    function alternarFornecedor(codigo: string) {
        setFornecedoresMarcados(
            fornecedoresMarcados.includes(codigo)
                ? fornecedoresMarcados.filter((f) => f != codigo)
                : [...fornecedoresMarcados, codigo],
        );
    }

    function montar() {
        const cotacao = CriarCotacao(linhasMarcadas, fornecedoresMarcados, "");
        router.push("/restricted/cotacoes/" + String(cotacao.id));
    }

    function adicionar() {
        const qtde = Number(quantidade.replace(",", "."));
        if (numeroRequisicao.trim() == "" || descricao.trim() == "" || isNaN(qtde) || qtde <= 0) {
            return;
        }

        AddRequisicao({
            requisicao: numeroRequisicao.trim(),
            produto: produto.trim() != "" ? produto.trim() : "99999999",
            descricao: descricao.trim(),
            quantidade: qtde,
            unidade,
        });

        setNumeroRequisicao("");
        setProduto("");
        setDescricao("");
        setQuantidade("");
        setNovo(false);
        setRequisicoes(ListRequisicoes());
    }

    function excluir(id: number) {
        RemoveRequisicao(id);
        setMarcados(marcados.filter((m) => m != id));
        setRequisicoes(ListRequisicoes());
    }

    function exportar() {
        const colunas = ["Nº Requisição", "Empresa", "Nº Item", "Cód.", "Descrição do Produto", "Qtde", "Unidade", "Val. Uni."];
        const conteudo = [colunas.join(";")];
        for (const item of filtradas) {
            conteudo.push([
                item.requisicao,
                item.empresa,
                String(item.numeroItem),
                item.produto,
                "\"" + item.descricao.replace(/"/g, "\"\"") + "\"",
                String(item.quantidade).replace(".", ","),
                item.unidade,
                String(item.valorUltimaCompra).replace(".", ","),
            ].join(";"));
        }

        BaixarCsv("requisicoes-a-cotar.csv", conteudo.join("\r\n"));
    }

    // Passo 2: para quais fornecedores enviar.
    if (escolhendoFornecedor) {
        return <VStack gap="0.75rem" w="100%" align="stretch">
            <Flex align="center" gap="2">
                <Box color={C.accent}><IconBuildingStore size={22} /></Box>
                <Text fontSize="1.15rem" color={C.ink}>Para quais fornecedores enviar</Text>
            </Flex>
            <Text fontSize="0.9rem" color={C.sub}>
                {linhasMarcadas.length} {linhasMarcadas.length == 1 ? "item selecionado" : "itens selecionados"}.
                {usarUltimaCompra ? " Quem vendeu na última compra já vem marcado." : ""}
            </Text>

            {fornecedores.map((fornecedor) => {
                const marcado = fornecedoresMarcados.includes(fornecedor.codigo);
                const ultimas = linhasMarcadas.filter((l) => l.fornecedorUltimaCompra == fornecedor.codigo).length;

                return <Flex
                    key={fornecedor.codigo}
                    align="center"
                    gap="3"
                    px="1rem"
                    py="0.7rem"
                    bg={marcado ? C.accentSoft : C.surface}
                    borderWidth="0.1rem"
                    borderColor={marcado ? C.accent : C.line}
                    borderRadius="lg"
                    cursor="pointer"
                    onClick={() => { alternarFornecedor(fornecedor.codigo) }}
                >
                    <Caixa marcado={marcado} />
                    <Box flex="1" minW="0">
                        <Text fontSize="1.05rem" color={C.ink} lineClamp={2}>{fornecedor.razaoSocial}</Text>
                        <Text fontSize="0.85rem" color={C.sub}>{fornecedor.codigo}</Text>
                    </Box>
                    {ultimas > 0 ? <Badge bg={C.accent} color="white" px="2" py="1" borderRadius="md" fontSize="0.75rem">
                        ÚLTIMA COMPRA DE {ultimas}
                    </Badge> : undefined}
                </Flex>
            })}

            <Flex gap="2" mt="0.5rem">
                <Button
                    flex="1"
                    variant="outline"
                    bg={C.surface}
                    color={C.ink}
                    borderColor={C.line}
                    onClick={() => { setEscolhendoFornecedor(false) }}
                >
                    Voltar
                </Button>
                <Button
                    flex="2"
                    bg={C.accent}
                    color="white"
                    disabled={fornecedoresMarcados.length == 0}
                    onClick={montar}
                >
                    Montar cotação
                </Button>
            </Flex>
        </VStack>
    }

    // Passo 1: a fila de itens a cotar.
    return <VStack gap="0.5rem" w="100%" align="stretch">
        <Flex
            w="100%"
            align="center"
            gap="3"
            px="1rem"
            py="0.6rem"
            bg={C.surface}
            borderWidth="0.1rem"
            borderColor={C.line}
            borderRadius="lg"
        >
            <Box color={C.faint} flexShrink={0}><IconSearch size={20} /></Box>
            <Input
                value={busca}
                onChange={(e) => { setBusca(e.currentTarget.value) }}
                placeholder="Filtrar por requisição, código ou descrição"
                variant="flushed"
                border="none"
                px="0"
                fontSize="1rem"
                color={C.ink}
                _focus={{ boxShadow: "none" }}
            />
        </Flex>

        {/* As duas opcoes que ficam no rodape da tela dele. */}
        <Flex gap="2" wrap="wrap">
            <Opcao ligado={agrupar} onClick={() => { setAgrupar(!agrupar) }} texto="Agrupar item" />
            <Opcao
                ligado={usarUltimaCompra}
                onClick={() => { setUsarUltimaCompra(!usarUltimaCompra) }}
                texto="Carregar fornecedor da última compra"
            />
        </Flex>

        <Flex align="center" justify="space-between" gap="2" wrap="wrap" mt="0.25rem">
            <Text fontSize="1.05rem" color={C.sub}>
                {linhas.length} {linhas.length == 1 ? "item a cotar" : "itens a cotar"}
            </Text>
            <Flex gap="1" wrap="wrap">
                <Button size="sm" variant="ghost" color={C.accent} onClick={alternarTodas} disabled={linhas.length == 0}>
                    {todasMarcadas ? "Limpar seleção" : "Selecionar todos"}
                </Button>
                <Button size="sm" variant="ghost" color={C.accent} onClick={() => { setNovo(!novo) }}>
                    <IconPlus size={16} /> Item
                </Button>
                <Button size="sm" variant="ghost" color={C.accent} onClick={exportar} disabled={linhas.length == 0}>
                    <IconFileSpreadsheet size={16} /> Excel
                </Button>
            </Flex>
        </Flex>

        {/* Insercao manual: da para jogar um item na fila sem esperar a
            requisicao de compra. */}
        {novo ? <VStack
            gap="0.5rem"
            align="stretch"
            px="1rem"
            py="0.9rem"
            bg={C.surface}
            borderWidth="0.1rem"
            borderColor={C.accent}
            borderRadius="lg"
        >
            <Text fontSize="1rem" color={C.ink}>Novo item a cotar</Text>
            <Input
                value={numeroRequisicao}
                onChange={(e) => { setNumeroRequisicao(e.currentTarget.value.replace(/\D/g, "")) }}
                placeholder="Nº da requisição"
                inputMode="numeric"
                bg={C.surface}
                borderColor={C.line}
                color={C.ink}
            />
            <Input
                value={produto}
                onChange={(e) => { setProduto(e.currentTarget.value) }}
                placeholder="Código do produto (vazio = 99999999)"
                bg={C.surface}
                borderColor={C.line}
                color={C.ink}
            />
            <Input
                value={descricao}
                onChange={(e) => { setDescricao(e.currentTarget.value) }}
                placeholder="Descrição do produto"
                bg={C.surface}
                borderColor={C.line}
                color={C.ink}
            />
            <Flex gap="2">
                <Input
                    flex="1"
                    value={quantidade}
                    onChange={(e) => { setQuantidade(e.currentTarget.value.replace(/[^\d,]/g, "")) }}
                    placeholder="Qtde"
                    inputMode="decimal"
                    bg={C.surface}
                    borderColor={C.line}
                    color={C.ink}
                />
                <Box flex="1">
                    <SelectField
                        value={unidade}
                        onChange={setUnidade}
                        options={["PÇ", "PC", "UN", "UNI", "M", "KG", "L"].map((u) => ({ value: u, label: u }))}
                    />
                </Box>
            </Flex>
            <Flex gap="2">
                <Button flex="1" variant="outline" bg={C.surface} color={C.ink} borderColor={C.line} onClick={() => { setNovo(false) }}>
                    Cancelar
                </Button>
                <Button flex="1" bg={C.accent} color="white" onClick={adicionar}>
                    Adicionar
                </Button>
            </Flex>
        </VStack> : undefined}

        {linhas.length == 0 ? <Box
            w="100%"
            px="2rem"
            py="2rem"
            textAlign="center"
            borderWidth="0.1rem"
            borderStyle="dashed"
            borderColor={C.line}
            borderRadius="xl"
        >
            <Text fontSize="1.05rem" color={C.sub}>Nenhum item a cotar.</Text>
        </Box> : undefined}

        {linhas.map((linha) => {
            const marcado = linha.ids.every((id) => marcados.includes(id));

            return <Flex
                key={linha.ids.join("-")}
                align="center"
                gap="3"
                px="1rem"
                py="0.7rem"
                bg={marcado ? C.accentSoft : C.surface}
                borderWidth="0.1rem"
                borderColor={marcado ? C.accent : C.line}
                borderRadius="lg"
                cursor="pointer"
                onClick={() => { alternar(linha) }}
            >
                <Caixa marcado={marcado} />

                <Box flex="1" minW="0">
                    <Text fontSize="1.05rem" color={C.ink} lineClamp={2}>{linha.descricao}</Text>
                    <Text fontSize="0.85rem" color={C.sub}>
                        req. {linha.origens.join(", ")} · {linha.produto}
                        {linha.valorUltimaCompra > 0 ? ` · última ${moeda(linha.valorUltimaCompra)}` : ""}
                    </Text>
                </Box>

                <Flex align="center" gap="3" flexShrink={0}>
                    <Text fontSize="1.05rem" color={C.ink} whiteSpace="nowrap">
                        {decimal(linha.quantidade)} {linha.unidade}
                    </Text>
                    {linha.ids.length > 1 ? <Badge bg={C.infoSoft} color={C.infoInk} px="2" py="1" borderRadius="md" fontSize="0.75rem">
                        {linha.ids.length} REQ.
                    </Badge> : <Box
                        as="button"
                        color={C.faint}
                        _hover={{ color: C.danger }}
                        onClick={(e) => {
                            // Sem isso o clique no lixo tambem marcaria a linha.
                            e.stopPropagation();
                            excluir(linha.ids[0]);
                        }}
                    >
                        <IconTrash size={18} />
                    </Box>}
                </Flex>
            </Flex>
        })}

        <Button
            mt="0.5rem"
            bg={C.accent}
            color="white"
            disabled={linhasMarcadas.length == 0}
            onClick={cotar}
        >
            Cotar {linhasMarcadas.length > 0 ? `(${linhasMarcadas.length})` : ""}
        </Button>
    </VStack>
}

// Caixa de selecao propria, no lugar do checkbox nativo: a tela do armario e
// touch, e o nativo fica pequeno demais para o dedo.
function Caixa({ marcado }: { marcado: boolean }) {
    return <Flex
        align="center"
        justify="center"
        w="1.6rem"
        h="1.6rem"
        flexShrink={0}
        borderRadius="md"
        borderWidth="0.1rem"
        borderColor={marcado ? C.accent : C.line}
        bg={marcado ? C.accent : C.surface}
        color="white"
    >
        {marcado ? <IconCheck size={16} /> : <Box w="1rem" h="1rem" />}
    </Flex>
}

function Opcao({ ligado, onClick, texto }: { ligado: boolean, onClick: () => void, texto: string }) {
    return <Flex
        align="center"
        gap="2"
        px="0.7rem"
        py="0.4rem"
        borderRadius="md"
        borderWidth="0.1rem"
        borderColor={ligado ? C.accent : C.line}
        bg={ligado ? C.accentSoft : C.surface}
        cursor="pointer"
        onClick={onClick}
    >
        <Flex
            align="center"
            justify="center"
            w="1.1rem"
            h="1.1rem"
            borderRadius="sm"
            borderWidth="0.1rem"
            borderColor={ligado ? C.accent : C.line}
            bg={ligado ? C.accent : C.surface}
            color="white"
        >
            {ligado ? <IconCheck size={12} /> : undefined}
        </Flex>
        <Text fontSize="0.85rem" color={ligado ? C.accentInk : C.sub}>{texto}</Text>
    </Flex>
}
