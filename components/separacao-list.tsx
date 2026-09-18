"use client"

import { Solicitacao, STATUS_AGUARDANDO } from "@/api/solicitacoes";
import { Badge, Box, Flex, Text, VStack } from "@chakra-ui/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { C } from "@/theme/colors";

// Quantos minutos antes do limite a linha comeca a avisar. O almoxarifado da
// fabrica usa cinco.
const AVISO_MINUTOS = 5;

type Urgencia = "aguardando" | "atrasado" | "perto" | "noPrazo";

const ESTILO: Record<Urgencia, { bg: string; border: string; ink: string; texto: string }> = {
    aguardando: { bg: C.infoSoft, border: C.info, ink: C.infoInk, texto: "Aguardando retirada" },
    atrasado: { bg: C.dangerSoft, border: C.danger, ink: C.dangerInk, texto: "Atrasado" },
    perto: { bg: C.warningSoft, border: C.warning, ink: C.warningInk, texto: `- ${AVISO_MINUTOS} min` },
    noPrazo: { bg: C.successSoft, border: C.success, ink: C.successInk, texto: "No prazo" },
};

function urgenciaDe(item: Solicitacao, agora: number): Urgencia {
    // Ja separado sai da corrida: o relogio dele agora e o da retirada, que e
    // outro prazo e outra tela.
    if (item.status == STATUS_AGUARDANDO) {
        return "aguardando";
    }
    if (item.separarAte == "") {
        return "noPrazo";
    }

    const limite = new Date(item.separarAte).getTime();
    if (agora > limite) {
        return "atrasado";
    }
    if (limite - agora <= AVISO_MINUTOS * 60 * 1000) {
        return "perto";
    }
    return "noPrazo";
}

function hora(iso: string) {
    if (iso == "") {
        return "";
    }
    return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function dataHora(iso: string) {
    if (iso == "") {
        return "";
    }
    return new Date(iso).toLocaleString("pt-BR", {
        day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
    });
}

export function SeparacaoList({ requisicoes }: { requisicoes: Solicitacao[] }) {
    // Comeca indefinido de proposito: o servidor nao tem a mesma hora do
    // navegador, e pintar a linha na renderizacao do servidor daria divergencia
    // de hidratacao. No primeiro quadro a lista sai neutra e ganha cor em
    // seguida, o que ninguem percebe.
    const [agora, setAgora] = useState<number | undefined>(undefined);

    useEffect(() => {
        // A primeira leitura sai num timeout, e nao direto no corpo do efeito,
        // para nao disparar render em cascata na montagem.
        const primeira = setTimeout(() => { setAgora(Date.now()) }, 0);
        // A tela pode ficar aberta o dia todo no almoxarifado, entao ela mesma
        // reavalia o tempo em vez de depender de alguem recarregar.
        const id = setInterval(() => { setAgora(Date.now()) }, 30000);
        return () => {
            clearTimeout(primeira);
            clearInterval(id);
        };
    }, []);

    if (requisicoes.length == 0) {
        return <Box
            w="100%"
            px="2rem"
            py="2rem"
            textAlign="center"
            borderWidth="0.1rem"
            borderStyle="dashed"
            borderColor={C.line}
            borderRadius="xl"
        >
            <Text fontSize="1.1rem" color={C.sub}>Nenhuma requisição pendente.</Text>
        </Box>
    }

    return <VStack gap="0.5rem" w="100%">
        {/* Legenda, como na TV do almoxarifado: quem olha de longe precisa saber
            o que a cor quer dizer sem perguntar. */}
        <Flex w="100%" gap="1" wrap="wrap" pb="0.25rem">
            {(["noPrazo", "perto", "atrasado", "aguardando"] as Urgencia[]).map((chave) => (
                <Flex key={chave} align="center" gap="1.5" px="0.6rem" py="0.3rem" bg={ESTILO[chave].bg} borderRadius="md">
                    <Box w="0.7rem" h="0.7rem" borderRadius="sm" bg={ESTILO[chave].border} />
                    <Text fontSize="0.85rem" color={ESTILO[chave].ink}>{ESTILO[chave].texto}</Text>
                </Flex>
            ))}
        </Flex>

        {requisicoes.map((item) => {
            const urgencia = agora != undefined ? urgenciaDe(item, agora) : "noPrazo";
            const estilo = ESTILO[urgencia];
            const pintar = agora != undefined;

            return <Link
                key={item.id}
                href={"/restricted/separacao/" + String(item.id)}
                style={{ width: "100%" }}
            >
                <Flex
                    w="100%"
                    align={{ base: "stretch", md: "center" }}
                    direction={{ base: "column", md: "row" }}
                    gap="2"
                    px="1rem"
                    py="0.8rem"
                    bg={pintar ? estilo.bg : C.surface}
                    borderWidth="0.1rem"
                    borderColor={pintar ? estilo.border : C.line}
                    borderRadius="lg"
                    _hover={{ borderColor: C.accent }}
                >
                    <Box flex="1" minW="0">
                        <Text fontSize={{ base: "1.15rem", md: "1.1rem" }} color={C.ink} lineClamp={1}>
                            {item.pessoaNome}
                        </Text>
                        <Text fontSize="0.9rem" color={C.sub}>
                            requisição {item.id} · {dataHora(item.data)}
                            {item.separador != "" ? ` · ${item.separador}` : ""}
                        </Text>
                    </Box>

                    <Flex align="center" gap="4" flexShrink={0}>
                        <Text fontSize="1rem" color={C.ink} whiteSpace="nowrap">
                            {item.itensSeparados} de {item.totalItens} {item.totalItens == 1 ? "item" : "itens"}
                        </Text>

                        {/* Separar ate: e o numero que o almoxarifado olha. Some
                            quando ja foi separado, porque ali o prazo virou outro. */}
                        {item.separarAte != "" && urgencia != "aguardando" ? <Text
                            fontSize="1rem"
                            fontWeight="medium"
                            color={pintar ? estilo.ink : C.sub}
                            whiteSpace="nowrap"
                        >
                            até {hora(item.separarAte)}
                        </Text> : undefined}

                        <Badge
                            bg={pintar ? estilo.border : C.surfaceHover}
                            color={pintar ? "white" : C.sub}
                            px="2.5"
                            py="1"
                            borderRadius="md"
                            whiteSpace="nowrap"
                            fontSize="0.8rem"
                        >
                            {pintar ? estilo.texto : "..."}
                        </Badge>
                    </Flex>
                </Flex>
            </Link>
        })}
    </VStack>
}
