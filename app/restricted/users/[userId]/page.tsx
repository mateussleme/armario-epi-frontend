import { GetUser, GetUsers } from "@/api/users";
import { MenuItem } from "@/components/menu-item";
import { UserItem } from "@/components/user-item";
import { AbsoluteCenter, VStack, Text, AspectRatio, Image } from "@chakra-ui/react";
import { IconUserFilled } from "@tabler/icons-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ViewTransition } from "react";

export default async function User({ params }: { params: Promise<{ userId: string }> }) {
    const cookieStore = await cookies();
    const realUser = cookieStore.get("user")?.value ?? "";
    const userData = await GetUser(realUser);
    if (!(userData?.admin ?? false)) {
        redirect("/");
    }

    const user = await GetUser((await params).userId);
    if (user == undefined) {
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
                            <Image src={user.imageUri} objectFit="cover" />
                        </AspectRatio>
                    </ViewTransition>
                    <ViewTransition name="mainText">
                        <Text textStyle="4xl" fontWeight="normal">{user.name}</Text>
                    </ViewTransition>
                </VStack>

                <ViewTransition name="mainContent">
                    <MenuItem action="back" override="/restricted/users" />
                </ViewTransition>
            </VStack>
        </AbsoluteCenter>
    );
}
