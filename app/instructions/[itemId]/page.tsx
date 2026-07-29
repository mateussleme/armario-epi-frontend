import { GetItemData } from "@/api/item-data";
import { MenuItem } from "@/components/menu-item";
import { AbsoluteCenter, AspectRatio, Box, Image, Text, VStack } from "@chakra-ui/react";
import { redirect } from "next/navigation";
import { ViewTransition } from "react";

export default async function Instructions({ params }: { params: Promise<{ itemId: string }> }) {
    const itemData = await GetItemData((await params).itemId);
    if (itemData == undefined) {
        redirect("/");
    }

    return (
        <AbsoluteCenter bg="blue.subtle" w="100vw" h="100vh">
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
                        <Text textStyle="4xl" fontWeight="normal">{itemData.title}</Text>
                    </ViewTransition>
                </VStack>

                <ViewTransition name="mainContent">
                    <Box
                        bg={"bg.info"}
                        p="5"
                        borderWidth="0.1rem"
                        borderColor={"border.emphasized"}
                        borderRadius="xl"
                    >
                        <Text textAlign="justify" textStyle="xl" fontWeight="normal">{itemData.description}</Text>
                    </Box>
                    {itemData.videoUri != undefined ?
                        <AspectRatio
                            w="100%"
                            ratio={0.9}
                            borderWidth="0.1rem"
                            borderColor={"border.emphasized"}
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
        </AbsoluteCenter>
    );
}
