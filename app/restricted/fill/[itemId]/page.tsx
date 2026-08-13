import { GetItemData } from "@/api/item-data";
import { GetUser } from "@/api/users";
import { ItemVerifier } from "@/components/item-verifier";
import { AbsoluteCenter, VStack, Text, AspectRatio, Image } from "@chakra-ui/react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ViewTransition } from "react";

export default async function FillItem({ params }: { params: Promise<{ itemId: string }> }) {
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


    return (
        <AbsoluteCenter bg="orange.subtle" w="100vw" h="100vh">
            <VStack gap="3rem" w="80vw">
                <VStack gap="1rem">
                    <ViewTransition name="mainIcon">
                        <AspectRatio
                            w="min(16vw, 16vh)"
                            ratio={1}
                            bg={"bg.info"}
                            borderRadius={"xl"}
                            borderColor={"border.emphasized"}
                            borderWidth="0.1rem"
                            overflow={"hidden"}
                        >
                            <Image src={itemData.imageUri} objectFit="cover" />
                        </AspectRatio>
                    </ViewTransition>
                    <ViewTransition name="mainText">
                        <Text textStyle="4xl" fontWeight="normal">Abastecer</Text>
                    </ViewTransition>
                </VStack>

                <ViewTransition name="mainContent">
                    <Text textStyle="3xl" fontWeight="bold">Abra a porta e abasteça todas as unidades de {itemData.title}</Text>
                    <ItemVerifier isInitial={true} override={`/restricted/filled/${itemId}`} />
                </ViewTransition>
            </VStack>
        </AbsoluteCenter>
    );
}
