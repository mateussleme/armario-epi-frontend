import { GetUser } from "@/api/users";
import { MenuItem } from "@/components/menu-item";
import { AbsoluteCenter, VStack, Text } from "@chakra-ui/react";
import { IconShieldFilled } from "@tabler/icons-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ViewTransition } from "react";

export default async function Restricted() {
    const cookieStore = await cookies();
    const user = cookieStore.get("user")?.value ?? "";
    const userData = await GetUser(user);
    if (!(userData?.admin ?? false)) {
        redirect("/");
    }

    return (
        <AbsoluteCenter bg="orange.subtle" w="100vw" h="100vh">
            <VStack gap="3rem" w="80vw">
                <VStack gap="1rem">
                    <ViewTransition name="mainIcon">
                        <Text color={"fg.error"}>
                            <IconShieldFilled size={"min(10vw, 10vh)"} />
                        </Text>
                    </ViewTransition>
                    <ViewTransition name="mainText">
                        <Text textStyle="4xl" fontWeight="normal">Gerenciamento</Text>
                    </ViewTransition>
                </VStack>

                <ViewTransition name="mainContent">
                    <MenuItem action="users" />
                    <MenuItem action="groups" />
                    <MenuItem action="items" />
                    <MenuItem action="fill" />
                    <MenuItem action="leave" />
                </ViewTransition>
            </VStack>
        </AbsoluteCenter>
    );
}
