import { GetSolicitacoes, STATUS_AGUARDANDO } from "@/api/solicitacoes";
import { GetUser } from "@/api/users";
import { MenuItem } from "@/components/menu-item";
import { Box, Button, Flex, Text, VStack } from "@chakra-ui/react";
import { IconHandGrab } from "@tabler/icons-react";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { ViewTransition } from "react";
import { C, MAX_W } from "@/theme/colors";

export default async function Entrega() {
    await connection();

    const cookieStore = await cookies();
    const user = cookieStore.get("user")?.value ?? "";
    const userData = await GetUser(user);
    if (!(userData?.admin ?? false)) {
        redirect("/");
    }

    // So o que ja foi separado e espera alguem buscar.
    const requisicoes = await GetSolicitacoes(STATUS_AGUARDANDO);

    return (
        <Flex justify="center" bg={C.bg} w="100vw" minH="100vh" py="2rem" px="4">
            <VStack gap="2rem" w="90vw" maxW={MAX_W}>
                <VStack gap="0.75rem">
                    <ViewTransition name="mainIcon">
                        <Text color={C.success}>
                            <IconHandGrab size={40} style={{ width: "min(8vw, 8vh)", height: "min(8vw, 8vh)" }} />
                        </Text>
                    </ViewTransition>
                    <ViewTransition name="mainText">
                        <Text textStyle="3xl" fontWeight="normal" color={C.ink}>Entrega</Text>
                    </ViewTransition>
                </VStack>

                <ViewTransition name="mainContent">
                    <VStack gap="0.5rem" w="100%">
                        {requisicoes.length == 0 ? <Box
                            w="100%"
                            px="2rem"
                            py="2rem"
                            textAlign="center"
                            borderWidth="0.1rem"
                            borderStyle="dashed"
                            borderColor={C.line}
                            borderRadius="xl"
                        >
                            <Text fontSize="1.1rem" color={C.sub}>Nada separado esperando retirada.</Text>
                        </Box> : undefined}

                        {requisicoes.map((item) => (
                            <Link key={item.id} href={"/restricted/entrega/" + String(item.id)} style={{ width: "100%" }}>
                                <Flex
                                    w="100%"
                                    align="center"
                                    gap="3"
                                    px="1rem"
                                    py="0.8rem"
                                    bg={C.successSoft}
                                    borderWidth="0.1rem"
                                    borderColor={C.success}
                                    borderRadius="lg"
                                    _hover={{ filter: "brightness(0.98)" }}
                                >
                                    <Box flex="1" minW="0">
                                        <Text fontSize={{ base: "1.15rem", md: "1.1rem" }} color={C.ink} lineClamp={1}>
                                            {item.pessoaNome}
                                        </Text>
                                        <Text fontSize="0.9rem" color={C.sub}>
                                            requisição {item.id} · {item.totalItens} {item.totalItens == 1 ? "item" : "itens"}
                                        </Text>
                                    </Box>

                                    <Button size="md" bg={C.success} color="white" flexShrink={0} _hover={{ filter: "brightness(0.95)" }}>
                                        Entregar
                                    </Button>
                                </Flex>
                            </Link>
                        ))}

                        <Box pt="0.5rem" w="100%">
                            <MenuItem action="back" override="/restricted" />
                        </Box>
                    </VStack>
                </ViewTransition>
            </VStack>
        </Flex>
    );
}
