"use function"
"use client"
import { Button, Flex, Text, VStack } from "@chakra-ui/react";
import { IconWifiOff, IconRefresh } from "@tabler/icons-react";
import { C } from "@/theme/colors";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    return (
        <Flex w="100vw" h="100vh" align="center" justify="center" bg={C.bg} p="2rem">
            <VStack gap="1.5rem" textAlign="center">
                <IconWifiOff size={80} color={C.danger} stroke={1.5} />
                <VStack gap="0.5rem">
                    {/* se o backend cai ou uma página falha ao carregar, o Next.js mostra esta tela */}
                    <Text textStyle="3xl" fontWeight="bold" color={C.ink}>
                        Sistema indisponível
                    </Text> 
                    <Text textStyle="xl" color={C.sub} maxW="400px">
                        Não foi possível conectar ao servidor. Verifique a rede do armário ou acione o suporte.
                    </Text>
                </VStack>
                <Button
                    size="2xl"
                    bg={C.accent}
                    color="white"
                    _hover={{ filter: "brightness(0.95)" }}
                    onClick={() => reset()}
                    mt="2rem"
                >
                    <IconRefresh /> Tentar novamente
                </Button>
            </VStack>
        </Flex>
    )
}