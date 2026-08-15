"use client"

import { UpdateInventory } from "@/api/controls";
import { SetUnknown } from "@/api/item-data";
import { Box, Flex, Text } from "@chakra-ui/react";
import { IconCheck } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function InventoryButton({ itemId }: { itemId: string }) {
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
        onClick={async () => {
            await SetUnknown(itemId);
            await UpdateInventory();
            router.push("/restricted/fill");
        }}
    >
        <Flex gap="4" justify="space-between" align="center">
            <Text color="green"><IconCheck size={"3rem"} /></Text>
            <Text textStyle="3xl">Confirmar</Text>
        </Flex>
    </Box>
}