"use client"
import { InitiateCount, OpenDoor } from "@/api/controls";
import { GetUnknown } from "@/api/item-data";
import { Box, Flex, Text } from "@chakra-ui/react"
import { useEffect, useState } from "react"
import { C } from "@/theme/colors";

export function UnknownCount() {
    const [count, setCount] = useState(0);

    useEffect(() => {
        OpenDoor();
        InitiateCount();
        const intervalId = setInterval(async () => {
            const data = await GetUnknown();
            if (data == undefined) {
                return;
            }

            setCount(data.length)
        }, 1000);

        return () => { clearInterval(intervalId) };
    }, [setCount]);

    return <Box
        w="100%"
        px="2rem"
        py="1rem"
        bg={C.surface}
        borderWidth="0.1rem"
        borderColor={C.line}
        borderRadius="xl"
    >
        <Flex gap="4" justify="space-between" align="center">
            <Text color={C.sub}>Itens Novos</Text>
            <Text textStyle="3xl" color={C.ink}>{count}</Text>
        </Flex>
    </Box>
}
