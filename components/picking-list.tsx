"use client"

import { SetItemSeparado, Solicitacao, SolicitacaoItem } from "@/api/solicitacoes";
import { GetItemData } from "@/api/item-data";
import { ItemData } from "@/types/ItemData";
import { erroDaEtiqueta, etiquetaConfere, parseEtiqueta } from "@/types/Etiqueta";
import { QrScanner } from "@/components/qr-scanner";
import { AspectRatio, Badge, Box, Button, Flex, Image, Input, Text, VStack } from "@chakra-ui/react";
import { IconAlertTriangle, IconArrowBackUp, IconCheck, IconQrcode, IconX } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { C } from "@/theme/colors";

// Campo preenchido pela leitura. Verde quando confere com o esperado, que e como
// o almoxarifado ja le essa tela hoje: bate o olho na cor, nao no texto.
function CampoLido({
    rotulo,
    valor,
    confere,
}: {
    rotulo: string;
    valor: string;
    confere: boolean;
}) {
    return <Flex
        align="center"
        gap="2"
        px="0.75rem"
        py="0.5rem"
        borderWidth="0.1rem"
        borderColor={confere ? C.success : C.line}
        bg={confere ? C.successSoft : C.surface}
        borderRadius="md"
    >
        <Text fontSize="0.95rem" color={C.sub} minW="5.5rem">{rotulo}</Text>
        <Text fontSize="1.05rem" color={C.ink} fontWeight="medium">{valor}</Text>
        {confere ? <Box color={C.success} ml="auto"><IconCheck size={18} /></Box> : undefined}
    </Flex>
}

export function PickingList({
    requisicao,
    itens,
    separador,
}: {
    requisicao: Solicitacao;
    itens: SolicitacaoItem[];
    separador?: string;
}) {
    const router = useRouter();
    const [lista, setLista] = useState(itens);
    const [fotos, setFotos] = useState({} as Record<string, ItemData | undefined>);
    const [saving, setSaving] = useState("");
    const [erro, setErro] = useState<string | undefined>(undefined);

    const [lendo, setLendo] = useState("");
    const [quantidade, setQuantidade] = useState("");
    const [codigo, setCodigo] = useState("");
    const [escaneando, setEscaneando] = useState(false);
    const [conferido, setConferido] = useState(false);
    const [leituraErro, setLeituraErro] = useState<string | undefined>(undefined);
    const campoLeitura = useRef<HTMLInputElement>(null);

    useEffect(() => {
        for (const item of itens) {
            GetItemData(item.produto).then((data) => {
                setFotos((current) => ({ ...current, [item.produto]: data }));
            });
        }
    }, [itens]);

    const separados = lista.filter((i) => i.separado).length;
    const aberto = lista.find((i) => i.produto == lendo);

    function maximoDe(item: SolicitacaoItem) {
        if (item.saldo <= 0) {
            return item.quantidade;
        }
        return Math.min(item.quantidade, item.saldo);
    }

    // So faz sentido mexer na quantidade quando ha mais de uma unidade em jogo.
    function podeEditarQuantidade(item: SolicitacaoItem) {
        return maximoDe(item) > 1;
    }

    function abrirLeitura(item: SolicitacaoItem) {
        setLendo(item.produto);
        setQuantidade(String(maximoDe(item)));
        setCodigo("");
        setEscaneando(false);
        setConferido(false);
        setLeituraErro(undefined);
        setErro(undefined);
        // Foco no campo de leitura: o coletor se comporta como teclado, entao
        // com o foco ja no lugar o cara bipa sem tocar na tela.
        setTimeout(() => { campoLeitura.current?.focus() }, 50);
    }

    function fecharLeitura() {
        setLendo("");
        setEscaneando(false);
        setConferido(false);
        setLeituraErro(undefined);
    }

    const conferirEtiqueta = useCallback((texto: string, esperado: string) => {
        const etiqueta = parseEtiqueta(texto);

        if (etiquetaConfere(etiqueta, esperado)) {
            setConferido(true);
            setEscaneando(false);
            setLeituraErro(undefined);
            setCodigo(etiqueta.codigo);
            return;
        }

        setConferido(false);
        setLeituraErro(erroDaEtiqueta(etiqueta, esperado));
    }, []);

    const aoLer = useCallback((texto: string) => {
        if (aberto != undefined) {
            conferirEtiqueta(texto, aberto.produto);
        }
    }, [aberto, conferirEtiqueta]);

    async function separar(item: SolicitacaoItem) {
        const valor = podeEditarQuantidade(item) ? parseInt(quantidade, 10) : maximoDe(item);

        if (isNaN(valor) || valor <= 0) {
            setErro("Informe quanto foi separado.");
            return;
        }
        if (valor > maximoDe(item)) {
            setErro(`Só dá para separar até ${maximoDe(item)}.`);
            return;
        }

        setSaving(item.produto);
        const ok = await SetItemSeparado(requisicao.id, item.produto, true, valor, separador);
        setSaving("");

        if (!ok) {
            setErro("Não foi possível separar o item.");
            return;
        }

        setErro(undefined);
        fecharLeitura();
        setLista(lista.map((i) => i.produto == item.produto
            ? { ...i, separado: true, quantidadeSeparada: valor }
            : i));
        router.refresh();
    }

    async function desfazer(item: SolicitacaoItem) {
        setSaving(item.produto);
        const ok = await SetItemSeparado(requisicao.id, item.produto, false, undefined, separador);
        setSaving("");

        if (!ok) {
            setErro("Não foi possível desfazer.");
            return;
        }

        setErro(undefined);
        setLista(lista.map((i) => i.produto == item.produto
            ? { ...i, separado: false, quantidadeSeparada: 0 }
            : i));
        router.refresh();
    }

    return <VStack gap="0.5rem" w="100%">
        <Flex w="100%" justify="space-between" align="baseline" px="0.25rem">
            <Text fontSize={{ base: "1.05rem", md: "1.15rem" }} color={separados == lista.length ? C.successInk : C.sub}>
                {separados} de {lista.length} {lista.length == 1 ? "item separado" : "itens separados"}
            </Text>
            {separados == lista.length && lista.length > 0
                ? <Text fontSize="1rem" color={C.successInk}>aguardando retirada</Text>
                : undefined}
        </Flex>

        {lista.map((item) => {
            const data = fotos[item.produto];
            const semSaldo = item.saldo <= 0;
            const faltou = item.separado && item.quantidadeSeparada < item.quantidade;
            const estaLendo = lendo == item.produto;

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
                <Flex align="center" gap="3" px="0.75rem" py="0.6rem">
                    {/* Clicar na foto abre a leitura, como no almoxarifado. A foto
                        vira o alvo grande do dedo e some o botao extra da linha. */}
                    <AspectRatio
                        w="3.25rem"
                        ratio={1}
                        borderRadius="md"
                        overflow="hidden"
                        flexShrink={0}
                        bg={C.surfaceHover}
                        borderWidth="0.1rem"
                        borderColor={estaLendo ? C.accent : C.line}
                        cursor={item.separado ? "default" : "pointer"}
                        onClick={() => {
                            if (item.separado) {
                                return;
                            }
                            estaLendo ? fecharLeitura() : abrirLeitura(item);
                        }}
                    >
                        {data != undefined && data.imageUri != ""
                            ? <Image src={data.imageUri} alt={item.nome} objectFit="cover" />
                            : <Box color={C.faint}><IconAlertTriangle size={22} /></Box>}
                    </AspectRatio>

                    <Box flex="1" minW="0">
                        <Flex gap="2" align="flex-start" justify="space-between">
                            <Text fontSize={{ base: "1.1rem", md: "1.05rem" }} color={C.ink} lineHeight="1.25">
                                {item.nome}
                            </Text>
                            {item.obrigatorio ? <Badge
                                bg={C.danger}
                                color="white"
                                px="2"
                                py="0.5"
                                borderRadius="sm"
                                fontSize="0.7rem"
                                flexShrink={0}
                            >
                                OBRIGATÓRIO
                            </Badge> : undefined}
                        </Flex>

                        <Text fontSize="0.9rem" color={semSaldo ? C.danger : C.sub}>
                            {[
                                item.produto,
                                item.endereco != "" ? item.endereco : undefined,
                                item.separado
                                    ? `${item.quantidadeSeparada} de ${item.quantidade} un.`
                                    : `${item.quantidade} un.`,
                                semSaldo ? "sem saldo" : `saldo ${item.saldo}`,
                            ].filter((p) => p != undefined).join(" · ")}
                        </Text>
                    </Box>

                    {item.separado ? <Button
                        size="md"
                        flexShrink={0}
                        bg={faltou ? C.warning : C.success}
                        color="white"
                        _hover={{ filter: "brightness(0.95)" }}
                        loading={saving == item.produto}
                        onClick={() => { desfazer(item) }}
                    >
                        <IconCheck size={18} /> Separado
                    </Button> : <Button
                        size="md"
                        flexShrink={0}
                        variant="ghost"
                        color={estaLendo ? C.sub : C.accentInk}
                        onClick={() => { estaLendo ? fecharLeitura() : abrirLeitura(item) }}
                    >
                        {estaLendo ? <><IconX size={18} /> Fechar</> : <><IconQrcode size={18} /> Ler</>}
                    </Button>}
                </Flex>

                {/* Leitura. Segue o desenho do almoxarifado: campo de leitura no
                    topo, campos conferidos embaixo, e o botao de separar so
                    aparece depois que a leitura bate. */}
                {estaLendo ? <VStack
                    gap="0.5rem"
                    align="stretch"
                    px="0.75rem"
                    py="0.7rem"
                    bg={C.surfaceHover}
                    borderTopWidth="0.1rem"
                    borderColor={C.line}
                >
                    <Flex gap="2">
                        <Input
                            ref={campoLeitura}
                            size="lg"
                            flex="1"
                            fontSize="1.05rem"
                            bg={C.surface}
                            borderColor={leituraErro != undefined ? C.danger : C.line}
                            color={C.ink}
                            placeholder="Leia o QR ou digite o código"
                            value={codigo}
                            onChange={(event) => {
                                setCodigo(event.currentTarget.value);
                                setLeituraErro(undefined);
                                setConferido(false);
                            }}
                            onKeyDown={(event) => {
                                if (event.key == "Enter") {
                                    event.preventDefault();
                                    conferirEtiqueta(event.currentTarget.value, item.produto);
                                }
                            }}
                        />
                        <Button
                            size="lg"
                            bg={escaneando ? C.surface : C.accentSoft}
                            color={C.accentInk}
                            borderWidth="0.1rem"
                            borderColor={C.accent}
                            onClick={() => { setEscaneando(!escaneando) }}
                        >
                            <IconQrcode size={18} />
                        </Button>
                    </Flex>

                    {leituraErro != undefined ? <Text fontSize="0.95rem" color={C.danger}>
                        {leituraErro}
                    </Text> : undefined}

                    {escaneando ? <QrScanner onRead={aoLer} onClose={() => { setEscaneando(false) }} /> : undefined}

                    {conferido ? <>
                        <CampoLido rotulo="Endereço" valor={item.endereco != "" ? item.endereco : "sem endereço"} confere={true} />
                        <CampoLido rotulo="Produto" valor={item.produto} confere={true} />

                        {podeEditarQuantidade(item) ? <Flex
                            align="center"
                            gap="2"
                            px="0.75rem"
                            py="0.4rem"
                            borderWidth="0.1rem"
                            borderColor={C.line}
                            bg={C.surface}
                            borderRadius="md"
                        >
                            <Text fontSize="0.95rem" color={C.sub} minW="5.5rem">Quantidade</Text>
                            <Input
                                size="md"
                                type="number"
                                min={1}
                                max={maximoDe(item)}
                                w="5rem"
                                fontSize="1.05rem"
                                bg={C.surface}
                                borderColor={C.line}
                                color={C.ink}
                                value={quantidade}
                                onChange={(event) => { setQuantidade(event.currentTarget.value) }}
                            />
                            <Text fontSize="0.95rem" color={C.sub}>de {item.quantidade}</Text>
                        </Flex> : <CampoLido rotulo="Quantidade" valor={`${item.quantidade}`} confere={true} />}

                        <Button
                            size="lg"
                            w="100%"
                            bg={C.accent}
                            color="white"
                            _hover={{ filter: "brightness(0.95)" }}
                            loading={saving == item.produto}
                            onClick={() => { separar(item) }}
                        >
                            <IconCheck size={18} /> Separar
                        </Button>
                    </> : undefined}
                </VStack> : undefined}
            </Box>
        })}

        {erro != undefined ? <Text fontSize="1rem" color={C.danger}>{erro}</Text> : undefined}

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
