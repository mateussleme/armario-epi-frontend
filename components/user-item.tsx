"use client"

import { Box, Flex, Text } from "@chakra-ui/react"
import { useState } from "react";
import Link from "next/link";

export function UserItem({ userId, userName }: { userId: string, userName: string }) {
    const [isHovering, setHovering] = useState(false);

    return <Link href={"/restricted/users/" + encodeURIComponent(userId)} prefetch={false} style={{ width: "100%" }}>
        <Box
            w="100%"
            px="2rem"
            py="1rem"
            bg={isHovering ? "bg.emphasized" : "bg.subtle"}
            borderWidth="0.1rem"
            borderColor={isHovering ? "border.inverted" : "border.emphasized"}
            borderRadius="xl"
            onMouseEnter={() => { setHovering(true) }}
            onMouseLeave={() => { setHovering(false) }}
        >
            <Flex gap="4" justify="space-between" align="center">
                <Text color={"MenuText"}>{userName}</Text>
                <Text textStyle="3xl">{userId}</Text>
            </Flex>
        </Box>
    </Link>
}