import { Box, Flex, Text, VStack } from "@chakra-ui/react";
import { IconAlertTriangleFilled } from "@tabler/icons-react";
import { C } from "@/theme/colors";

export type RequiredWarning = {
    id: string;
    title: string;
    reason: string;
};

// Aviso no topo da tela de Retirada. No armario o sistema nao sabe o que a
// pessoa vai pegar, mas sabe o que ela tem que pegar, entao avisa antes de abrir
// a porta em vez de so marcar o card la embaixo.
//
// Fica em amarelo, nao em vermelho: nada deu errado ainda, e a pessoa ainda vai
// retirar. O vermelho e do carrinho travado do almoxarifado, onde a escolha ja
// foi tirada dela.
export function RequiredAlert({ items, title }: { items: RequiredWarning[], title?: string }) {
    if (items.length == 0) {
        return undefined;
    }

    return <Box
        w="100%"
        px="2rem"
        py="1.5rem"
        bg={C.warningSoft}
        borderWidth="0.2rem"
        borderColor={C.warning}
        borderRadius="xl"
    >
        <Flex gap="4" align="flex-start">
            <Box color={C.warning} flexShrink={0} mt="0.2rem">
                <IconAlertTriangleFilled size={32} />
            </Box>

            <VStack gap="0.75rem" align="stretch" flex="1" minW="0">
                <Text textStyle="2xl" fontWeight="bold" color={C.warningInk}>
                    {title ?? (items.length == 1
                        ? "Você precisa retirar este item"
                        : `Você precisa retirar estes ${items.length} itens`)}
                </Text>

                <VStack gap="0.4rem" align="stretch">
                    {items.map((item) => (
                        <Flex key={item.id} gap="2" align="baseline" wrap="wrap">
                            <Text textStyle="xl" fontWeight="semibold" color={C.ink}>{item.title}</Text>
                            <Text textStyle="lg" color={C.warningInk}>{item.reason}</Text>
                        </Flex>
                    ))}
                </VStack>
            </VStack>
        </Flex>
    </Box>
}
