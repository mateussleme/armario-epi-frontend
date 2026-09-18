"use client"
import { DeleteUser, UpdateUser, UserType } from "@/api/users";
import { Box, Button, Field, Flex, Image, Input, Switch, Text, VStack } from "@chakra-ui/react";
import { IconArrowBackUp, IconCheck, IconTrash, IconUpload } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { ChangeEvent, useRef, useState } from "react";
import { C } from "@/theme/colors";

export function UserForm({ user }: { user?: UserType }) {
    const router = useRouter();
    const editing = user != undefined;

    const [userId, setUserId] = useState(user?.id ?? "");
    const [name, setName] = useState(user?.name ?? "");
    const [admin, setAdmin] = useState(user?.admin ?? false);
    const [imageUri, setImageUri] = useState(user?.imageUri ?? "");
    const [imageFile, setImageFile] = useState(undefined as File | undefined);
    const [errors, setErrors] = useState({} as Record<string, string>);
    const [saving, setSaving] = useState(false);
    const [confirmingDelete, setConfirmingDelete] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    function pickImage(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (file == undefined) {
            return;
        }

        // guarda o arquivo (e o que a API espera, multipart) e gera um preview
        setImageFile(file);
        const reader = new FileReader();
        reader.onload = () => { setImageUri(reader.result as string) };
        reader.readAsDataURL(file);
    }

    function back() {
        router.push("/restricted/users");
    }

    async function save() {
        const found = {} as Record<string, string>;
        if (userId.trim() == "") {
            found.userId = "Informe a matrícula.";
        }
        if (name.trim() == "") {
            found.name = "Informe o nome.";
        }

        setErrors(found);
        if (Object.keys(found).length > 0) {
            return;
        }

        setSaving(true);
        const ok = await UpdateUser(userId.trim(), name.trim(), admin, imageFile);
        setSaving(false);

        if (!ok) {
            setErrors({ form: "Não foi possível salvar. Verifique a conexão com o servidor." });
            return;
        }

        router.push("/restricted/users");
        router.refresh();
    }

    async function remove() {
        setSaving(true);
        const ok = await DeleteUser(userId);
        setSaving(false);

        if (!ok) {
            setErrors({ form: "Não foi possível excluir. Verifique a conexão com o servidor." });
            return;
        }

        router.push("/restricted/users");
        router.refresh();
    }

    return <VStack gap="2rem" w="100%">
        <VStack gap="1rem" w="100%">
            <Field.Root invalid={errors.userId != undefined}>
                <Field.Label textStyle="xl" color={C.ink}>Matrícula</Field.Label>
                <Input
                    size="xl"
                    value={userId}
                    disabled={editing}
                    bg={C.surface}
                    borderColor={C.line}
                    color={C.ink}
                    placeholder="Ex.: 10432"
                    onChange={(event) => { setUserId(event.currentTarget.value) }}
                />
                <Field.ErrorText color={C.danger}>{errors.userId}</Field.ErrorText>
            </Field.Root>

            <Field.Root invalid={errors.name != undefined}>
                <Field.Label textStyle="xl" color={C.ink}>Nome</Field.Label>
                <Input
                    size="xl"
                    value={name}
                    bg={C.surface}
                    borderColor={C.line}
                    color={C.ink}
                    placeholder="Nome completo"
                    onChange={(event) => { setName(event.currentTarget.value) }}
                />
                <Field.ErrorText color={C.danger}>{errors.name}</Field.ErrorText>
            </Field.Root>

            <Field.Root>
                <Field.Label textStyle="xl" color={C.ink}>Foto</Field.Label>
                <Flex gap="4" align="center" w="100%">
                    <Box
                        w="6rem"
                        h="6rem"
                        borderRadius="xl"
                        overflow="hidden"
                        bg={C.surfaceHover}
                        borderWidth="0.1rem"
                        borderColor={C.line}
                    >
                        {imageUri != "" ? <Image src={imageUri} alt={name} w="100%" h="100%" objectFit="cover" /> : undefined}
                    </Box>
                    <Button
                        size="lg"
                        variant="outline"
                        color={C.sub}
                        borderColor={C.line}
                        bg={C.surface}
                        onClick={() => { fileRef.current?.click() }}
                    >
                        <IconUpload /> {imageUri != "" ? "Trocar foto" : "Adicionar foto"}
                    </Button>
                </Flex>
                <input ref={fileRef} type="file" accept="image/*" onChange={pickImage} style={{ display: "none" }} />
            </Field.Root>

            <Field.Root>
                <Switch.Root checked={admin} onCheckedChange={(event) => { setAdmin(event.checked) }}>
                    <Switch.HiddenInput />
                    <Switch.Control />
                    <Switch.Label textStyle="xl" color={C.ink}>Acesso de administrador</Switch.Label>
                </Switch.Root>
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
                <IconCheck /> {editing ? "Salvar alterações" : "Cadastrar usuário"}
            </Button>

            {editing && !confirmingDelete ? <Button
                size="xl"
                w="100%"
                variant="ghost"
                color={C.danger}
                onClick={() => { setConfirmingDelete(true) }}
            >
                <IconTrash /> Excluir usuário
            </Button> : undefined}

            {editing && confirmingDelete ? <Box
                w="100%"
                p="1rem"
                borderRadius="xl"
                bg={C.dangerSoft}
                borderWidth="0.1rem"
                borderColor={C.danger}
            >
                <Text textStyle="lg" color={C.dangerInk}>Excluir <b>{name}</b>? Esta ação não pode ser desfeita.</Text>
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
