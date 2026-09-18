"use client"

import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { IconX } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { C } from "@/theme/colors";

// Id fixo do elemento onde a biblioteca monta o video. E exigencia dela: o
// construtor recebe o id, nao a ref.
const ELEMENT_ID = "qr-scanner-box";

export function QrScanner({
    onRead,
    onClose,
}: {
    onRead: (texto: string) => void;
    onClose: () => void;
}) {
    const [erro, setErro] = useState<string | undefined>(undefined);
    // Guarda a leitura ja entregue: a biblioteca dispara o callback varias vezes
    // por segundo enquanto o QR estiver na frente da camera, e sem isto o mesmo
    // codigo seria processado dezenas de vezes.
    const entregue = useRef(false);

    useEffect(() => {
        let scanner: { stop: () => Promise<void>; clear: () => void } | undefined;
        let cancelado = false;

        (async () => {
            try {
                // Import dinamico: a biblioteca mexe em document no carregamento e
                // quebra no server component. Assim ela so chega no navegador, e
                // so quando a camera e aberta de fato.
                const { Html5Qrcode } = await import("html5-qrcode");
                if (cancelado) {
                    return;
                }

                const instancia = new Html5Qrcode(ELEMENT_ID);
                scanner = instancia;

                await instancia.start(
                    // A camera traseira e a que aponta para a prateleira.
                    { facingMode: "environment" },
                    { fps: 10, qrbox: { width: 220, height: 220 } },
                    (texto) => {
                        if (entregue.current) {
                            return;
                        }
                        entregue.current = true;
                        onRead(texto);
                    },
                    // Callback de "nao achei QR neste quadro". Dispara o tempo todo
                    // e nao e erro, entao e ignorado de proposito.
                    () => { },
                );
            } catch (e) {
                if (cancelado) {
                    return;
                }
                // Os dois casos comuns: a pessoa negou a camera, ou a pagina nao
                // esta em contexto seguro. O navegador so libera camera em https
                // ou localhost, entao abrir por http://server bloqueia.
                setErro(
                    window.isSecureContext
                        ? "Não foi possível abrir a câmera. Verifique a permissão no navegador."
                        : "A câmera só funciona em https ou localhost. Neste endereço o navegador bloqueia.",
                );
                void e;
            }
        })();

        return () => {
            cancelado = true;
            if (scanner != undefined) {
                // stop rejeita quando a camera nem chegou a abrir; nao ha o que
                // fazer nesse caso, e deixar estourar derrubaria a tela.
                scanner.stop().then(() => { scanner?.clear() }).catch(() => { });
            }
        };
    }, [onRead]);

    return <Box
        w="100%"
        p="0.75rem"
        bg={C.surface}
        borderWidth="0.1rem"
        borderColor={C.accent}
        borderRadius="lg"
    >
        <Flex justify="space-between" align="center" mb="0.5rem">
            <Text textStyle="md" color={C.sub}>Aponte para a etiqueta do item</Text>
            <Button size="sm" variant="ghost" color={C.sub} onClick={onClose}>
                <IconX size={16} /> Fechar
            </Button>
        </Flex>

        {erro != undefined ? <Text textStyle="md" color={C.danger} py="2rem" textAlign="center">
            {erro}
        </Text> : <Box
            id={ELEMENT_ID}
            w="100%"
            maxW="20rem"
            mx="auto"
            borderRadius="md"
            overflow="hidden"
        />}
    </Box>
}
