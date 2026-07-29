import { MenuItem } from "@/components/menu-item";
import { InfoItem } from "@/components/info-item";
import { AbsoluteCenter, Grid, GridItem, Text, VStack } from "@chakra-ui/react";
import { IconVideoFilled } from "@tabler/icons-react";
import { ReactNode, ViewTransition } from "react";
import { GetAllItems } from "@/api/item-data";

export default async function Instructions() {
    const itemGrid = [] as ReactNode[];
    for (const [i, item] of Object.entries(await GetAllItems())) {
        itemGrid.push(
            <GridItem colSpan={2} key={i}>
                <InfoItem itemId={item} />
            </GridItem>
        );
    }

    return (
        <AbsoluteCenter bg="blue.subtle" w="100vw" h="100vh">
            <VStack gap="3rem" w="80vw">
                <VStack gap="1rem">
                    <ViewTransition name="mainIcon">
                        <Text color={"fg.info"}>
                            <IconVideoFilled size={"min(10vw, 10vh)"} />
                        </Text>
                    </ViewTransition>
                    <ViewTransition name="mainText">
                        <Text textStyle="4xl" fontWeight="normal">Instruções</Text>
                    </ViewTransition>
                </VStack>

                <ViewTransition name="mainContent">
                    <Grid templateColumns="repeat(6, 1fr)" gap="6" w="100%" alignItems={"center"}>
                        {itemGrid}
                    </Grid>
                    <MenuItem action="back" />
                </ViewTransition>
            </VStack>
        </AbsoluteCenter>
    );
}
