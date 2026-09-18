import { ItemData, ORIGEM_ARMARIO } from "@/types/ItemData";
import { GetSaved } from "./controls";
import { API_URL } from "./base";
import { GetLocais } from "./locais";

export type AvailableItem = {
    id: string;
    state: string;
}

// Por que o item esta obrigatorio. Vem do backend porque a conta depende do GES
// da pessoa e da ultima retirada dela, coisas que a tela nao tem.
//
// diasDesdeUso -1 quer dizer que nunca retirou.
export type RequiredDetail = {
    produto: string;
    diasValidade: number;
    diasDesdeUso: number;
    ultimaRetirada: string;
}

export async function GetAllItems() {
    const stock = await GetSaved();

    return Object.keys(stock ?? {});
}

// Itens da pessoa mais o detalhe do que esta vencido, numa chamada so. Quem
// precisa do motivo (a tela de Retirada, para avisar de cara) usa esta; quem so
// precisa da lista usa GetAvailableItems abaixo.
export async function GetUserItems(userId: string) {
    const response = await fetch(API_URL + "/v1/user/" + encodeURIComponent(userId) + "/data", { method: "GET" });
    if (!response.ok) {
        return undefined;
    }

    const data = (await response.json()) as {
        requiredItems: string[] | null;
        availableItems: string[] | null;
        requiredDetail: RequiredDetail[] | null;
    };

    // Em Go uma lista vazia vira null no JSON, nao []. Entao quando a pessoa nao
    // tem item em nenhum grupo, estes campos chegam nulos e sem o ?? [] a tela
    // quebra em vez de aparecer vazia.
    const available = data.availableItems ?? [];
    const required = data.requiredItems ?? [];

    // Uma pessoa pode estar em varios grupos, e grupos diferentes podem exigir o
    // mesmo EPI. Nesse caso o backend devolve o produto repetido, uma vez por
    // grupo. Aqui a lista e deduplicada para o item aparecer so uma vez na tela.
    const seen = new Set<string>();
    const items = [] as AvailableItem[];
    for (const item of available) {
        if (seen.has(item)) {
            continue;
        }
        seen.add(item);

        items.push({
            id: item,
            state: required.includes(item) ? "required" : "available",
        });
    }

    return { items, detail: data.requiredDetail ?? [] };
}

export async function GetAvailableItems(userId: string) {
    const result = await GetUserItems(userId);
    if (result == undefined) {
        return undefined;
    }

    return result.items;
}

// Os itens do usuario separados por origem. A tela de Retirada mostra os que
// saem do armario; a de Solicitacao, os que vem do almoxarifado.
//
// A origem vem do cadastro de Locais: epiproduto.local guarda o id do local
// ('armario01'), e quem diz se aquilo e armario ou almoxarifado e o campo tipo
// do local. Comparar o id direto com 'armario' nao funciona, so dava certo no
// almoxarifado porque la o id e igual ao tipo por coincidencia.
//
// Produto sem local cai no campo origem antigo, e sem os dois vira armario, que
// e o padrao do banco.
export async function GetUserItemsByOrigin(userId: string, origem: string) {
    const result = await GetUserItems(userId);
    if (result == undefined) {
        return undefined;
    }

    const locais = (await GetLocais()) ?? [];
    const tipoDoLocal = new Map<string, string>();
    for (const local of locais) {
        tipoDoLocal.set(local.id, local.tipo);
    }

    const filtered = [];
    for (const item of result.items) {
        const data = await GetItemData(item.id);

        const porLocal = data?.local != undefined && data.local != ""
            ? tipoDoLocal.get(data.local)
            : undefined;
        const itemOrigem = porLocal ?? (data?.origem != undefined && data.origem != "" ? data.origem : ORIGEM_ARMARIO);

        if (itemOrigem == origem) {
            filtered.push({ ...item, data });
        }
    }

    // O detalhe vem inteiro, sem filtrar: quem usa ja cruza com a lista de itens
    // da tela, e assim a mesma chamada serve para as duas origens.
    return { items: filtered, detail: result.detail };
}

export async function GetAvailableItemsByOrigin(userId: string, origem: string) {
    const result = await GetUserItemsByOrigin(userId, origem);
    if (result == undefined) {
        return undefined;
    }

    return result.items;
}

export async function GetItemData(itemId: string) {
    const response = await fetch(API_URL + "/v1/items/" + encodeURIComponent(itemId) + "/data", { method: "GET" });
    if (!response.ok) {
        return undefined;
    }

    return (await response.json()).item as ItemData;
}

export async function GetUnknown() {
    const response = await fetch(API_URL + "/v1/session/inventory/unknown", { method: "GET" });
    if (!response.ok) {
        return undefined;
    }

    const data = (await response.json()) as {
        tags: string[] | null;
    };

    return data.tags ?? [];
}

export async function SetUnknown(itemId: string) {
    const response = await fetch(API_URL + "/v1/session/inventory/" + encodeURIComponent(itemId), { method: "POST" });
    if (!response.ok) {
        return false;
    }

    return true;
}

// A rota espera multipart form (ver CreateForm em v1/item/item.go), nao JSON.
// Cria e edita usam a mesma rota: o banco faz INSERT ... ON CONFLICT DO UPDATE.
//
// Nao existe quantidade aqui de proposito: o UpdateItem do backend nao mexe nesse
// campo, quem atualiza e a leitura das tags RFID (ver tag.go e update.go).
export async function UpdateItem(
    itemId: string,
    name: string,
    description: string,
    image?: File,
    videoUri?: string,
    ca?: string,
    caVencimento?: string,
    endereco?: string,
    porta?: number,
    origem?: string,
    local?: string,
) {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("videoUri", videoUri ?? "");
    formData.append("ca", ca ?? "");
    formData.append("caVencimento", caVencimento ?? "");
    formData.append("endereco", endereco ?? "");
    formData.append("porta", porta != undefined && porta > 0 ? String(porta) : "");
    formData.append("origem", origem ?? ORIGEM_ARMARIO);
    formData.append("local", local ?? "");
    if (image != undefined) {
        formData.append("image", image);
    }

    const response = await fetch(API_URL + "/v1/items/" + encodeURIComponent(itemId) + "/create", {
        method: "POST",
        body: formData,
    });

    return response.ok;
}

export async function DeleteItem(itemId: string) {
    const response = await fetch(API_URL + "/v1/items/" + encodeURIComponent(itemId) + "/delete", {
        method: "POST",
    });

    return response.ok;
}