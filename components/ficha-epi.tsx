import { RetiradaType } from "@/api/users";
import { Box, Flex, Text, VStack } from "@chakra-ui/react";
import { C } from "@/theme/colors";

function dataHora(iso: string) {
    return new Date(iso).toLocaleString("pt-BR", {
        day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
}

// Ficha de EPI: tudo que a pessoa recebeu, da entrega mais recente para a mais
// antiga. E o registro que o tecnico de seguranca precisa mostrar numa
// fiscalizacao, entao aparece mesmo o que saiu de produto ja excluido do
// cadastro, com o codigo no lugar do nome.
//
// Sem coluna de tamanho por enquanto: o cadastro de tamanhos ainda nao existe.
export function FichaEpi({ retiradas }: { retiradas: RetiradaType[] }) {
    return <VStack gap="0.75rem" w="100%" align="stretch">
        <Flex justify="space-between" align="baseline">
            <Text textStyle="2xl" color={C.ink}>Ficha de EPI</Text>
            <Text fontSize="0.95rem" color={C.sub}>
                {retiradas.length == 0
                    ? "nenhuma entrega"
                    : `${retiradas.length} ${retiradas.length == 1 ? "entrega" : "entregas"}`}
            </Text>
        </Flex>

        {retiradas.length == 0 ? <Box
            px="1.5rem"
            py="1.25rem"
            textAlign="center"
            borderWidth="0.1rem"
            borderStyle="dashed"
            borderColor={C.line}
            borderRadius="xl"
        >
            <Text color={C.sub}>Esta pessoa ainda não recebeu nenhum EPI pelo sistema.</Text>
        </Box> : <Box
            borderWidth="0.1rem"
            borderColor={C.line}
            borderRadius="lg"
            overflow="hidden"
            bg={C.surface}
        >
            {/* Cabecalho so em tela larga: no celular cada linha ja se explica. */}
            <Flex
                display={{ base: "none", md: "flex" }}
                px="1rem"
                py="0.5rem"
                gap="3"
                bg={C.surfaceHover}
                borderBottomWidth="0.1rem"
                borderColor={C.line}
            >
                <Text fontSize="0.85rem" color={C.sub} w="10rem">Data / hora</Text>
                <Text fontSize="0.85rem" color={C.sub} flex="1">Produto</Text>
                <Text fontSize="0.85rem" color={C.sub} w="4rem" textAlign="right">Qtde.</Text>
                <Text fontSize="0.85rem" color={C.sub} w="7rem" textAlign="right">Origem</Text>
            </Flex>

            {retiradas.map((item, i) => (
                <Flex
                    key={i}
                    px="1rem"
                    py="0.6rem"
                    gap={{ base: "1", md: "3" }}
                    direction={{ base: "column", md: "row" }}
                    align={{ base: "stretch", md: "center" }}
                    borderTopWidth={i == 0 ? "0" : "0.1rem"}
                    borderColor={C.line}
                >
                    <Text fontSize="0.95rem" color={C.sub} w={{ base: "auto", md: "10rem" }} flexShrink={0}>
                        {dataHora(item.data)}
                    </Text>
                    <Box flex="1" minW="0">
                        <Text fontSize="1rem" color={item.produtoNome != "" ? C.ink : C.sub}>
                            {item.produtoNome != "" ? item.produtoNome : `${item.produto} (excluído)`}
                        </Text>
                        <Text fontSize="0.85rem" color={C.faint} display={{ base: "none", md: "block" }}>
                            {item.produto}
                        </Text>
                    </Box>
                    <Flex gap="3" justify={{ base: "flex-start", md: "flex-end" }}>
                        <Text fontSize="1rem" color={C.ink} w={{ base: "auto", md: "4rem" }} textAlign={{ base: "left", md: "right" }}>
                            {item.quantidade} un.
                        </Text>
                        <Text fontSize="0.95rem" color={C.sub} w={{ base: "auto", md: "7rem" }} textAlign={{ base: "left", md: "right" }}>
                            {item.origem == "almoxarifado" ? "Almoxarifado" : "Armário"}
                        </Text>
                    </Flex>
                </Flex>
            ))}
        </Box>}
    </VStack>
}
