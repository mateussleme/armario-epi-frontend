"use client"

import { CancelSolicitacao, Solicitacao, STATUS_ABERTA, STATUS_AGUARDANDO, statusLabel } from "@/api/solicitacoes";
import { Badge, Box, Button, Flex, Text, VStack } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { C } from "@/theme/colors";

// As requisicoes da propria pessoa, no topo da tela de Solicitacao. Fica aqui e
// nao numa tela separada porque e aqui que ela esta quando pensa em pedir: vendo
// o que ja pediu, nao pede de novo.
//
// Cancelar so aparece enquanto ninguem comecou a separar. A regra tambem esta no
// backend; aqui e so para nao oferecer um botao que vai ser recusado.
export function MinhasRequisicoes({ requisicoes, userId }: { requisicoes: Solicitacao[], userId: string }) {
    const router = useRouter();
    const [confirmando, setConfirmando] = useState<number | undefined>(undefined);
    const [cancelando, setCancelando] = useState<number | undefined>(undefined);
    const [erro, setErro] = useState<string | undefined>(undefined);

    if (requisicoes.length == 0) {
        return undefined;
    }

    async function cancelar(id: number) {
        setCancelando(id);
        const ok = await CancelSolicitacao(id, userId);
        setCancelando(undefined);
        setConfirmando(undefined);

        if (!ok) {
            // O caso comum e o almoxarifado ter comecado a separar entre a tela
            // abrir e o clique.
            setErro("Não deu para cancelar: a separação já começou.");
            router.refresh();
            return;
        }

        setErro(undefined);
        router.refresh();
    }

    return <VStack gap="0.5rem" w="100%" align="stretch">
        <Text fontSize="1.05rem" color={C.sub} px="0.25rem">Suas requisições</Text>

        {requisicoes.map((item) => {
            const pronta = item.status == STATUS_AGUARDANDO;
            const podeCancelar = item.status == STATUS_ABERTA;

            return <Box
                key={item.id}
                px="1rem"
                py="0.7rem"
                bg={pronta ? C.successSoft : C.surface}
                borderWidth="0.1rem"
                borderColor={pronta ? C.success : C.line}
                borderRadius="lg"
            >
                <Flex align="center" gap="3" wrap="wrap">
                    <Box flex="1" minW="10rem">
                        <Text fontSize="1.05rem" color={C.ink}>
                            Requisição {item.id} · {item.totalItens} {item.totalItens == 1 ? "item" : "itens"}
                        </Text>
                        <Text fontSize="0.9rem" color={pronta ? C.successInk : C.sub}>
                            {pronta ? "Pronta, pode buscar no almoxarifado" : statusLabel(item.status)}
                        </Text>
                    </Box>

                    {pronta ? <Badge bg={C.success} color="white" px="2.5" py="1" borderRadius="md">
                        PRONTA
                    </Badge> : undefined}

                    {podeCancelar && confirmando != item.id ? <Button
                        size="md"
                        variant="ghost"
                        color={C.danger}
                        onClick={() => { setConfirmando(item.id) }}
                    >
                        Cancelar
                    </Button> : undefined}
                </Flex>

                {confirmando == item.id ? <Flex gap="2" mt="0.6rem">
                    <Button
                        flex="1"
                        size="md"
                        variant="outline"
                        bg={C.surface}
                        color={C.ink}
                        borderColor={C.line}
                        onClick={() => { setConfirmando(undefined) }}
                    >
                        Manter
                    </Button>
                    <Button
                        flex="1"
                        size="md"
                        bg={C.danger}
                        color="white"
                        loading={cancelando == item.id}
                        onClick={() => { cancelar(item.id) }}
                    >
                        Cancelar requisição
                    </Button>
                </Flex> : undefined}
            </Box>
        })}

        {erro != undefined ? <Text fontSize="0.95rem" color={C.danger}>{erro}</Text> : undefined}
    </VStack>
}
