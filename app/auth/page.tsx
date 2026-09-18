import { FaceLogin } from "@/components/face-login";
import { Flex, VStack, Text } from "@chakra-ui/react";
import { IconFaceId } from "@tabler/icons-react";
import { ViewTransition } from "react";
import { C } from "@/theme/colors";

export default async function Auth({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const redirectRaw = (await searchParams).redirect ?? "/";
    const redirect = Array.isArray(redirectRaw) ? redirectRaw[0] : redirectRaw;

    return (
        <Flex justify="center" bg={C.bg} w="100vw" minH="100vh" py="3rem" px="4">
            <VStack gap="3rem">
                <ViewTransition name="mainIcon">
                    <Text color={C.accent}>
                        <IconFaceId size={40} style={{ width: "min(10vw, 10vh)", height: "min(10vw, 10vh)" }} />
                    </Text>
                </ViewTransition>
                <ViewTransition name="mainContent">
                    <FaceLogin url={redirect} />
                </ViewTransition>
                <ViewTransition name="mainText">
                    <Text textStyle="4xl" fontWeight="normal" color={C.ink}>Mantenha-se imóvel</Text>
                </ViewTransition>
            </VStack>
        </Flex>
    );
}
