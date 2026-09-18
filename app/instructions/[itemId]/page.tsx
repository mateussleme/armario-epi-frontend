import { GetItemData } from "@/api/item-data";
import { MenuItem } from "@/components/menu-item";
import { Flex, AspectRatio, Box, Image, Text, VStack } from "@chakra-ui/react";
import { redirect } from "next/navigation";
import { ViewTransition } from "react";
import { C, MAX_W } from "@/theme/colors";

export default async function Instructions({ params }: { params: Promise<{ itemId: string }> }) {
    const itemData = await GetItemData((await params).itemId);
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
                        <Text textStyle="4xl" fontWeight="normal" color={C.ink}>{itemData.title}</Text>
                    </ViewTransition>
                </VStack>

                <ViewTransition name="mainContent">
                    <Box
                        bg={C.surface}
                        p="5"
                        borderWidth="0.1rem"
                        borderColor={C.line}
                        borderRadius="xl"
                    >
                        <Text textAlign="justify" textStyle="xl" fontWeight="normal" color={C.ink}>{itemData.description}</Text>
                    </Box>
                    {itemData.videoUri != undefined ?
                        <AspectRatio
                            w="100%"
                            ratio={0.9}
                            borderWidth="0.1rem"
                            borderColor={C.line}
                            borderRadius={"xl"}
                            overflow={"hidden"}
                        >
                            <video
                                src={itemData.videoUri}
                                width="100%"
                                controls
                                autoPlay
                                loop
                                muted
                            ></video>
                        </AspectRatio> : undefined}
                    <MenuItem action="back" override="/instructions" />
                </ViewTransition>
            </VStack>
        </Flex>
    );
}
