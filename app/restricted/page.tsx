import { DEMO, PodeEntrar } from "@/api/demo";
import { MenuItem } from "@/components/menu-item";
import { Flex, VStack, Text } from "@chakra-ui/react";
import { IconShieldFilled } from "@tabler/icons-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { ViewTransition } from "react";
import { C, MAX_W } from "@/theme/colors";

export default async function Restricted() {
    await connection();

    const cookieStore = await cookies();
    const user = cookieStore.get("user")?.value ?? "";
    if (!(await PodeEntrar(user))) {
        redirect("/");
    }

    return (
        <Flex justify="center" bg={C.bg} w="100vw" minH="100vh" py="3rem" px="4">
            <VStack gap="3rem" w="80vw" maxW={MAX_W}>
                <VStack gap="1rem">
                    <ViewTransition name="mainIcon">
                        <Text color={C.accent}>
                            <IconShieldFilled size={40} style={{ width: "min(10vw, 10vh)", height: "min(10vw, 10vh)" }} />
                        </Text>
                    </ViewTransition>
                    <ViewTransition name="mainText">
                        <Text textStyle="4xl" fontWeight="normal" color={C.ink}>Gerenciamento</Text>
                    </ViewTransition>
                </VStack>

                {/* No modo demonstracao so entram as telas que rodam sem
                    backend. O resto depende do banco, do leitor RFID e do
                    reconhecimento facial, entao so apareceria para quebrar. */}
                <ViewTransition name="mainContent">
                    {!DEMO ? <MenuItem action="users" /> : undefined}
                    {!DEMO ? <MenuItem action="groups" /> : undefined}
                    {!DEMO ? <MenuItem action="items" /> : undefined}
                    {!DEMO ? <MenuItem action="separacao" /> : undefined}
                    {!DEMO ? <MenuItem action="entrega" /> : undefined}
                    {!DEMO ? <MenuItem action="fill" /> : undefined}
                    <MenuItem action="cotacoes" />
                    <MenuItem action="pedidos" />
                    <MenuItem action="estoque" />
                    {!DEMO ? <MenuItem action="locais" /> : undefined}
                    {!DEMO ? <MenuItem action="leave" /> : undefined}
                </ViewTransition>
            </VStack>
        </Flex>
    );
}
