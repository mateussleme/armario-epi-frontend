"use client"

import { AspectRatio, Badge, Box, Button, Flex, Image, Text, VStack } from "@chakra-ui/react";
import { IconArrowBackUp, IconCheck, IconTrash } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/components/cart";
import { CreateSolicitacao } from "@/api/solicitacoes";
import { C } from "@/theme/colors";

export function CartView({ userId }: { userId?: string }) {
    const cart = useCart();
    const router = useRouter();
    const [sending, setSending] = useState(false);
    const [errors, setErrors] = useState<string | undefined>(undefined);

    function back() {
        router.push("/request");
    }

    async function submit() {
        if (userId == undefined || userId == "") {
            setErrors("Não foi possível identificar você. Volte e entre de novo.");
            return;
        }

        setSending(true);
        setErrors(undefined);

        // Vira um pedido na Lista de Separacao do gerenciamento. A retirada em si
        // nao e gravada aqui: a pessoa ainda nao pegou nada, so pediu. Quem zera
        // o prazo de troca e a entrega, quando esse fluxo existir. Ate la o item
        // para de ser cobrado por ter pedido em aberto (ver UserRequiredProducts).
        const id = await CreateSolicitacao(userId, cart.items.map((item) => ({
            produto: item.id,
            quantidade: 1,
            obrigatorio: item.isMandatory ?? false,
        })));

        setSending(false);

        if (id == undefined) {
            setErrors("Não foi possível enviar a solicitação. Verifique a conexão com o servidor.");
            return;
        }

        cart.clear();
        router.push("/");
    }

    if (cart.items.length == 0) {
        return <VStack gap="2rem" w="100%">
            <Box
                w="100%"
                px="2rem"
                py="2rem"
                textAlign="center"
                borderWidth="0.1rem"
                borderStyle="dashed"
                borderColor={C.line}
                borderRadius="xl"
            >
                <Text textStyle="xl" color={C.sub}>Nenhum item escolhido ainda.</Text>
            </Box>

            <Button size="xl" w="100%" variant="ghost" color={C.sub} onClick={back}>
                <IconArrowBackUp /> Escolher itens
            </Button>
        </VStack>
    }

    return <VStack gap="2rem" w="100%">
        <VStack gap="1rem" w="100%">
            {cart.items.map((item) => (
                <Flex
                    key={item.id}
                    w="100%"
                    align="center"
                    gap="4"
                    px="1.5rem"
                    py="1rem"
                    bg={item.isMandatory ? C.dangerSoft : C.surface}
                    borderWidth="0.1rem"
                    borderColor={item.isMandatory ? C.danger : C.line}
                    borderRadius="xl"
                >
                    <AspectRatio w="4rem" ratio={1} borderRadius="lg" overflow="hidden" flexShrink={0}>
                        {item.data != undefined && item.data.imageUri != "" ?
                            <Image src={item.data.imageUri} alt={item.data.title} objectFit="cover" />
                            : <Box bg={C.surfaceHover} />
                        }
                    </AspectRatio>

                    <Box flex="1" minW="0">
                        <Text textStyle="2xl" color={C.ink} lineClamp={1}>
                            {item.data?.title ?? item.id}
                        </Text>
                        
                        {/* REGRA: Destaque visual para itens vencidos */}
                        {item.isMandatory ? (
                            <VStack gap="0.2rem" align="start" mt="1">
                                <Badge bg={C.danger} color="white" variant="solid" px="2" py="1" borderRadius="md">
                                    TROCA OBRIGATÓRIA
                                </Badge>
                                <Text textStyle="md" color={C.dangerInk}>
                                    {item.reason ?? "prazo de troca vencido"}
                                </Text>
                            </VStack>
                        ) : (
                            <Text textStyle="md" color={C.sub}>{item.id}</Text>
                        )}
                    </Box>

                    {/* REGRA: Trava de lixeira para itens obrigatórios */}
                    {!item.isMandatory && (
                        <Button
                            size="lg"
                            variant="ghost"
                            color={C.sub}
                            onClick={() => { cart.remove(item.id) }}
                            _hover={{ bg: C.dangerSoft, color: C.danger }}
                        >
                            <IconTrash />
                        </Button>
                    )}
                </Flex>
            ))}
        </VStack>

        {errors != undefined ? <Text textStyle="lg" color={C.danger} textAlign="center">{errors}</Text> : undefined}

        <VStack gap="1rem" w="100%">
            <Button
                size="2xl"
                w="100%"
                bg={C.accent}
                color="white"
                _hover={{ filter: "brightness(0.95)" }}
                loading={sending}
                onClick={submit}
            >
                <IconCheck /> Solicitar {cart.items.length} {cart.items.length == 1 ? "item" : "itens"}
            </Button>

            <Button size="xl" w="100%" variant="ghost" color={C.sub} onClick={back}>
                <IconArrowBackUp /> Escolher mais itens
            </Button>
        </VStack>
    </VStack>
}
