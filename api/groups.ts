import { API_URL } from "./base";

export type GroupType = {
    id: string;
    name: string;
}

// A regra do item dentro do grupo. O prazo vive aqui, e nao no produto, porque
// quem gasta o EPI e a atividade: a mesma luva dura 5 dias na eletrica e pode
// durar mais na logistica.
//
// diasValidade nulo quer dizer que o item nao vence.
export type GroupProduct = {
    produto: string;
    obrigatorio: boolean;
    diasValidade?: number | null;
}

export async function GetGroup(groupId: string) {
    const response = await fetch(API_URL + "/v1/groups/" + encodeURIComponent(groupId) + "/data", { method: "GET" });
    if (!response.ok) {
        return undefined;
    }

    const data = (await response.json()) as {
        group: GroupType;
    };

    return data.group;
}

export async function GetGroups() {
    const response = await fetch(API_URL + "/v1/groups/all", { method: "GET" });
    if (!response.ok) {
        return undefined;
    }

    const data = (await response.json()) as {
        groups: GroupType[];
    };

    return data.groups;
}

// Cria e edita usam a mesma rota (INSERT ... ON CONFLICT DO UPDATE no banco).
export async function UpdateGroup(groupId: string, name: string) {
    const formData = new FormData();
    formData.append("name", name);

    const response = await fetch(API_URL + "/v1/groups/" + encodeURIComponent(groupId) + "/create", {
        method: "POST",
        body: formData,
    });

    return response.ok;
}

export async function DeleteGroup(groupId: string) {
    const response = await fetch(API_URL + "/v1/groups/" + encodeURIComponent(groupId) + "/delete", {
        method: "POST",
    });

    return response.ok;
}

// Vincula o item ao grupo e grava a regra. A mesma rota serve para editar a
// regra de um item que ja esta no grupo (INSERT ... ON CONFLICT UPDATE no banco),
// entao a tela nao precisa saber se esta criando ou editando.
export async function SetProductInGroup(
    groupId: string,
    productId: string,
    obrigatorio: boolean,
    diasValidade?: number | null,
) {
    const formData = new FormData();
    formData.append("obrigatorio", obrigatorio ? "1" : "0");
    // Vazio e proposital: o backend le vazio como "nao vence", que e diferente
    // de zero.
    formData.append("diasValidade", diasValidade != undefined && diasValidade > 0 ? String(diasValidade) : "");

    const response = await fetch(
        API_URL + "/v1/groups/" + encodeURIComponent(groupId) + "/item/" + encodeURIComponent(productId),
        { method: "PUT", body: formData },
    );

    return response.ok;
}

export async function RemoveProductFromGroup(groupId: string, productId: string) {
    const response = await fetch(
        API_URL + "/v1/groups/" + encodeURIComponent(groupId) + "/item/" + encodeURIComponent(productId),
        { method: "DELETE" },
    );

    return response.ok;
}

export async function GetGroupProducts(groupId: string): Promise<GroupProduct[]> {
    const response = await fetch(API_URL + "/v1/groups/" + encodeURIComponent(groupId) + "/products", { method: "GET" });
    if (!response.ok) {
        return [];
    }

    // Em Go uma lista vazia vira null no JSON, nao [].
    const data = (await response.json()) as {
        products: GroupProduct[] | null;
    };

    return data.products ?? [];
}
