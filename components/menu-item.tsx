"use client"

import { Box, Flex, Text } from "@chakra-ui/react"
import { IconArrowBackUp, IconDatabaseCog, IconForklift, IconListDetails, IconLogout, IconMapPin, IconProps, IconRefresh, IconShoppingBag, IconUserFilled, IconUsersGroup, IconUserPlus, IconVideo, IconPlus, IconClipboardList, IconClipboardCheck, IconHandGrab } from "@tabler/icons-react"
import { ForwardRefExoticComponent, RefAttributes, useState } from "react";
import Link from "next/link";
import { CloseDoor } from "@/api/controls";
import { C } from "@/theme/colors";

type ActionData = {
    icon: ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;
    caption: string;
    url: string;
    authenticated: boolean,
    iconColor: string;
    backgroundActive: string;
    backgroundInactive: string;
    borderActive: string;
}

const ACTION_MAP: Record<string, ActionData> = {
    ["take"]: {
        icon: IconShoppingBag,
        caption: "Retirada de Itens",
        url: "/take",
        authenticated: true,
        iconColor: C.success,
        backgroundActive: C.successSoft,
        backgroundInactive: C.surface,
        borderActive: C.success,
    },

    ["request"]: {
    icon: IconClipboardList,
    caption: "Solicitação de Itens",
    url: "/request",
    authenticated: true,
    iconColor: C.info,
    backgroundActive: C.infoSoft,
    backgroundInactive: C.surface,
    borderActive: C.info,
    },

    // Lista de Separacao: fica em destaque no gerenciamento porque e uma fila de
    // trabalho, nao um cadastro. Quem abre a tela quer ver se tem pedido esperando.
    ["separacao"]: {
        icon: IconClipboardCheck,
        caption: "Lista de Separação",
        url: "/restricted/separacao",
        authenticated: false,
        iconColor: C.accent,
        backgroundActive: C.accentSoft,
        backgroundInactive: C.surface,
        borderActive: C.accent,
    },
    // Entrega: a fila do que ja foi separado e espera alguem buscar.
    ["entrega"]: {
        icon: IconHandGrab,
        caption: "Entrega",
        url: "/restricted/entrega",
        authenticated: false,
        iconColor: C.success,
        backgroundActive: C.successSoft,
        backgroundInactive: C.surface,
        borderActive: C.success,
    },
    ["locais"]: {
    icon: IconMapPin,
    caption: "Locais",
    url: "/restricted/locais",
    authenticated: false,
    iconColor: C.sub,
    backgroundActive: C.surfaceHover,
    backgroundInactive: C.surface,
    borderActive: C.line,
},
    ["newLocal"]: {
    icon: IconPlus,
    caption: "Novo local",
    url: "/restricted/locais/novo",
    authenticated: false,
    iconColor: C.accent,
    backgroundActive: C.accentSoft,
    backgroundInactive: C.surface,
    borderActive: C.accent,
},

    ["instructions"]: {
        icon: IconVideo,
        caption: "Instruções",
        url: "/instructions",
        authenticated: false,
        iconColor: C.info,
        backgroundActive: C.infoSoft,
        backgroundInactive: C.surface,
        borderActive: C.info,
    },
    ["restricted"]: {
        icon: IconDatabaseCog,
        caption: "Gerenciamento",
        url: "/restricted",
        authenticated: true,
        iconColor: C.accent,
        backgroundActive: C.accentSoft,
        backgroundInactive: C.surface,
        borderActive: C.accent,
    },
    ["leave"]: {
        icon: IconLogout,
        caption: "Sair",
        url: "/",
        authenticated: false,
        iconColor: C.danger,
        backgroundActive: C.dangerSoft,
        backgroundInactive: C.surface,
        borderActive: C.danger,
    },
    ["back"]: {
        icon: IconArrowBackUp,
        caption: "Voltar",
        url: "/",
        authenticated: false,
        iconColor: C.sub,
        backgroundActive: C.surfaceHover,
        backgroundInactive: C.surface,
        borderActive: C.line,
    },
    // admin actions
    ["users"]: {
        icon: IconUserFilled,
        caption: "Usuários",
        url: "/restricted/users",
        authenticated: false,
        iconColor: C.sub,
        backgroundActive: C.surfaceHover,
        backgroundInactive: C.surface,
        borderActive: C.line,
    },
    ["newUser"]: {
        icon: IconUserPlus,
        caption: "Novo usuário",
        url: "/restricted/users/novo",
        authenticated: false,
        iconColor: C.accent,
        backgroundActive: C.accentSoft,
        backgroundInactive: C.surface,
        borderActive: C.accent,
    },
    ["newItem"]: {
        icon: IconPlus,
        caption: "Novo produto",
        url: "/restricted/items/novo",
        authenticated: false,
        iconColor: C.accent,
        backgroundActive: C.accentSoft,
        backgroundInactive: C.surface,
        borderActive: C.accent,
    },
    ["groups"]: {
        icon: IconUsersGroup,
        caption: "Grupos",
        url: "/restricted/groups",
        authenticated: false,
        iconColor: C.sub,
        backgroundActive: C.surfaceHover,
        backgroundInactive: C.surface,
        borderActive: C.line,
    },
    ["newGroup"]: {
        icon: IconPlus,
        caption: "Novo grupo",
        url: "/restricted/groups/novo",
        authenticated: false,
        iconColor: C.accent,
        backgroundActive: C.accentSoft,
        backgroundInactive: C.surface,
        borderActive: C.accent,
    },
    ["items"]: {
        icon: IconListDetails,
        caption: "Produtos",
        url: "/restricted/items",
        authenticated: false,
        iconColor: C.sub,
        backgroundActive: C.surfaceHover,
        backgroundInactive: C.surface,
        borderActive: C.line,
    },
    ["fill"]: {
        icon: IconForklift,
        caption: "Abastecer",
        url: "/restricted/fill",
        authenticated: false,
        iconColor: C.sub,
        backgroundActive: C.surfaceHover,
        backgroundInactive: C.surface,
        borderActive: C.line,
    },
    // inventory actions
    ["retryInventory"]: {
        icon: IconRefresh,
        caption: "Refazer",
        url: "/restricted/fill",
        authenticated: false,
        iconColor: C.warning,
        backgroundActive: C.warningSoft,
        backgroundInactive: C.surface,
        borderActive: C.warning,
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
        style={{ width: "100%" }}
        onNavigate={async () => {
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
            borderColor={isHovering ? actionData.borderActive : C.line}
            borderRadius="xl"
            onMouseEnter={() => { setHovering(true) }}
            onMouseLeave={() => { setHovering(false) }}
        >
            <Flex gap="4" justify="space-between" align="center">
                <Text color={actionData.iconColor}><actionData.icon size={"3rem"} /></Text>
                <Text textStyle="3xl" color={C.ink}>{actionData.caption}</Text>
            </Flex>
        </Box>
    </Link>
}
