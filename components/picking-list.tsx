"use client"

import { SetItemSeparado, Solicitacao, SolicitacaoItem } from "@/api/solicitacoes";
import { GetItemData } from "@/api/item-data";
import { ItemData } from "@/types/ItemData";
import { AspectRatio, Badge, Box, Button, Flex, Image, Input, Text, VStack } from "@chakra-ui/react";
import { IconAlertTriangle, IconArrowBackUp, IconCheck, IconX } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { C } from "@/theme/colors";

export function PickingList({
    solicitacao,
    itens,
    separador,
}: {
    solicitacao: Solicitacao;
    itens: SolicitacaoItem[];
    separador?: string;
}) {
    const router = useRouter();
    const [lista, setLista] = useState(itens);
    const [fotos, setFotos] = useState({} as Record<string, ItemData | undefined>);
    const [saving, setSaving] = useState("");
    const [erro, setErro] = useState<string | undefined>(undefined);

    // Item aberto para confirmar a quantidade, e o valor digitado.
    const [confirmando, setConfirmando] = useState("");
    const [quantidade, setQuantidade] = useState("");

    // A foto nao vem junto dos itens de proposito: e bytea no banco e viraria um
    // data URL grande por item. Busca por item, como as outras telas fazem.
    useEffect(() => {
        for (const item of itens) {
            GetItemData(item.produto).then((data) => {
                setFotos((current) => ({ ...current, [item.produto]: data }));
            });
        }
    }, [itens]);

    const separados = lista.filter((i) => i.separado).length;

    function abrirConfirmacao(item: SolicitacaoItem) {
        setConfirmando(item.produto);
        // Ja vem com a quantidade pedida, limitada pelo saldo do local: o caso
        // comum e so confirmar, digitar numero e a excecao.
        const sugerido = item.saldo > 0 ? Math.min(item.quantidade, item.saldo) : item.quantidade;
        setQuantidade(String(sugerido));
        setErro(undefined);
    }

    async function confirmar(item: SolicitacaoItem) {
        const valor = parseInt(quantidade, 10);
        if (isNaN(valor) || valor <= 0) {
            setErro("Informe quanto foi separado.");
            return;
        }

        setSaving(item.produto);
        const ok = await SetItemSeparado(solicitacao.id, item.produto, true, valor, separador);
        setSaving("");

        if (!ok) {
            setErro("Não foi possível marcar o item.");
            return;
        }

        setErro(undefined);
        setConfirmando("");
        setLista(lista.map((i) => i.produto == item.produto
            ? { ...i, separado: true, quantidadeSeparada: valor }
            : i));
        router.refresh();
    }

    async function desmarcar(item: SolicitacaoItem) {
        setSaving(item.produto);
        const ok = await SetItemSeparado(solicitacao.id, item.produto, false, undefined, separador);
        setSaving("");

        if (!ok) {
            setErro("Não foi possível desmarcar o item.");
            return;
        }

        setErro(undefined);
        setLista(lista.map((i) => i.produto == item.produto
            ? { ...i, separado: false, quantidadeSeparada: 0 }
            : i));
        router.refresh();
    }

    return <VStack gap="0.4rem" w="100%">
        {/* O feedback do progresso substitui a mensagem de conclusao: para quem
            trabalha no almoxarifado, "3 de 8" diz mais que uma frase explicando
            o que ja e obvio pela cor das linhas. */}
        <Flex w="100%" justify="space-between" align="baseline" px="0.5rem">
            <Text textStyle="xl" color={separados == lista.length ? C.successInk : C.sub}>
                {separados} de {lista.length} {lista.length == 1 ? "item separado" : "itens separados"}
            </Text>
            {separados == lista.length && lista.length > 0
                ? <Text textStyle="lg" color={C.successInk}>aguardando retirada</Text>
                : undefined}
        </Flex>

        {lista.map((item) => {
            const data = fotos[item.produto];
            const semSaldo = item.saldo <= 0;
            const faltou = item.separado && item.quantidadeSeparada < item.quantidade;
            const aberto = confirmando == item.produto;

            return <Box
                key={item.produto}
                w="100%"
                bg={item.separado ? C.successSoft : C.surface}
                borderWidth="0.1rem"
                borderColor={item.separado
                    ? (faltou ? C.warning : C.success)
                    : (item.obrigatorio ? C.danger : C.line)}
                borderRadius="lg"
                overflow="hidden"
            >
                <Flex
                    align="center"
                    gap="3"
                    px="0.75rem"
                    py="0.4rem"
                >
                    <AspectRatio w="2.5rem" ratio={1} borderRadius="md" overflow="hidden" flexShrink={0} bg={C.surfaceHover}>
                        {data != undefined && data.imageUri != ""
                            ? <Image src={data.imageUri} alt={item.nome} objectFit="cover" />
                            : <Box color={C.faint}><IconAlertTriangle size={20} /></Box>}
                    </AspectRatio>

                    <Box flex="1" minW="0">
                        <Flex gap="2" align="center" wrap="wrap">
                            <Text textStyle="lg" color={C.ink} lineClamp={1}>{item.nome}</Text>
                            {item.obrigatorio ? <Badge bg={C.danger} color="white" px="1.5" borderRadius="sm" fontSize="0.7rem">
                                OBRIGATÓRIO
                            </Badge> : undefined}
                        </Flex>
                        <Text textStyle="sm" color={semSaldo ? C.danger : C.sub} lineClamp={1}>
                            {[
                                item.produto,
                                item.local != "" ? item.local : undefined,
                                item.endereco != "" ? item.endereco : undefined,
                                `saldo ${item.saldo}`,
                            ].filter((p) => p != undefined).join(" · ")}
                        </Text>
                    </Box>

                    <Text textStyle="lg" color={faltou ? C.warningInk : C.ink} whiteSpace="nowrap" flexShrink={0}>
                        {item.separado ? `${item.quantidadeSeparada}/${item.quantidade}` : item.quantidade}
                    </Text>

                    {item.separado ? <Button
                        size="md"
                        minW="6rem"
                        flexShrink={0}
                        bg={faltou ? C.warning : C.success}
                        color="white"
                        _hover={{ filter: "brightness(0.95)" }}
                        loading={saving == item.produto}
                        onClick={() => { desmarcar(item) }}
                    >
                        <IconCheck size={16} /> Separado
                    </Button> : <Button
                        size="md"
                        minW="6rem"
                        flexShrink={0}
                        bg={aberto ? C.surfaceHover : C.surface}
                        color={C.ink}
                        borderWidth="0.1rem"
                        borderColor={C.line}
                        _hover={{ borderColor: C.accent }}
                        onClick={() => { aberto ? setConfirmando("") : abrirConfirmacao(item) }}
                    >
                        {aberto ? <><IconX size={16} /> Fechar</> : "Separar"}
                    </Button>}
                </Flex>

                {/* Confirmacao da quantidade. Abre na propria linha em vez de
                    outra tela: no celular, no meio do corredor, cada navegacao a
                    mais e uma chance de perder o lugar na lista. */}
                {aberto ? <Flex
                    align="center"
                    gap="3"
                    px="0.75rem"
                    py="0.6rem"
                    bg={C.surfaceHover}
                    borderTopWidth="0.1rem"
                    borderColor={C.line}
                    wrap="wrap"
                >
                    <Text textStyle="md" color={C.sub}>
                        Pedido {item.quantidade} · disponível {item.saldo}
                    </Text>

                    <Input
                        size="md"
                        type="number"
                        min={1}
                        w="6rem"
                        bg={C.surface}
                        borderColor={C.line}
                        color={C.ink}
                        value={quantidade}
                        onChange={(event) => { setQuantidade(event.currentTarget.value) }}
                    />

                    <Button
                        size="md"
                        bg={C.accent}
                        color="white"
                        _hover={{ filter: "brightness(0.95)" }}
                        loading={saving == item.produto}
                        onClick={() => { confirmar(item) }}
                    >
                        <IconCheck size={16} /> Confirmar
                    </Button>
                </Flex> : undefined}
            </Box>
        })}

        {erro != undefined ? <Text color={C.danger}>{erro}</Text> : undefined}

        <Button
            size="lg"
            w="100%"
            mt="0.5rem"
            variant="ghost"
            color={C.sub}
            onClick={() => { router.push("/restricted/separacao") }}
        >
            <IconArrowBackUp /> Voltar para a lista
        </Button>
    </VStack>
}
