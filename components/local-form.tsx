"use client"
import { DeleteLocal, UpdateLocal } from "@/api/locais";
import { Local, TIPOS_LOCAL, TIPO_ARMARIO } from "@/types/Local";
import { Box, Button, Field, Flex, Input, Switch, Text, VStack } from "@chakra-ui/react";
import { IconArrowBackUp, IconCheck, IconTrash } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SelectField } from "@/components/select-field";
import { C } from "@/theme/colors";

export function LocalForm({ local }: { local?: Local }) {
    const router = useRouter();
    const editing = local != undefined;

    const [id, setId] = useState(local?.id ?? "");
    const [nome, setNome] = useState(local?.nome ?? "");
    const [tipo, setTipo] = useState(local?.tipo ?? TIPO_ARMARIO);
    const [ativo, setAtivo] = useState(local?.ativo ?? true);
    const [errors, setErrors] = useState({} as Record<string, string>);
    const [saving, setSaving] = useState(false);
    const [confirmingDelete, setConfirmingDelete] = useState(false);

    function back() {
        router.push("/restricted/locais");
    }

    async function save() {
        const found = {} as Record<string, string>;
        if (id.trim() == "") {
            found.id = "Informe o código do local.";
        }
        if (nome.trim() == "") {
            found.nome = "Informe o nome.";
        }

        setErrors(found);
        if (Object.keys(found).length > 0) {
            return;
        }

        setSaving(true);
        const ok = await UpdateLocal(id.trim(), nome.trim(), tipo, ativo);
        setSaving(false);

        if (!ok) {
            setErrors({ form: "Não foi possível salvar. Verifique a conexão com o servidor." });
            return;
        }

        router.push("/restricted/locais");
        router.refresh();
    }

    async function remove() {
        setSaving(true);
        const ok = await DeleteLocal(id);
        setSaving(false);

        if (!ok) {
            // O caso comum e ter produto apontando para o local.
            setErrors({
                form: "Não foi possível excluir. Provavelmente existem produtos neste local. Desative o local em vez de excluir.",
            });
            setConfirmingDelete(false);
            return;
        }

        router.push("/restricted/locais");
        router.refresh();
    }

    return <VStack gap="2rem" w="100%">
        <VStack gap="1rem" w="100%">
            <Field.Root invalid={errors.id != undefined}>
                <Field.Label textStyle="xl" color={C.ink}>Código</Field.Label>
                <Input
                    size="xl"
                    value={id}
                    disabled={editing}
                    bg={C.surface}
                    borderColor={C.line}
                    color={C.ink}
                    placeholder="Ex.: armario02"
                    onChange={(event) => { setId(event.currentTarget.value) }}
                />
                <Field.ErrorText color={C.danger}>{errors.id}</Field.ErrorText>
            </Field.Root>

            <Field.Root invalid={errors.nome != undefined}>
                <Field.Label textStyle="xl" color={C.ink}>Nome</Field.Label>
                <Input
                    size="xl"
                    value={nome}
                    bg={C.surface}
                    borderColor={C.line}
                    color={C.ink}
                    placeholder="Ex.: Armário 02 SJP"
                    onChange={(event) => { setNome(event.currentTarget.value) }}
                />
                <Field.ErrorText color={C.danger}>{errors.nome}</Field.ErrorText>
            </Field.Root>

            <Field.Root>
                <Field.Label textStyle="xl" color={C.ink}>Tipo</Field.Label>
                <SelectField
                    value={tipo}
                    onChange={setTipo}
                    options={TIPOS_LOCAL}
                />
                <Field.HelperText color={C.sub}>
                    No armário a retirada é direta. No almoxarifado o usuário faz uma
                    solicitação, que vira uma lista de separação.
                </Field.HelperText>
            </Field.Root>

            <Field.Root>
                <Switch.Root checked={ativo} onCheckedChange={(event) => { setAtivo(event.checked) }}>
                    <Switch.HiddenInput />
                    <Switch.Control />
                    <Switch.Label textStyle="xl" color={C.ink}>Disponível para uso</Switch.Label>
                </Switch.Root>
                <Field.HelperText color={C.sub}>
                    Local desativado não aparece na hora de cadastrar produto, mas os
                    produtos que já estão nele continuam funcionando.
                </Field.HelperText>
            </Field.Root>
        </VStack>

        {errors.form != undefined ? <Text color={C.danger}>{errors.form}</Text> : undefined}

        <VStack gap="1rem" w="100%">
            <Button
                size="2xl"
                w="100%"
                bg={C.accent}
                color="white"
                _hover={{ filter: "brightness(0.95)" }}
                loading={saving}
                onClick={save}
            >
                <IconCheck /> {editing ? "Salvar alterações" : "Cadastrar local"}
            </Button>

            {editing && !confirmingDelete ? <Button
                size="xl"
                w="100%"
                variant="ghost"
                color={C.danger}
                onClick={() => { setConfirmingDelete(true) }}
            >
                <IconTrash /> Excluir local
            </Button> : undefined}

            {editing && confirmingDelete ? <Box
                w="100%"
                p="1rem"
                borderRadius="xl"
                bg={C.dangerSoft}
                borderWidth="0.1rem"
                borderColor={C.danger}
            >
                <Text textStyle="lg" color={C.dangerInk}>
                    Excluir <b>{nome}</b>? Se houver produtos neste local, a exclusão não
                    será possível; nesse caso, desative em vez de excluir.
                </Text>
                <Flex gap="2" mt="1rem">
                    <Button
                        flex="1"
                        size="lg"
                        variant="outline"
                        bg={C.surface}
                        color={C.ink}
                        borderColor={C.line}
                        onClick={() => { setConfirmingDelete(false) }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        flex="1"
                        size="lg"
                        bg={C.danger}
                        color="white"
                        _hover={{ filter: "brightness(0.95)" }}
                        loading={saving}
                        onClick={remove}
                    >
                        Excluir
                    </Button>
                </Flex>
            </Box> : undefined}

            <Button size="xl" w="100%" variant="ghost" color={C.sub} onClick={back}>
                <IconArrowBackUp /> Voltar
            </Button>
        </VStack>
    </VStack>
}
