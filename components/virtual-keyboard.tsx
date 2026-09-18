"use client"

import { Box, Button, Flex, IconButton, SimpleGrid } from "@chakra-ui/react";
import { IconArrowBigUp, IconBackspace, IconKeyboardOff, IconSpace } from "@tabler/icons-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { C } from "@/theme/colors";

const LINHAS = [
    ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
    ["z", "x", "c", "v", "b", "n", "m"],
];

// Escreve no campo que esta em foco. Passa pelo setter nativo do elemento para o
// React perceber a mudanca: alterar `value` direto nao dispara o onChange dele.
function typeIntoFocused(text: string) {
    const el = document.activeElement as HTMLInputElement | HTMLTextAreaElement | null;
    if (el == null) {
        return;
    }
    if (el.tagName != "INPUT" && el.tagName != "TEXTAREA") {
        return;
    }

    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;

    let value: string;
    let cursor: number;
    if (text == "\b") {
        // Backspace: apaga a selecao, ou um caractere antes do cursor.
        if (start != end) {
            value = el.value.slice(0, start) + el.value.slice(end);
            cursor = start;
        } else {
            value = el.value.slice(0, Math.max(0, start - 1)) + el.value.slice(end);
            cursor = Math.max(0, start - 1);
        }
    } else {
        value = el.value.slice(0, start) + text + el.value.slice(end);
        cursor = start + text.length;
    }

    const prototype = el.tagName == "TEXTAREA" ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;
    setter?.call(el, value);

    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.setSelectionRange(cursor, cursor);
}

function isTextField(el: Element | null): boolean {
    if (el == null) {
        return false;
    }
    if (el.tagName == "TEXTAREA") {
        return true;
    }
    if (el.tagName != "INPUT") {
        return false;
    }

    // Campos de data e arquivo tem interface propria do navegador, o teclado nao
    // ajuda neles.
    const type = (el as HTMLInputElement).type;
    return type != "date" && type != "file" && type != "checkbox" && type != "radio";
}

// Teclado em tela, para o armario, onde nao ha teclado fisico. O armario roda
// Linux em modo quiosque, onde nao da para contar com um teclado virtual do
// sistema, entao este aqui e a forma garantida de digitar.
//
// Aparece sozinho quando a pessoa toca num campo de texto e some quando o campo
// perde o foco ou quando troca de tela. Nao tem botao para abrir: esperar que o
// usuario descubra um botao seria frageis demais, e um botao fixo na tela
// atrapalharia quem usa teclado fisico.
//
// Tem so letras e numeros: a busca ignora acento (procurar "oculos" encontra
// "Óculos"), entao acentuacao nao faz falta.
export function VirtualKeyboard() {
    const [open, setOpen] = useState(false);
    const [upper, setUpper] = useState(false);
    const pathname = usePathname();

    // Ao trocar de tela o teclado some: o campo que estava em foco nem existe
    // mais.
    useEffect(() => {
        setOpen(false);
    }, [pathname]);

    useEffect(() => {
        function onFocusIn(e: FocusEvent) {
            if (isTextField(e.target as Element)) {
                setOpen(true);
            }
        }

        function onFocusOut() {
            // Espera um instante antes de fechar: ao tocar de um campo para
            // outro o foco sai e volta, e sem essa pausa o teclado piscaria.
            // Se o novo foco tambem for um campo de texto, o focusin reabre
            // antes disso rodar.
            setTimeout(() => {
                if (!isTextField(document.activeElement)) {
                    setOpen(false);
                }
            }, 120);
        }

        document.addEventListener("focusin", onFocusIn);
        document.addEventListener("focusout", onFocusOut);
        return () => {
            document.removeEventListener("focusin", onFocusIn);
            document.removeEventListener("focusout", onFocusOut);
        };
    }, []);

    if (!open) {
        return undefined;
    }

    // onMouseDown com preventDefault evita que o campo perca o foco ao tocar no
    // teclado. Tive que colocarisso, a primeira tecla nao teria onde escrever e o teclado
    // fecharia sozinho.
    const keyProps = {
        onMouseDown: (e: React.MouseEvent) => { e.preventDefault() },
    };

    return <Box
        position="fixed"
        bottom="0"
        left="0"
        right="0"
        zIndex={40}
        p="1rem"
        bg={C.surface}
        borderTopWidth="0.1rem"
        borderColor={C.line}
        boxShadow="0 -4px 16px rgba(0,0,0,0.12)"
    >
        <Flex justify="flex-end" mb="0.75rem">
            <IconButton
                aria-label="Fechar teclado"
                size="lg"
                variant="ghost"
                color={C.sub}
                onMouseDown={(e) => { e.preventDefault() }}
                onClick={() => {
                    (document.activeElement as HTMLElement | null)?.blur();
                    setOpen(false);
                }}
            >
                <IconKeyboardOff size={24} />
            </IconButton>
        </Flex>

        <Flex direction="column" gap="0.5rem" align="center">
            {LINHAS.map((linha, i) => (
                <SimpleGrid key={i} columns={linha.length} gap="0.5rem" w="100%" maxW="48rem">
                    {linha.map((tecla) => (
                        <Button
                            key={tecla}
                            size="xl"
                            h="3.5rem"
                            bg={C.surfaceHover}
                            color={C.ink}
                            borderWidth="0.1rem"
                            borderColor={C.line}
                            _hover={{ bg: C.accentSoft }}
                            {...keyProps}
                            onClick={() => { typeIntoFocused(upper ? tecla.toUpperCase() : tecla) }}
                        >
                            {upper ? tecla.toUpperCase() : tecla}
                        </Button>
                    ))}
                </SimpleGrid>
            ))}

            <Flex gap="0.5rem" w="100%" maxW="48rem">
                <Button
                    size="xl"
                    h="3.5rem"
                    flex="1"
                    bg={upper ? C.accentSoft : C.surfaceHover}
                    color={upper ? C.accentInk : C.ink}
                    borderWidth="0.1rem"
                    borderColor={upper ? C.accent : C.line}
                    {...keyProps}
                    onClick={() => { setUpper(!upper) }}
                >
                    <IconArrowBigUp size={24} />
                </Button>
                <Button
                    size="xl"
                    h="3.5rem"
                    flex="4"
                    bg={C.surfaceHover}
                    color={C.ink}
                    borderWidth="0.1rem"
                    borderColor={C.line}
                    _hover={{ bg: C.accentSoft }}
                    {...keyProps}
                    onClick={() => { typeIntoFocused(" ") }}
                >
                    <IconSpace size={24} />
                </Button>
                <Button
                    size="xl"
                    h="3.5rem"
                    flex="1"
                    bg={C.surfaceHover}
                    color={C.ink}
                    borderWidth="0.1rem"
                    borderColor={C.line}
                    _hover={{ bg: C.dangerSoft }}
                    {...keyProps}
                    onClick={() => { typeIntoFocused("\b") }}
                >
                    <IconBackspace size={24} />
                </Button>
            </Flex>
        </Flex>
    </Box>
}
