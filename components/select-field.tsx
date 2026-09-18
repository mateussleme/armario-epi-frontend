"use client"

import { Box, Flex, Text, VStack } from "@chakra-ui/react";
import { IconCheck, IconChevronDown } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { C } from "@/theme/colors";

export type SelectOption = {
    value: string;
    label: string;
};

// Seletor proprio, no lugar do <select> nativo. O nativo abre a lista com a
// aparencia do sistema operacional (fundo escuro no Linux e no Windows), o que
// destoa do resto da tela e varia de maquina para maquina. Aqui a lista e nossa,
// entao fica igual em qualquer lugar.
//
// Fecha ao escolher, ao tocar fora e com Esc.
export function SelectField({
    value,
    onChange,
    options,
    placeholder = "Selecione...",
    invalid = false,
}: {
    value: string;
    onChange: (value: string) => void;
    options: SelectOption[];
    placeholder?: string;
    invalid?: boolean;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const selected = options.find((o) => o.value == value);

    useEffect(() => {
        if (!open) {
            return;
        }

        function onDocDown(e: Event) {
            if (ref.current != null && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }

        function onKey(e: KeyboardEvent) {
            if (e.key == "Escape") {
                setOpen(false);
            }
        }

        document.addEventListener("mousedown", onDocDown);
        document.addEventListener("touchstart", onDocDown);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onDocDown);
            document.removeEventListener("touchstart", onDocDown);
            document.removeEventListener("keydown", onKey);
        };
    }, [open]);

    return <Box ref={ref} position="relative" w="100%">
        <Flex
            role="button"
            tabIndex={0}
            align="center"
            justify="space-between"
            gap="2"
            px="1rem"
            py="0.75rem"
            minH="3rem"
            borderRadius="md"
            bg={C.surface}
            borderWidth="0.1rem"
            borderColor={invalid ? C.danger : open ? C.accent : C.line}
            cursor="pointer"
            onClick={() => { setOpen(!open) }}
            onKeyDown={(e) => {
                if (e.key == "Enter" || e.key == " ") {
                    e.preventDefault();
                    setOpen(!open);
                }
            }}
        >
            <Text textStyle="xl" color={selected != undefined ? C.ink : C.faint} truncate>
                {selected != undefined ? selected.label : placeholder}
            </Text>
            <Box
                color={C.faint}
                flexShrink={0}
                transform={open ? "rotate(180deg)" : undefined}
                transition="transform .15s"
            >
                <IconChevronDown size={20} />
            </Box>
        </Flex>

        {open ? <VStack
            position="absolute"
            top="calc(100% + 4px)"
            left="0"
            right="0"
            zIndex={30}
            gap="0"
            align="stretch"
            maxH="16rem"
            overflowY="auto"
            overflowX="hidden"
            borderRadius="md"
            bg={C.surface}
            borderWidth="0.1rem"
            borderColor={C.line}
            boxShadow="0 8px 24px rgba(0,0,0,0.12)"
            py="1"
        >
            {options.map((option) => {
                const isSelected = option.value == value;
                return <Flex
                    key={option.value}
                    align="center"
                    justify="space-between"
                    gap="2"
                    px="1rem"
                    py="0.75rem"
                    minH="3rem"
                    cursor="pointer"
                    bg={isSelected ? C.accentSoft : "transparent"}
                    _hover={{ bg: isSelected ? C.accentSoft : C.surfaceHover }}
                    onClick={() => {
                        onChange(option.value);
                        setOpen(false);
                    }}
                >
                    <Text textStyle="xl" color={isSelected ? C.accentInk : C.ink} truncate>
                        {option.label}
                    </Text>
                    {isSelected ? <Box color={C.accent} flexShrink={0}>
                        <IconCheck size={18} />
                    </Box> : undefined}
                </Flex>
            })}
        </VStack> : undefined}
    </Box>
}
