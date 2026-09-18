import { GetItemData, GetUnknown } from "@/api/item-data";
import { GetUser } from "@/api/users";
import { InventoryButton } from "@/components/inventory-button";
import { MenuItem } from "@/components/menu-item";
import { Flex, VStack, Text, AspectRatio, Image } from "@chakra-ui/react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ViewTransition } from "react";
import { C, MAX_W } from "@/theme/colors";

export default async function FilledItem({ params, searchParams }: { params: Promise<{ itemId: string }>, searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const cookieStore = await cookies();
    const user = cookieStore.get("user")?.value ?? "";
    const userData = await GetUser(user);
    if (!(userData?.admin ?? false)) {
        redirect("/");
    }

    const itemId = (await params).itemId;
    const itemData = await GetItemData(itemId);
    if (itemData == undefined) {
        redirect("/");
    }
    const newItems = await GetUnknown();

    const itemsRaw = (await searchParams).itemsChanged ?? "{}";
    const itemsJson = (Array.isArray(itemsRaw) ? itemsRaw[0] : itemsRaw);

    return (
        <Flex justify="center" bg={C.bg} w="100vw" minH="100vh" py="3rem" px="4">
            <VStack gap="3rem" w="80vw" maxW={MAX_W}>
                <VStack gap="1rem">
                    <ViewTransition name="mainIcon">
                        <AspectRatio
                            w="min(16vw, 16vh)"
                            ratio={1}
                            bg={C.surface}
                            borderRadius={"xl"}
                            borderColor={C.line}
                            borderWidth="0.1rem"
                            overflow={"hidden"}
                        >
                            <Image src={itemData.imageUri} alt={itemData.title} objectFit="cover" />
                        </AspectRatio>
                    </ViewTransition>
                    <ViewTransition name="mainText">
                        <Text textStyle="4xl" fontWeight="normal" color={C.ink}>Confirmação</Text>
                    </ViewTransition>
                </VStack>

                <ViewTransition name="mainContent">
                    <Text textStyle="3xl" fontWeight="bold" color={C.ink}>As seguintes alterações foram efetuadas</Text>
                    <Text textStyle="1xl" fontWeight="bold" color={C.sub}>
                        {(newItems ?? []).length} novos<br/><br/>
                        {itemsJson}
                    </Text>
                    <MenuItem action="retryInventory" override={`/restricted/fill/${itemId}`} />
                    <InventoryButton itemId={itemId} />
                </ViewTransition>
            </VStack>
        </Flex>
    );
}
