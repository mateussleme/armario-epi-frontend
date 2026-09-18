import { GetSolicitacoes, STATUS_ABERTA, STATUS_AGUARDANDO, STATUS_SEPARANDO, statusLabel } from "@/api/solicitacoes";
import { GetUser } from "@/api/users";
import { MenuItem } from "@/components/menu-item";
import { Badge, Box, Flex, Text, VStack } from "@chakra-ui/react";
import { IconClipboardCheck } from "@tabler/icons-react";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { ViewTransition } from "react";
import { C, MAX_W } from "@/theme/colors";

// Cor da linha por status, que foi o pedido: dá para bater o olho na lista e ver
// o que ainda nem foi tocado, o que está em andamento e o que já pode ser
// entregue, sem ler linha por linha.
function styleFor(status: string) {
    if (status == STATUS_AGUARDANDO) {
        return { bg: C.successSoft, border: C.success, ink: C.successInk };
    }
    if (status == STATUS_SEPARANDO) {
        return { bg: C.warningSoft, border: C.warning, ink: C.warningInk };
    }
    return { bg: C.surface, border: C.line, ink: C.sub };
}

function formatData(iso: string) {
    if (iso == "") {
        return "";
    }
    const date = new Date(iso);
    return date.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default async function Separacao() {
    await connection();

    const cookieStore = await cookies();
    const user = cookieStore.get("user")?.value ?? "";
    const userData = await GetUser(user);
    if (!(userData?.admin ?? false)) {
        redirect("/");
    }

    // Sem status traz tudo que ainda está em aberto. Cancelada não aparece: sair
    // da lista é o propósito dela.
    const solicitacoes = await GetSolicitacoes();

    return (
        <Flex justify="center" bg={C.bg} w="100vw" minH="100vh" py="3rem" px="4">
            <VStack gap="3rem" w="80vw" maxW={MAX_W}>
                <VStack gap="1rem">
                    <ViewTransition name="mainIcon">
                        <Text color={C.accent}>
                            <IconClipboardCheck size={40} style={{ width: "min(10vw, 10vh)", height: "min(10vw, 10vh)" }} />
                        </Text>
                    </ViewTransition>
                    <ViewTransition name="mainText">
                        <Text textStyle="4xl" fontWeight="normal" color={C.ink}>Lista de Separação</Text>
                    </ViewTransition>
                </VStack>

                <ViewTransition name="mainContent">
                    <VStack gap="1rem" w="100%">
                        {solicitacoes.length == 0 ? <Box
                            w="100%"
                            px="2rem"
                            py="2rem"
                            textAlign="center"
                            borderWidth="0.1rem"
                            borderStyle="dashed"
                            borderColor={C.line}
                            borderRadius="xl"
                        >
                            <Text textStyle="xl" color={C.sub}>Nenhuma solicitação pendente.</Text>
                        </Box> : undefined}

                        {solicitacoes.map((item) => {
                            const style = styleFor(item.status);
                            return <Link
                                key={item.id}
                                href={"/restricted/separacao/" + String(item.id)}
                                style={{ width: "100%" }}
                            >
                                <Flex
                                    w="100%"
                                    align={{ base: "stretch", md: "center" }}
                                    direction={{ base: "column", md: "row" }}
                                    gap="3"
                                    px="2rem"
                                    py="1.25rem"
                                    bg={style.bg}
                                    borderWidth="0.1rem"
                                    borderColor={style.border}
                                    borderRadius="xl"
                                    _hover={{ borderColor: C.accent }}
                                >
                                    <Box flex="1" minW="0">
                                        <Text textStyle="2xl" color={C.ink} lineClamp={1}>{item.pessoaNome}</Text>
                                        <Text textStyle="md" color={C.sub}>
                                            {formatData(item.data)} · pedido {item.id}
                                            {item.separador != "" ? ` · separando: ${item.separador}` : ""}
                                        </Text>
                                    </Box>

                                    <Text textStyle="xl" color={C.ink} whiteSpace="nowrap">
                                        {item.itensSeparados} de {item.totalItens} {item.totalItens == 1 ? "item" : "itens"}
                                    </Text>

                                    <Badge
                                        bg={item.status == STATUS_ABERTA ? C.surfaceHover : style.border}
                                        color={item.status == STATUS_ABERTA ? C.sub : "white"}
                                        px="3"
                                        py="1.5"
                                        borderRadius="md"
                                        whiteSpace="nowrap"
                                    >
                                        {statusLabel(item.status)}
                                    </Badge>
                                </Flex>
                            </Link>
                        })}

                        <MenuItem action="back" override="/restricted" />
                    </VStack>
                </ViewTransition>
            </VStack>
        </Flex>
    );
}
