import { GetAllItems } from "@/api/item-data";
import { GetUser } from "@/api/users";
import { InfoItem } from "@/components/info-item";
import { MenuItem } from "@/components/menu-item";
import { UnknownCount } from "@/components/unknown-count";
import { AbsoluteCenter, VStack, Text, GridItem, Grid } from "@chakra-ui/react";
import { IconForklift } from "@tabler/icons-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ReactNode, ViewTransition } from "react";

export default async function Fill() {
    const cookieStore = await cookies();
    const user = cookieStore.get("user")?.value ?? "";
    const userData = await GetUser(user);
    if (!(userData?.admin ?? false)) {
        redirect("/");
    }

    const itemGrid = [] as ReactNode[];
    for (const [i, item] of Object.entries(await GetAllItems())) {
        itemGrid.push(
            <GridItem colSpan={2} key={i}>
                <InfoItem itemId={item} isInventory={true} />
            </GridItem>
        );
    }

    return (
        <AbsoluteCenter bg="orange.subtle" w="100vw" h="100vh">
            <VStack gap="3rem" w="80vw">
                <VStack gap="1rem">
                    <ViewTransition name="mainIcon">
                        <Text color={"fg.error"}>
                            <IconForklift size={"min(10vw, 10vh)"} />
                        </Text>
                    </ViewTransition>
                    <ViewTransition name="mainText">
                        <Text textStyle="4xl" fontWeight="normal">Abastecer</Text>
                    </ViewTransition>
                </VStack>

                <ViewTransition name="mainContent">
                    <UnknownCount/>
                    <Grid templateColumns="repeat(6, 1fr)" gap="6" w="100%" alignItems={"center"}>
                        {itemGrid}
                    </Grid>
                    <MenuItem action="back" override="/restricted" />
                </ViewTransition>
            </VStack>
        </AbsoluteCenter>
    );
}
