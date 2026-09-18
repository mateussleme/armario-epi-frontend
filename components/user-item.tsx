"use client"
import { Box, Flex, Text } from "@chakra-ui/react"
import { useState } from "react";
import Link from "next/link";
import { C } from "@/theme/colors";

export function UserItem({ userId, userName }: { userId: string, userName: string }) {
    const [isHovering, setHovering] = useState(false);
    return <Link href={"/restricted/users/" + encodeURIComponent(userId)} style={{ width: "100%" }}>
        <Box
            w="100%"
            px="2rem"
            py="1rem"
            bg={isHovering ? C.surfaceHover : C.surface}
            borderWidth="0.1rem"
            borderColor={C.line}
            borderRadius="xl"
            onMouseEnter={() => { setHovering(true) }}
            onMouseLeave={() => { setHovering(false) }}
        >
            <Flex gap="4" justify="space-between" align="center">
                <Text color={C.ink}>{userName}</Text>
                <Text textStyle="3xl" color={C.sub}>{userId}</Text>
            </Flex>
        </Box>
    </Link>
}
