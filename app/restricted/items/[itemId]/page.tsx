import { GetSaved } from "@/api/controls";
import { GetItemData } from "@/api/item-data";
import { GetLocaisAtivos } from "@/api/locais";
import { GetUser } from "@/api/users";
import { ProductForm } from "@/components/product-form";
import { Flex, VStack, Text } from "@chakra-ui/react";
import { IconListDetails } from "@tabler/icons-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { ViewTransition } from "react";
import { C, MAX_W } from "@/theme/colors";

export default async function EditItem({ params }: { params: Promise<{ itemId: string }> }) {
    await connection();

    const cookieStore = await cookies();
    const user = cookieStore.get("user")?.value ?? "";
    const userData = await GetUser(user);
    if (!(userData?.admin ?? false)) {
        redirect("/");
    }

    const itemId = decodeURIComponent((await params).itemId);
    const itemData = await GetItemData(itemId);
    if (itemData == undefined) {
        redirect("/restricted/items");
    }

    const stock = (await GetSaved()) ?? {};
    const locais = (await GetLocaisAtivos()) ?? [];

    // Ver comentario em items/novo/page.tsx sobre o AbsoluteCenter.
    return (
        <Flex justify="center" bg={C.bg} w="100vw" minH="100vh" py="3rem" px="4">
            <VStack gap="3rem" w="80vw" maxW={MAX_W}>
                <VStack gap="1rem">
                    <ViewTransition name="mainIcon">
                        <Text color={C.accent}>
                            <IconListDetails size={40} style={{ width: "min(10vw, 10vh)", height: "min(10vw, 10vh)" }} />
                        </Text>
                    </ViewTransition>
                    <ViewTransition name="mainText">
                        <Text textStyle="4xl" fontWeight="normal" color={C.ink}>Editar produto</Text>
                    </ViewTransition>
                </VStack>

                <ViewTransition name="mainContent">
                    <ProductForm itemId={itemId} item={itemData} quantity={stock[itemId] ?? 0} locais={locais} />
                </ViewTransition>
            </VStack>
        </Flex>
    );
}
