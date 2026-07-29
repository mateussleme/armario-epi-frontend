import { FaceLogin } from "@/components/face-login";
import { AbsoluteCenter, VStack, Text } from "@chakra-ui/react";
import { IconFaceId } from "@tabler/icons-react";
import { ViewTransition } from "react";

export default async function Auth({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const redirectRaw = (await searchParams).redirect ?? "/";
    const redirect = Array.isArray(redirectRaw) ? redirectRaw[0] : redirectRaw;

    return (
        <AbsoluteCenter bg="blue.subtle" w="100vw" h="100vh">
            <VStack gap="3rem">
                <ViewTransition name="mainIcon">
                    <IconFaceId size={"min(10vw, 10vh)"} />
                </ViewTransition>
                <ViewTransition name="mainContent">
                    <FaceLogin url={redirect} />
                </ViewTransition>
                <ViewTransition name="mainText">
                    <Text textStyle="4xl" fontWeight="normal">Mantenha-se imóvel</Text>
                </ViewTransition>
            </VStack>
        </AbsoluteCenter>
    );
}
