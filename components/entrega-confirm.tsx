"use client"

import { EntregarSolicitacao, Solicitacao, SolicitacaoItem } from "@/api/solicitacoes";
import { GetItemData } from "@/api/item-data";
import { ItemData } from "@/types/ItemData";
import { FaceConfirm } from "@/components/face-confirm";
import { AspectRatio, Box, Button, Flex, Image, Text, VStack } from "@chakra-ui/react";
import { IconAlertTriangle, IconArrowBackUp, IconHandGrab } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { C } from "@/theme/colors";

// Conferencia e entrega.
//
// Quem confirma e a propria pessoa que pediu, olhando os itens na tela e se
// identificando pela camera frontal. Nao e o almoxarifado que dá baixa: assim
// fica registrado que a pessoa viu o que estava recebendo, que e o ponto da
// ficha de EPI.
export function EntregaConfirm({
    requisicao,
    itens,
}: {
    requisicao: Solicitacao;
    itens: SolicitacaoItem[];
}) {
    const router = useRouter();
    const [fotos, setFotos] = useState({} as Record<string, ItemData | undefined>);
    const [confirmando, setConfirmando] = useState(false);
    const [enviando, setEnviando] = useState(false);
    const [erro, setErro] = useState<string | undefined>(undefined);

    useEffect(() => {
        for (const item of itens) {
            GetItemData(item.produto).then((data) => {
                setFotos((current) => ({ ...current, [item.produto]: data }));
            });
        }
    }, [itens]);

    const aoReconhecer = useCallback(async (userId: string) => {
        // A conferencia tambem acontece no servidor. Aqui e so para dar a
        // mensagem certa: quem passou a cara e outra pessoa precisa saber disso,
        // e nao receber um erro generico.
        if (userId != requisicao.pessoa) {
            setConfirmando(false);
            setErro(`O reconhecimento identificou outra pessoa. Esta requisição é de ${requisicao.pessoaNome}.`);
            return;
        }

        setConfirmando(false);
        setEnviando(true);
        const ok = await EntregarSolicitacao(requisicao.id, userId);
        setEnviando(false);

        if (!ok) {
            setErro("Não foi possível registrar a entrega. Confira se a separação terminou.");
            return;
        }

        router.push("/restricted/entrega");
        router.refresh();
    }, [requisicao, router]);

    return <VStack gap="0.5rem" w="100%">
        <Text fontSize="1.05rem" color={C.sub} alignSelf="flex-start" px="0.25rem">
            Confira os itens antes de confirmar
        </Text>

        {itens.map((item) => {
            const data = fotos[item.produto];
            const faltou = item.quantidadeSeparada < item.quantidade;

            return <Flex
                key={item.produto}
                w="100%"
                align="center"
                gap="3"
                px="0.75rem"
                py="0.6rem"
                bg={C.surface}
                borderWidth="0.1rem"
                borderColor={faltou ? C.warning : C.line}
                borderRadius="lg"
            >
                <AspectRatio w="3.25rem" ratio={1} borderRadius="md" overflow="hidden" flexShrink={0} bg={C.surfaceHover}>
                    {data != undefined && data.imageUri != ""
                        ? <Image src={data.imageUri} alt={item.nome} objectFit="cover" />
                        : <Box color={C.faint}><IconAlertTriangle size={22} /></Box>}
                </AspectRatio>

                <Box flex="1" minW="0">
                    <Text fontSize={{ base: "1.1rem", md: "1.05rem" }} color={C.ink} lineHeight="1.25">
                        {item.nome}
                    </Text>
                    <Text fontSize="0.9rem" color={C.sub}>{item.produto}</Text>
                </Box>

                {/* Quando saiu menos do que foi pedido, o numero aparece inteiro:
                    a pessoa precisa perceber a falta agora, na frente de quem
                    separou, e nao depois no posto de trabalho. */}
                <Text
                    fontSize="1.05rem"
                    color={faltou ? C.warningInk : C.ink}
                    whiteSpace="nowrap"
                    flexShrink={0}
                >
                    {faltou
                        ? `${item.quantidadeSeparada} de ${item.quantidade}`
                        : `${item.quantidadeSeparada} un.`}
                </Text>
            </Flex>
        })}

        {erro != undefined ? <Text fontSize="1rem" color={C.danger} pt="0.5rem">{erro}</Text> : undefined}

        {confirmando ? <Box w="100%" pt="0.5rem">
            <FaceConfirm onRecognized={aoReconhecer} onClose={() => { setConfirmando(false) }} />
        </Box> : <Button
            size="2xl"
            w="100%"
            mt="0.75rem"
            bg={C.success}
            color="white"
            _hover={{ filter: "brightness(0.95)" }}
            loading={enviando}
            onClick={() => { setErro(undefined); setConfirmando(true) }}
        >
            <IconHandGrab size={22} /> Confirmar recebimento
        </Button>}

        <Button
            size="lg"
            w="100%"
            variant="ghost"
            color={C.sub}
            onClick={() => { router.push("/restricted/entrega") }}
        >
            <IconArrowBackUp /> Voltar
        </Button>
    </VStack>
}
