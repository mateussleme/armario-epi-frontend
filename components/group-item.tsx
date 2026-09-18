"use client"
import { Box, Flex, Text } from "@chakra-ui/react"
import Link from "next/link";
import { useState } from "react";
import { C } from "@/theme/colors";

export function GroupItem({ groupId, groupName }: { groupId: string, groupName: string }) {
    const [isHovering, setHovering] = useState(false);

    return <Link href={"/restricted/groups/" + encodeURIComponent(groupId)} style={{ width: "100%" }}>
        <Box
            w="100%"
            px="2rem"
            py="1rem"
            bg={isHovering ? C.surfaceHover : C.surface}
            borderWidth="0.1rem"
            borderColor={isHovering ? C.accent : C.line}
            borderRadius="xl"
            onMouseEnter={() => { setHovering(true) }}
            onMouseLeave={() => { setHovering(false) }}
        >
            <Flex gap="4" justify="space-between" align="center">
                <Text color={C.sub}>{groupId}</Text>
                <Text textStyle="3xl" color={C.ink}>{groupName}</Text>
            </Flex>
        </Box>
    </Link>
}
