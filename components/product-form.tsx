"use client"
import { DeleteItem, UpdateItem } from "@/api/item-data";
import { ItemData, PORTAS } from "@/types/ItemData";
import { Local } from "@/types/Local";
import { Box, Button, Field, Flex, Image, Input, Text, Textarea, VStack,} from "@chakra-ui/react";
import { IconAlertTriangle, IconArrowBackUp, IconCheck, IconTrash, IconUpload } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { ChangeEvent, useRef, useState } from "react";
import { SelectField } from "@/components/select-field";
import { C } from "@/theme/colors";

// Estado do CA em relacao a data de hoje. O EPI com CA vencido nao pode ser
// distribuido, entao vale avisar na tela em vez de deixar passar batido.
function caStatus(vencimento: string): { color: string; text: string } | undefined {
    if (vencimento == "") {
        return undefined;
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const data = new Date(vencimento + "T00:00:00");
    const dias = Math.round((data.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));

    if (dias < 0) {
        return { color: C.danger, text: "CA vencido" };
    }
    if (dias <= 30) {
        return { color: C.warning, text: `Vence em ${dias} dia${dias == 1 ? "" : "s"}` };
    }

    return undefined;
}

const PORTA_OPTIONS = [
    { value: "", label: "Não informada" },
    ...PORTAS.map((p) => ({ value: String(p), label: `Porta ${p}` })),
];

// MOCK: Dados provisórios enquanto o Bugadinho não cria a tabela de locais
export function ProductForm({ itemId, item, quantity, locais = [] }: { itemId?: string, item?: ItemData, quantity?: number, locais?: Local[] }) {
    const router = useRouter();
    const editing = item != undefined;

    const [id, setId] = useState(itemId ?? "");
    const [title, setTitle] = useState(item?.title ?? "");
    const [description, setDescription] = useState(item?.description ?? "");
    const [imageUri, setImageUri] = useState(item?.imageUri ?? "");
    const [imageFile, setImageFile] = useState(undefined as File | undefined);
    const [videoUri, setVideoUri] = useState(item?.videoUri ?? "");
    const [ca, setCa] = useState(item?.ca ?? "");
    const [caVencimento, setCaVencimento] = useState(item?.caVencimento ?? "");
    const [success, setSuccess] = useState<"" | "save" | "delete">("");
    
    // O endereço agora é texto livre para permitir múltiplos locais (ex: "A01, A02, A03")
    const [endereco, setEndereco] = useState(item?.endereco ?? "");
    const [porta, setPorta] = useState(item?.porta != undefined && item.porta > 0 ? String(item.porta) : "");
    const [local, setLocal] = useState(item?.local ?? "");
    const [errors, setErrors] = useState({} as Record<string, string>);
    const [saving, setSaving] = useState(false);
    const [confirmingDelete, setConfirmingDelete] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const status = caStatus(caVencimento);

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
        router.push("/restricted/items");
    }

    async function save() {
        const found = {} as Record<string, string>;
        if (id.trim() == "") {
            found.id = "Informe o código do produto.";
        }
        if (title.trim() == "") {
            found.title = "Informe o nome.";
        }
        // Se informou o CA, o vencimento tambem e necessario, senao nao da para
        // saber se ele ainda vale.
        if (ca.trim() != "" && caVencimento == "") {
            found.caVencimento = "Informe o vencimento do CA.";
        }
        // O local decide o fluxo inteiro do produto: armario e retirada direta,
        // almoxarifado passa por solicitacao. Sem ele o produto cairia em armario
        // por omissao, virando retirada livre de uma coisa que talvez devesse
        // passar por pedido.
        if (local == "") {
            found.local = "Escolha onde o produto é retirado.";
        }

        setErrors(found);
        if (Object.keys(found).length > 0) {
            return;
        }

        setSaving(true);
        const ok = await UpdateItem(
            id.trim(),
            title.trim(),
            description.trim(),
            imageFile,
            videoUri.trim(),
            ca.trim(),
            caVencimento,
            endereco.trim(),
            porta != "" ? Number(porta) : undefined,
            // A tela ainda nao deixa editar a origem (armario/almoxarifado) por
            // aqui, entao mantem o valor que o produto ja tinha.
            item?.origem,
            local
        );
        setSaving(false);

        if (!ok) {
            setErrors({ form: "Não foi possível salvar. Verifique a conexão com o servidor." });
            return;
        }
        setSuccess("save");

        setTimeout(() => {
            router.push("/restricted/items");
            router.refresh();
        }, 1500);
    }

    async function remove() {
        setSaving(true);
        const ok = await DeleteItem(id);
        setSaving(false);
        setSuccess("delete");
        
        setTimeout(() => {
            router.push("/restricted/items");
            router.refresh();
        }, 1500);

        if (!ok) {
            setErrors({ form: "Não foi possível excluir. Verifique a conexão com o servidor." });
            return;
        }
    
        router.push("/restricted/items");
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
                    placeholder="Ex.: epi1"
                    onChange={(event) => { setId(event.currentTarget.value) }}
                />
                <Field.ErrorText color={C.danger}>{errors.id}</Field.ErrorText>
            </Field.Root>

            <Field.Root invalid={errors.title != undefined}>
                <Field.Label textStyle="xl" color={C.ink}>Nome</Field.Label>
                <Input
                    size="xl"
                    value={title}
                    bg={C.surface}
                    borderColor={C.line}
                    color={C.ink}
                    placeholder="Ex.: Luva de raspa"
                    onChange={(event) => { setTitle(event.currentTarget.value) }}
                />
                <Field.ErrorText color={C.danger}>{errors.title}</Field.ErrorText>
            </Field.Root>

            <Field.Root>
                <Field.Label textStyle="xl" color={C.ink}>Descrição</Field.Label>
                <Textarea
                    size="xl"
                    value={description}
                    bg={C.surface}
                    borderColor={C.line}
                    color={C.ink}
                    rows={3}
                    placeholder="Instruções de uso, cuidados, observações"
                    onChange={(event) => { setDescription(event.currentTarget.value) }}
                />
            </Field.Root>
            
            <Field.Root invalid={errors.local != undefined}>
                <Field.Label textStyle="xl" color={C.ink}>Local de retirada</Field.Label>
                <SelectField
                    value={local}
                    onChange={setLocal}
                    // So os locais que existem mesmo no cadastro. Nao ha lista de
                    // reserva: a coluna aponta para local(id), entao um id inventado
                    // e recusado pelo banco e a tela so mostraria "nao foi possivel
                    // salvar", sem dizer o porque.
                    options={locais.map((l) => ({ value: String(l.id), label: l.nome }))}
                    placeholder={locais.length > 0 ? "Selecione..." : "Nenhum local cadastrado"}
                    invalid={errors.local != undefined}
                />

                <Field.HelperText color={C.sub}>
                    No armário a retirada é direta. No almoxarifado o usuário faz uma
                    solicitação, que vira uma lista de separação. O produto é retirado
                    só de onde estiver definido aqui.
                </Field.HelperText>
                <Field.ErrorText color={C.danger}>{errors.local}</Field.ErrorText>
            </Field.Root>

            <Field.Root>
                <Field.Label textStyle="xl" color={C.ink}>Porta do armário</Field.Label>
                <SelectField
                    value={porta}
                    onChange={setPorta}
                    options={PORTA_OPTIONS}
                    placeholder="Não informada"
                />
            </Field.Root>

            <Field.Root invalid={errors.endereco != undefined}>
                <Field.Label textStyle="xl" color={C.ink}>Endereço no armário</Field.Label>
                <Input
                    size="xl"
                    value={endereco}
                    bg={C.surface}
                    borderColor={C.line}
                    color={C.ink}
                    placeholder="Ex.: A01, A02, B05"
                    onChange={(event) => { setEndereco(event.currentTarget.value) }}
                />
                <Field.HelperText color={C.sub} mt="1">
                    Pode informar mais de um gancho ou posição (ex: A01, A02).
                </Field.HelperText>
                <Field.ErrorText color={C.danger}>{errors.endereco}</Field.ErrorText>
            </Field.Root>

            <Flex gap="1rem" w="100%" direction={{ base: "column", sm: "row" }}>
                <Field.Root flex="1">
                    <Field.Label textStyle="xl" color={C.ink}>CA</Field.Label>
                    <Input
                        size="xl"
                        value={ca}
                        bg={C.surface}
                        borderColor={C.line}
                        color={C.ink}
                        placeholder="Certificado de Aprovação"
                        onChange={(event) => { setCa(event.currentTarget.value) }}
                    />
                </Field.Root>

                <Field.Root flex="1" invalid={errors.caVencimento != undefined}>
                    <Field.Label textStyle="xl" color={C.ink}>Vencimento do CA</Field.Label>
                    <Input
                        size="xl"
                        type="date"
                        value={caVencimento}
                        bg={C.surface}
                        borderColor={C.line}
                        color={C.ink}
                        onChange={(event) => { setCaVencimento(event.currentTarget.value) }}
                    />
                    <Field.ErrorText color={C.danger}>{errors.caVencimento}</Field.ErrorText>
                </Field.Root>
            </Flex>

            {status != undefined ? <Flex gap="2" align="center" w="100%" color={status.color}>
                <IconAlertTriangle size={20} />
                <Text textStyle="lg" fontWeight="semibold">{status.text}</Text>
            </Flex> : undefined}

            <Field.Root>
                <Field.Label textStyle="xl" color={C.ink}>Imagem</Field.Label>
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
                        {imageUri != "" ? <Image src={imageUri} alt={title} w="100%" h="100%" objectFit="cover" /> : undefined}
                    </Box>
                    <Button
                        size="lg"
                        variant="outline"
                        color={C.sub}
                        borderColor={C.line}
                        bg={C.surface}
                        onClick={() => { fileRef.current?.click() }}
                    >
                        <IconUpload /> {imageUri != "" ? "Trocar imagem" : "Adicionar imagem"}
                    </Button>
                </Flex>
                <input ref={fileRef} type="file" accept="image/*" onChange={pickImage} style={{ display: "none" }} />
            </Field.Root>

            <Field.Root>
                <Field.Label textStyle="xl" color={C.ink}>Vídeo de instrução</Field.Label>
                <Input
                    size="xl"
                    value={videoUri}
                    bg={C.surface}
                    borderColor={C.line}
                    color={C.ink}
                    placeholder="URL do vídeo (opcional)"
                    onChange={(event) => { setVideoUri(event.currentTarget.value) }}
                />
            </Field.Root>

            {editing ? <Field.Root>
                <Field.Label textStyle="xl" color={C.ink}>Estoque</Field.Label>
                <Box
                    w="100%"
                    px="1rem"
                    py="0.75rem"
                    bg={C.surfaceHover}
                    borderWidth="0.1rem"
                    borderColor={C.line}
                    borderRadius="md"
                >
                    <Text textStyle="xl" color={C.ink}>{quantity ?? 0} unidades</Text>
                </Box>
                <Field.HelperText color={C.sub}>
                    Vem da contagem das tags RFID. Para alterar, use o Abastecer.
                </Field.HelperText>
            </Field.Root> : undefined}
        </VStack>

        {errors.form != undefined ? <Text color={C.danger}>{errors.form}</Text> : undefined}

        <VStack gap="1rem" w="100%">
            <Button
                size="2xl"
                w="100%"
                bg={success === "save" ? C.success : C.accent}
                color="white"
                loading={saving && success === ""}
                disabled={success !== ""}
                onClick={save}
                _hover={{ filter: "brightness(0.95)" }}
            >
                {success === "save" ? (
                    <Flex gap="2" align="center">
                        <IconCheck size={24} />
                        <Text>{editing ? "Produto atualizado!" : "Produto cadastrado!"}</Text>
                    </Flex>
                ) : (
                    editing ? "Salvar alterações" : "Cadastrar produto"
                )}
            </Button>

            {editing && !confirmingDelete ? (
                <Button
                    size="xl"
                    w="100%"
                    variant={success === "delete" ? "solid" : "outline"}
                    colorScheme={success === "delete" ? "green" : "red"}
                    bg={success === "delete" ? C.success : "transparent"} 
                    color={success === "delete" ? "white" : C.danger}
                    borderColor={success === "delete" ? "transparent" : C.danger}
                    borderWidth="2px"
                    loading={saving && success === ""}
                    disabled={success !== ""}
                    onClick={() => { setConfirmingDelete(true) }}
                >
                    {success === "delete" ? (
                        <Flex gap="2" align="center">
                            <IconCheck size={24} />
                            <Text>Produto excluído!</Text>
                        </Flex>
                    ) : (
                        <>
                            <IconTrash /> Excluir produto
                        </>
                    )}
                </Button>
            ) : undefined}

            {editing && confirmingDelete ? <Box
                w="100%"
                p="1rem"
                borderRadius="xl"
                bg={C.dangerSoft}
                borderWidth="0.1rem"
                borderColor={C.danger}
            >
                <Text textStyle="lg" color={C.dangerInk}>Excluir <b>{title}</b>? Esta ação não pode ser desfeita.</Text>
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
                        bg={success === "delete" ? C.success : "transparent"}
                        color={success === "delete" ? "white" : C.danger}
                        borderColor={success === "delete" ? "transparent" : C.danger}
                        borderWidth="2px"
                        loading={saving && success === ""}
                        disabled={success !== ""}
                        onClick={remove}
                        _hover={{ 
                         bg: success === "delete" ? C.success : "rgba(255, 0, 0, 0.14) !important",
                         color: success === "delete" ? "white" : `${C.danger} !important`,
                         borderColor: success === "delete" ? "transparent" : `${C.danger} !important`  
                        }}
                    >
                        {success === "delete" ? (
                            <Flex gap="2" align="center">
                                <IconCheck size={24} />
                                <Text>Produto excluído!</Text>
                            </Flex>
                        ) : (
                            "Excluir produto"
                        )}
                    </Button>
                </Flex>
            </Box> : undefined}

            <Button size="xl" w="100%" 
                    variant="ghost" 
                    color={C.sub} 
                    _hover={{ bg: C.surfaceHover, color: C.ink }}
                    onClick={back}
            >
                <IconArrowBackUp /> Voltar
            </Button>
        </VStack>
    </VStack>
}