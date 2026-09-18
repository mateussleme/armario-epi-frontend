"use client"

import { GetUser } from "@/api/face";
import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { IconX } from "@tabler/icons-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { C } from "@/theme/colors";

// Reconhecimento facial para confirmar quem esta recebendo.
//
// Mesma mecanica do login, com uma diferenca de proposito: aqui o resultado nao
// troca o usuario da sessao, so e devolvido para quem chamou conferir. Quem
// decide se a cara reconhecida vale e a tela, e depois o backend.
export function FaceConfirm({
    onRecognized,
    onClose,
}: {
    onRecognized: (userId: string) => void;
    onClose: () => void;
}) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const ativo = useRef(true);
    const [erro, setErro] = useState<string | undefined>(undefined);

    const reconhecer = useCallback(async (track: MediaStreamTrack) => {
        const captura = new ImageCapture(track);
        const foto = await captura.takePhoto({ imageWidth: 720, imageHeight: 1280 });

        const user = await GetUser(foto);
        if (user == "") {
            return false;
        }

        onRecognized(user);
        return true;
    }, [onRecognized]);

    useEffect(() => {
        ativo.current = true;
        let stream: MediaStream | undefined;

        // Camera frontal: quem recebe esta de frente para a tela.
        navigator.mediaDevices.getUserMedia({
            video: { width: 720, height: 1280, facingMode: "user" },
        }).then((novoStream) => {
            stream = novoStream;
            if (videoRef.current == null) {
                return;
            }

            videoRef.current.srcObject = novoStream;
            const tracks = novoStream.getVideoTracks();
            if (tracks.length == 0) {
                return;
            }

            const loop = () => {
                if (!ativo.current) {
                    return;
                }
                setTimeout(() => {
                    if (!ativo.current) {
                        return;
                    }
                    reconhecer(tracks[0])
                        .then((achou) => { if (!achou) { loop() } })
                        .catch(() => { loop() });
                }, 1000);
            };
            loop();
        }).catch(() => {
            setErro(
                window.isSecureContext
                    ? "Não foi possível abrir a câmera. Verifique a permissão."
                    : "A câmera só funciona em https ou localhost.",
            );
        });

        return () => {
            ativo.current = false;
            stream?.getTracks().forEach((track) => { track.stop() });
        };
    }, [reconhecer]);

    return <Box
        w="100%"
        p="0.75rem"
        bg={C.surface}
        borderWidth="0.1rem"
        borderColor={C.accent}
        borderRadius="lg"
    >
        <Flex justify="space-between" align="center" mb="0.5rem">
            <Text fontSize="1rem" color={C.sub}>Olhe para a câmera para confirmar</Text>
            <Button size="sm" variant="ghost" color={C.sub} onClick={onClose}>
                <IconX size={16} /> Fechar
            </Button>
        </Flex>

        {erro != undefined ? <Text fontSize="1rem" color={C.danger} py="2rem" textAlign="center">
            {erro}
        </Text> : <Box
            mx="auto"
            maxW="18rem"
            borderRadius="md"
            overflow="hidden"
            bg="black"
        >
            {/* video nativo, como na tela de login: o Box do Chakra nao repassa
                as propriedades de midia. O espelhamento e so para a pessoa se
                ver como num espelho, senao o movimento sai invertido. */}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{ width: "100%", display: "block", transform: "scaleX(-1)" }}
            />
        </Box>}
    </Box>
}
