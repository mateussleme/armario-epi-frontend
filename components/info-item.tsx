"use client"

import { CloseDoor, DoorState, InitiateCount, UpdateInventory } from "@/api/controls";
import { GetItemData, SetUnknown } from "@/api/item-data";
import { ItemData } from "@/types/ItemData";
import { AspectRatio, Box, Image, Spinner, Stack, Text } from "@chakra-ui/react"
import Link from "next/link"
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { READING_TIME } from "./item-verifier";

export function InfoItem({ itemId, isInventory }: { itemId: string, isInventory?: boolean }) {
    const [isHovering, setHovering] = useState(false);
    const [itemData, setItemData] = useState(undefined as ItemData | undefined);

    useEffect(() => {
        GetItemData(itemId).then((newData) => {
            setItemData(newData);
        })
    }, [itemId])

    return <Link href={isInventory ? "#" : `/instructions/${itemId}`} prefetch={false} style={{ width: "100%" }} onClick={isInventory ? async () => {
        await CloseDoor();
        while (await DoorState()) {
            await new Promise(r => setTimeout(r, 500));
        }
        
        await InitiateCount();
        await new Promise(r => setTimeout(r, READING_TIME));
        await SetUnknown(itemId);
        await UpdateInventory();

        redirect("/restricted");
    } : undefined}>
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
            <Stack align={"center"} gap="6">
                <AspectRatio w="100%" ratio={1} borderRadius={"lg"} overflow={"hidden"}>
                    {itemData != undefined ?
                        <Image src={itemData.imageUri} objectFit="cover" />
                        : <Spinner borderWidth={"0.5rem"} animationDuration="1.5s" color={"fg.info"} />
                    }
                </AspectRatio>
                <Text textStyle="xl" textAlign={"center"}>{itemData != undefined ? itemData.title : "..."}</Text>
            </Stack>
        </Box>
    </Link>
}