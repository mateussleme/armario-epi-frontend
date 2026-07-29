"use client"

import { Box, Flex, Text } from "@chakra-ui/react"
import { IconArrowBackUp, IconDatabaseCog, IconForklift, IconListDetails, IconLogout, IconProps, IconShoppingBag, IconUserFilled, IconUsersGroup, IconVideo } from "@tabler/icons-react"
import { ForwardRefExoticComponent, RefAttributes, useState } from "react";
import Link from "next/link";
import { CloseDoor } from "@/api/controls";

type ActionData = {
    icon: ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;
    caption: string;
    url: string;
    authenticated: boolean,
    iconColor: string;
    backgroundActive: string;
    backgroundInactive: string;
}

const ACTION_MAP: Record<string, ActionData> = {
    ["take"]: {
        icon: IconShoppingBag,
        caption: "Retirada de Itens",
        url: "/take",
        authenticated: true,
        iconColor: "fg.success",
        backgroundActive: "green.subtle",
        backgroundInactive: "bg.success",
    },
    ["instructions"]: {
        icon: IconVideo,
        caption: "Instruções",
        url: "/instructions",
        authenticated: false,
        iconColor: "fg.info",
        backgroundActive: "blue.subtle",
        backgroundInactive: "bg.info",
    },
    ["restricted"]: {
        icon: IconDatabaseCog,
        caption: "Gerenciamento",
        url: "/restricted",
        authenticated: true,
        iconColor: "MenuText",
        backgroundActive: "bg.emphasized",
        backgroundInactive: "bg.subtle",
    },
    ["leave"]: {
        icon: IconLogout,
        caption: "Sair",
        url: "/",
        authenticated: false,
        iconColor: "fg.error",
        backgroundActive: "red.subtle",
        backgroundInactive: "bg.error",
    },
    ["back"]: {
        icon: IconArrowBackUp,
        caption: "Voltar",
        url: "/",
        authenticated: false,
        iconColor: "MenuText",
        backgroundActive: "bg.emphasized",
        backgroundInactive: "bg.subtle",
    },
    // admin actions
    ["users"]: {
        icon: IconUserFilled,
        caption: "Usuários",
        url: "/restricted/users",
        authenticated: false,
        iconColor: "MenuText",
        backgroundActive: "bg.emphasized",
        backgroundInactive: "bg.subtle",
    },
    ["groups"]: {
        icon: IconUsersGroup,
        caption: "Grupos",
        url: "/restricted", //groups",
        authenticated: false,
        iconColor: "MenuText",
        backgroundActive: "bg.emphasized",
        backgroundInactive: "bg.subtle",
    },
    ["items"]: {
        icon: IconListDetails,
        caption: "Produtos",
        url: "/restricted", ///items",
        authenticated: false,
        iconColor: "MenuText",
        backgroundActive: "bg.emphasized",
        backgroundInactive: "bg.subtle",
    },
    ["fill"]: {
        icon: IconForklift,
        caption: "Abastecer",
        url: "/restricted/fill",
        authenticated: false,
        iconColor: "MenuText",
        backgroundActive: "bg.emphasized",
        backgroundInactive: "bg.subtle",
    },
}

export function MenuItem({ action, override, closesDoor }: { action: string, override?: string, closesDoor?: boolean }) {
    const [isHovering, setHovering] = useState(false);
    const actionData = ACTION_MAP[action];

    let url = actionData.url;
    if (actionData.authenticated) {
        const params = new URLSearchParams();
        params.set("redirect", url);

        url = "/auth?" + params.toString();
    }

    return <Link
        href={override ?? url}
        prefetch={false}
        style={{ width: "100%" }}
        onNavigate={async (e) => {
            if (closesDoor) {
                await CloseDoor();
            }
        }}
    >
        <Box
            w="100%"
            px="2rem"
            py="1rem"
            bg={isHovering ? actionData.backgroundActive : actionData.backgroundInactive}
            borderWidth="0.1rem"
            borderColor={isHovering ? "border.inverted" : "border.emphasized"}
            borderRadius="xl"
            onMouseEnter={() => { setHovering(true) }}
            onMouseLeave={() => { setHovering(false) }}
        >
            <Flex gap="4" justify="space-between" align="center">
                <Text color={actionData.iconColor}><actionData.icon size={"3rem"} /></Text>
                <Text textStyle="3xl">{actionData.caption}</Text>
            </Flex>
        </Box>
    </Link>
}