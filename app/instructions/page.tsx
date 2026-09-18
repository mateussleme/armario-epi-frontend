import { MenuItem } from "@/components/menu-item";
import { InfoItem } from "@/components/info-item";
import { Flex, Grid, GridItem, Text, VStack } from "@chakra-ui/react";
import { IconVideoFilled } from "@tabler/icons-react";
import { ReactNode, ViewTransition } from "react";
import { GetAllItems } from "@/api/item-data";
import { connection } from "next/server";
import { C, MAX_W } from "@/theme/colors";

export default async function Instructions() {
    await connection();

    const itemGrid = [] as ReactNode[];
    for (const [i, item] of Object.entries(await GetAllItems())) {
        itemGrid.push(
            <GridItem colSpan={2} key={i}>
                <InfoItem itemId={item} />
            </GridItem>
        );
    }

    return (
        <Flex justify="center" bg={C.bg} w="100vw" minH="100vh" py="3rem" px="4">
            <VStack gap="3rem" w="80vw" maxW={MAX_W}>
                <VStack gap="1rem">
                    <ViewTransition name="mainIcon">
                        <Text color={C.info}>
                            <IconVideoFilled size={40} style={{ width: "min(10vw, 10vh)", height: "min(10vw, 10vh)" }} />
                        </Text>
                    </ViewTransition>
                    <ViewTransition name="mainText">
                        <Text textStyle="4xl" fontWeight="normal" color={C.ink}>Instruções</Text>
                    </ViewTransition>
                </VStack>

                <ViewTransition name="mainContent">
                    <Grid templateColumns="repeat(6, 1fr)" gap="6" w="100%" alignItems={"center"}>
                        {itemGrid}
                    </Grid>
                    <MenuItem action="back" />
                </ViewTransition>
            </VStack>
        </Flex>
    );
}
