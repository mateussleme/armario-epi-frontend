import { GetSaved } from "@/api/controls";
import { GetGroup, GetGroupProducts } from "@/api/groups";
import { GetItemData } from "@/api/item-data";
import { GetUser } from "@/api/users";
import { GroupForm } from "@/components/group-form";
import { Flex, VStack, Text } from "@chakra-ui/react";
import { IconUsersGroup } from "@tabler/icons-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { ViewTransition } from "react";
import { C, MAX_W } from "@/theme/colors";

export default async function EditGroup({ params }: { params: Promise<{ groupId: string }> }) {
    await connection();

    const cookieStore = await cookies();
    const user = cookieStore.get("user")?.value ?? "";
    const userData = await GetUser(user);
    if (!(userData?.admin ?? false)) {
        redirect("/");
    }

    const groupId = decodeURIComponent((await params).groupId);
    const group = await GetGroup(groupId);
    if (group == undefined) {
        redirect("/restricted/groups");
    }

    // monta a lista de produtos disponiveis (id -> nome) para o seletor
    const stock = (await GetSaved()) ?? {};
    const allProducts = {} as Record<string, string>;
    for (const productId of Object.keys(stock)) {
        const data = await GetItemData(productId);
        allProducts[productId] = data?.title ?? productId;
    }

    // CORRIGIDO: Passa o groupId para buscar os produtos reais
    const groupProducts = await GetGroupProducts(groupId);

    // Ver comentario em items/novo/page.tsx sobre o AbsoluteCenter.
    return (
        <Flex justify="center" bg={C.bg} w="100vw" minH="100vh" py="3rem" px="4">
            <VStack gap="3rem" w="80vw" maxW={MAX_W}>
                <VStack gap="1rem">
                    <ViewTransition name="mainIcon">
                        <Text color={C.accent}>
                            <IconUsersGroup size={40} style={{ width: "min(10vw, 10vh)", height: "min(10vw, 10vh)" }} />
                        </Text>
                    </ViewTransition>
                    <ViewTransition name="mainText">
                        <Text textStyle="4xl" fontWeight="normal" color={C.ink}>Editar grupo</Text>
                    </ViewTransition>
                </VStack>

                <ViewTransition name="mainContent">
                    <GroupForm group={group} groupProducts={groupProducts} allProducts={allProducts} />
                </ViewTransition>
            </VStack>
        </Flex>
    );
}
