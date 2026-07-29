import { GetUser, GetUsers } from "@/api/users";
import { MenuItem } from "@/components/menu-item";
import { UserItem } from "@/components/user-item";
import { AbsoluteCenter, VStack, Text } from "@chakra-ui/react";
import { IconUserFilled } from "@tabler/icons-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ViewTransition } from "react";

export default async function Users() {
    const cookieStore = await cookies();
    const user = cookieStore.get("user")?.value ?? "";
    const userData = await GetUser(user);
    if (!(userData?.admin ?? false)) {
        redirect("/");
    }


    const users = await GetUsers();
    if (users == undefined) {
        redirect("/");
    }

    return (
        <AbsoluteCenter bg="orange.subtle" w="100vw" h="100vh">
            <VStack gap="3rem" w="80vw">
                <VStack gap="1rem">
                    <ViewTransition name="mainIcon">
                        <Text color={"fg.error"}>
                            <IconUserFilled size={"min(10vw, 10vh)"} />
                        </Text>
                    </ViewTransition>
                    <ViewTransition name="mainText">
                        <Text textStyle="4xl" fontWeight="normal">Usuários</Text>
                    </ViewTransition>
                </VStack>

                <ViewTransition name="mainContent">
                    {Object.entries(users).map(function (data, i) {
                        return <UserItem key={i} userId={data[1].id} userName={data[1].name} />;
                    })}
                    <MenuItem action="back" override="/restricted" />
                </ViewTransition>
            </VStack>
        </AbsoluteCenter>
    );
}
