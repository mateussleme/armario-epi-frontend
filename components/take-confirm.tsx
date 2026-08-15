"use client"

import { UpdateInventory } from "@/api/controls";
import { Box, Flex, Text } from "@chakra-ui/react";
import { IconCheck } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function TakeConfirm() {
    const router = useRouter();
    const [isHovering, setHovering] = useState(false);

    return <Box
        w="100%"
        px="2rem"
        py="1rem"
        bg={isHovering ? "green.400" : "green.300"}
        borderWidth="0.1rem"
        borderColor={isHovering ? "border.inverted" : "border.emphasized"}
        borderRadius="xl"
        onMouseEnter={() => { setHovering(true) }}
        onMouseLeave={() => { setHovering(false) }}
        onClick={() => {
            UpdateInventory().then(() => {
                router.push("/");
            });
        }}
    >
        <Flex gap="4" justify="space-between" align="center">
            <Text color="green"><IconCheck size={"3rem"} /></Text>
            <Text textStyle="3xl">Confirmar</Text>
        </Flex>
    </Box>
}