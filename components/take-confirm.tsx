"use client"

import { UpdateInventory } from "@/api/controls";
import { RegisterRetirada } from "@/api/users";
import { Box, Flex, Text } from "@chakra-ui/react";
import { IconCheck } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function TakeConfirm({ userId, taken }: { userId?: string, taken?: string[] }) {
    const router = useRouter();
    const [isHovering, setHovering] = useState(false);
    const [sending, setSending] = useState(false);

    async function confirm() {
        if (sending) {
            return;
        }
        setSending(true);

        // Registra quem levou o que antes de fechar o inventario. E o que zera a
        // contagem do prazo de troca do EPI: sem isto o item obrigatorio
        // continuaria aparecendo como vencido mesmo depois de retirado.
        //
        // Falha aqui nao trava a confirmacao: o estoque precisa fechar de
        // qualquer jeito, senao a leitura das tags fica divergente do banco.
        if (userId != undefined && userId != "" && taken != undefined) {
            for (const productId of taken) {
                try {
                    await RegisterRetirada(userId, productId, "armario");
                } catch {
                    // segue o fluxo
                }
            }
        }

        await UpdateInventory();
        router.push("/");
    }

    return <Box
        w="100%"
        px="2rem"
        py="1rem"
        bg={isHovering ? "green.400" : "green.300"}
        borderWidth="0.1rem"
        borderColor={isHovering ? "border.inverted" : "border.emphasized"}
        borderRadius="xl"
        opacity={sending ? 0.7 : 1}
        onMouseEnter={() => { setHovering(true) }}
        onMouseLeave={() => { setHovering(false) }}
        onClick={confirm}
    >
        <Flex gap="4" justify="space-between" align="center">
            <Text color="green"><IconCheck size={"3rem"} /></Text>
            <Text textStyle="3xl">{sending ? "Confirmando..." : "Confirmar"}</Text>
        </Flex>
    </Box>
}
