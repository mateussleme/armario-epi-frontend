"use client"
import { OpenDoor } from "@/api/controls";
import { GetUnknown } from "@/api/item-data";
import { Box, Flex, Text } from "@chakra-ui/react"
import { useEffect, useState } from "react"

export function UnknownCount() {
    const [count, setCount] = useState(0);

    useEffect(() => {
        OpenDoor();
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
        bg={"bg.subtle"}
        borderWidth="0.1rem"
        borderColor={"border.emphasized"}
        borderRadius="xl"
    >
        <Flex gap="4" justify="space-between" align="center">
            <Text color="MenuText">Itens Novos</Text>
            <Text textStyle="3xl">{count}</Text>
        </Flex>
    </Box>
}