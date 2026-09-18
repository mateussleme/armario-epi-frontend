"use client"
import { DeleteGroup, GroupProduct, GroupType, RemoveProductFromGroup, SetProductInGroup, UpdateGroup } from "@/api/groups";
import { Box, Button, Field, Flex, Input, Text, VStack } from "@chakra-ui/react";
import { IconArrowBackUp, IconCheck, IconPlus, IconTrash } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SelectField } from "@/components/select-field";
import { C } from "@/theme/colors";

// Botao de liga/desliga proprio, pelo mesmo motivo do SelectField: o controle
// nativo muda de aparencia conforme o sistema, e a tela roda num totem.
function Toggle({
    checked,
    onChange,
    label,
    disabled = false,
}: {
    checked: boolean;
    onChange: (value: boolean) => void;
    label: string;
    disabled?: boolean;
}) {
    return <Flex
        role="button"
        tabIndex={0}
        align="center"
        gap="2"
        px="0.75rem"
        py="0.5rem"
        minH="3rem"
        borderRadius="md"
        borderWidth="0.1rem"
        borderColor={checked ? C.accent : C.line}
        bg={checked ? C.accentSoft : C.surface}
        cursor={disabled ? "default" : "pointer"}
        opacity={disabled ? 0.6 : 1}
        onClick={() => { if (!disabled) { onChange(!checked) } }}
        onKeyDown={(e) => {
            if (!disabled && (e.key == "Enter" || e.key == " ")) {
                e.preventDefault();
                onChange(!checked);
            }
        }}
    >
        <Flex
            w="1.4rem"
            h="1.4rem"
            flexShrink={0}
            align="center"
            justify="center"
            borderRadius="sm"
            borderWidth="0.1rem"
            borderColor={checked ? C.accent : C.line}
            bg={checked ? C.accent : C.surface}
            color="white"
        >
            {checked ? <IconCheck size={14} /> : undefined}
        </Flex>
        <Text textStyle="lg" color={checked ? C.accentInk : C.sub} whiteSpace="nowrap">{label}</Text>
    </Flex>
}

export function GroupForm({
    group,
    groupProducts,
    allProducts,
}: {
    group?: GroupType,
    groupProducts?: GroupProduct[],
    allProducts?: Record<string, string>,
}) {
    const router = useRouter();
    const editing = group != undefined;

    const [id, setId] = useState(group?.id ?? "");
    const [name, setName] = useState(group?.name ?? "");
    const [products, setProducts] = useState(groupProducts ?? []);
    const [errors, setErrors] = useState({} as Record<string, string>);
    const [saving, setSaving] = useState(false);
    const [confirmingDelete, setConfirmingDelete] = useState(false);

    // regra do item que esta sendo adicionado
    const [newProduct, setNewProduct] = useState("");
    const [newObrigatorio, setNewObrigatorio] = useState(false);
    const [newDias, setNewDias] = useState("");

    const available = Object.keys(allProducts ?? {})
        .filter((p) => !products.some((item) => item.produto == p))
        .map((p) => ({ value: p, label: (allProducts ?? {})[p] ?? p }))
        .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));

    function back() {
        router.push("/restricted/groups");
    }

    function nameOf(productId: string) {
        return (allProducts ?? {})[productId] ?? productId;
    }

    function diasFromInput(value: string) {
        const parsed = parseInt(value, 10);
        if (isNaN(parsed) || parsed <= 0) {
            return undefined;
        }
        return parsed;
    }

    async function addProduct() {
        if (newProduct == "") {
            return;
        }

        const dias = diasFromInput(newDias);

        setSaving(true);
        const ok = await SetProductInGroup(id, newProduct, newObrigatorio, dias);
        setSaving(false);

        if (!ok) {
            setErrors({ form: "Não foi possível adicionar o item." });
            return;
        }

        setProducts([...products, { produto: newProduct, obrigatorio: newObrigatorio, diasValidade: dias ?? null }]);
        setNewProduct("");
        setNewObrigatorio(false);
        setNewDias("");
        setErrors({});
    }

    // A regra grava assim que muda, sem botao separado: o "Salvar alterações"
    // do rodape e do grupo (codigo e nome), e ja tinha gente achando que ele
    // salvava os itens tambem.
    async function updateRule(productId: string, obrigatorio: boolean, dias?: number) {
        setProducts(products.map((item) =>
            item.produto == productId
                ? { ...item, obrigatorio, diasValidade: dias ?? null }
                : item
        ));

        const ok = await SetProductInGroup(id, productId, obrigatorio, dias);
        if (!ok) {
            setErrors({ form: "Não foi possível salvar a regra do item." });
            return;
        }
        setErrors({});
    }

    async function removeProduct(productId: string) {
        setSaving(true);
        const ok = await RemoveProductFromGroup(id, productId);
        setSaving(false);

        if (!ok) {
            setErrors({ form: "Não foi possível remover o item." });
            return;
        }

        setProducts(products.filter((item) => item.produto != productId));
        setErrors({});
    }

    async function save() {
        const found = {} as Record<string, string>;
        if (id.trim() == "") {
            found.id = "Informe o código do grupo.";
        }
        if (name.trim() == "") {
            found.name = "Informe o nome.";
        }

        setErrors(found);
        if (Object.keys(found).length > 0) {
            return;
        }

        setSaving(true);
        const ok = await UpdateGroup(id.trim(), name.trim());
        setSaving(false);

        if (!ok) {
            setErrors({ form: "Não foi possível salvar. Verifique a conexão com o servidor." });
            return;
        }

        router.push("/restricted/groups");
        router.refresh();
    }

    async function remove() {
        setSaving(true);
        const ok = await DeleteGroup(id);
        setSaving(false);

        if (!ok) {
            setErrors({ form: "Não foi possível excluir. Verifique a conexão com o servidor." });
            return;
        }

        router.push("/restricted/groups");
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
                    placeholder="Ex.: soldagem"
                    onChange={(event) => { setId(event.currentTarget.value) }}
                />
                <Field.ErrorText color={C.danger}>{errors.id}</Field.ErrorText>
            </Field.Root>

            <Field.Root invalid={errors.name != undefined}>
                <Field.Label textStyle="xl" color={C.ink}>Nome</Field.Label>
                <Input
                    size="xl"
                    value={name}
                    bg={C.surface}
                    borderColor={C.line}
                    color={C.ink}
                    placeholder="Ex.: Grupo de Soldagem"
                    onChange={(event) => { setName(event.currentTarget.value) }}
                />
                <Field.ErrorText color={C.danger}>{errors.name}</Field.ErrorText>
            </Field.Root>
        </VStack>

        {/* Os itens so podem ser gerenciados depois que o grupo existe, porque as
            rotas de adicionar e remover usam o id do grupo. */}
        {editing ? <VStack gap="1rem" w="100%" align="stretch">
            <Box>
                <Text textStyle="2xl" color={C.ink}>Itens do grupo</Text>
                <Text textStyle="md" color={C.sub}>
                    Item obrigatório vencido entra travado no carrinho da pessoa. A contagem começa na última retirada dela.
                </Text>
            </Box>

            {/* adicionar vem antes da lista, como combinado */}
            <Box
                p="1rem"
                bg={C.surfaceHover}
                borderWidth="0.1rem"
                borderColor={C.line}
                borderRadius="xl"
            >
                <Flex gap="2" direction={{ base: "column", md: "row" }} align={{ base: "stretch", md: "end" }}>
                    <Box flex="1" minW="0">
                        <Text textStyle="sm" color={C.sub} mb="1">Item</Text>
                        <SelectField
                            value={newProduct}
                            onChange={setNewProduct}
                            options={available}
                            placeholder="Selecione..."
                        />
                    </Box>

                    <Box>
                        <Text textStyle="sm" color={C.sub} mb="1">Troca</Text>
                        <Toggle
                            checked={newObrigatorio}
                            onChange={setNewObrigatorio}
                            label="Obrigatório"
                        />
                    </Box>

                    <Box w={{ base: "100%", md: "9rem" }}>
                        <Text textStyle="sm" color={C.sub} mb="1">Dura (dias)</Text>
                        <Input
                            size="lg"
                            type="number"
                            min={1}
                            value={newDias}
                            bg={C.surface}
                            borderColor={C.line}
                            color={C.ink}
                            placeholder="não vence"
                            onChange={(event) => { setNewDias(event.currentTarget.value) }}
                        />
                    </Box>

                    <Button
                        size="lg"
                        minH="3rem"
                        bg={C.accent}
                        color="white"
                        _hover={{ filter: "brightness(0.95)" }}
                        loading={saving}
                        onClick={addProduct}
                    >
                        <IconPlus /> Adicionar
                    </Button>
                </Flex>
            </Box>

            {products.length == 0 ? <Box
                px="2rem"
                py="1.5rem"
                textAlign="center"
                borderWidth="0.1rem"
                borderStyle="dashed"
                borderColor={C.line}
                borderRadius="xl"
            >
                <Text color={C.sub}>Nenhum item neste grupo ainda.</Text>
            </Box> : undefined}

            {products.map((item) => (
                <Flex
                    key={item.produto}
                    align={{ base: "stretch", md: "center" }}
                    direction={{ base: "column", md: "row" }}
                    gap="3"
                    px="1.5rem"
                    py="1rem"
                    bg={C.surface}
                    borderWidth="0.1rem"
                    borderColor={item.obrigatorio ? C.accent : C.line}
                    borderRadius="xl"
                >
                    <Box flex="1" minW="0">
                        <Text textStyle="xl" color={C.ink} lineClamp={1}>{nameOf(item.produto)}</Text>
                        <Text textStyle="sm" color={C.sub}>
                            {item.obrigatorio
                                ? (item.diasValidade != undefined && item.diasValidade != null
                                    ? `Obrigatório, troca a cada ${item.diasValidade} dias`
                                    : "Obrigatório, sem prazo de troca")
                                : "Opcional"}
                        </Text>
                    </Box>

                    <Toggle
                        checked={item.obrigatorio}
                        onChange={(value) => { updateRule(item.produto, value, item.diasValidade ?? undefined) }}
                        label="Obrigatório"
                    />

                    <Box w={{ base: "100%", md: "7rem" }}>
                        <Input
                            size="lg"
                            type="number"
                            min={1}
                            defaultValue={item.diasValidade ?? ""}
                            bg={C.surface}
                            borderColor={C.line}
                            color={C.ink}
                            placeholder="dias"
                            // grava ao sair do campo, para nao mandar uma requisicao
                            // a cada tecla digitada
                            onBlur={(event) => {
                                const dias = diasFromInput(event.currentTarget.value);
                                if ((dias ?? null) == (item.diasValidade ?? null)) {
                                    return;
                                }
                                updateRule(item.produto, item.obrigatorio, dias);
                            }}
                        />
                    </Box>

                    <Button
                        size="lg"
                        variant="ghost"
                        color={C.sub}
                        loading={saving}
                        onClick={() => { removeProduct(item.produto) }}
                    >
                        <IconTrash />
                    </Button>
                </Flex>
            ))}
        </VStack> : undefined}

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
                <IconCheck /> {editing ? "Salvar alterações" : "Cadastrar grupo"}
            </Button>

            {editing && !confirmingDelete ? <Button
                size="xl"
                w="100%"
                variant="ghost"
                color={C.danger}
                onClick={() => { setConfirmingDelete(true) }}
            >
                <IconTrash /> Excluir grupo
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
                    Excluir <b>{name}</b>? Os usuários vinculados perdem o acesso aos itens deste grupo.
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
