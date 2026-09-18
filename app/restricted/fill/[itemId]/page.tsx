import { GetItemData } from "@/api/item-data";
import { GetUser } from "@/api/users";
import { ItemVerifier } from "@/components/item-verifier";
import { Flex, VStack, Text, AspectRatio, Image, Button } from "@chakra-ui/react";
import { IconArrowBackUp } from "@tabler/icons-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ViewTransition } from "react";
import { C, MAX_W } from "@/theme/colors";

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
                        <Text textStyle="4xl" fontWeight="normal" color={C.ink}>Abastecer</Text>
                    </ViewTransition>
                </VStack>

                <ViewTransition name="mainContent">
                    <Text textStyle="3xl" fontWeight="bold" color={C.ink}>Abra a porta e abasteça todas as unidades de {itemData.title}</Text>
                    <ItemVerifier isInitial={true} override={`/restricted/filled/${itemId}`} />
                </ViewTransition>

        
            </VStack>
        </Flex>
    );
}
