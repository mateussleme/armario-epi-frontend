import { API_URL } from "./base";

export type UserType = {
    id: string;
    name: string;
    admin: boolean;
    imageUri: string;
}

export async function GetUser(userId: string) {
    const response = await fetch(API_URL + "/v1/user/" + encodeURIComponent(userId) + "/data", { method: "GET" });
    if (!response.ok) {
        console.log(response)
        return undefined;
    }

    const data = (await response.json()) as {
        user: UserType;
    };

    return data.user;
}

export async function GetUsers() {
    const response = await fetch(API_URL + "/v1/user/all", { method: "GET" });
    if (!response.ok) {
        return undefined;
    }

    const data = (await response.json()) as {
        users: UserType[];
    };

    return data.users;
}

// A rota espera multipart form (ver CreateForm em v1/user/user.go), nao JSON.
// admin vai como "1" ou "0", e image e o arquivo em si, nao base64.
// Cria e edita usam a mesma rota: o banco faz INSERT ... ON CONFLICT DO UPDATE.
export async function UpdateUser(userId: string, name: string, admin: boolean, image?: File) {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("admin", admin ? "1" : "0");
    if (image != undefined) {
        formData.append("image", image);
    }

    const response = await fetch(API_URL + "/v1/user/" + encodeURIComponent(userId) + "/create", {
        method: "POST",
        body: formData,
    });

    return response.ok;
}

export async function DeleteUser(userId: string) {
    const response = await fetch(API_URL + "/v1/user/" + encodeURIComponent(userId) + "/delete", {
        method: "POST",
    });

    return response.ok;
}

export async function AddUserToGroup(userId: string, groupId: string) {
    const response = await fetch(
        API_URL + "/v1/user/" + encodeURIComponent(userId) + "/group/" + encodeURIComponent(groupId),
        { method: "PUT" },
    );

    return response.ok;
}

export async function RemoveUserFromGroup(userId: string, groupId: string) {
    const response = await fetch(
        API_URL + "/v1/user/" + encodeURIComponent(userId) + "/group/" + encodeURIComponent(groupId),
        { method: "DELETE" },
    );

    return response.ok;
}
// Marca que a pessoa levou o item. E daqui que sai a contagem do prazo de troca:
// o vencimento e contado da ultima retirada de cada pessoa, nao de uma data fixa
// do produto.
//
// origem: "armario" (retirada direta) ou "almoxarifado" (solicitacao).
export async function RegisterRetirada(userId: string, productId: string, origem: string) {
    const response = await fetch(
        API_URL + "/v1/user/" + encodeURIComponent(userId)
        + "/retirada/" + encodeURIComponent(productId)
        + "?origem=" + encodeURIComponent(origem),
        { method: "POST" },
    );

    return response.ok;
}

export type RetiradaType = {
    pessoa: string;
    produto: string;
    data: string;
    origem: string;
}

// Historico de entrega, para auditoria.
export async function GetRetiradas(userId: string, limit?: number) {
    const query = limit != undefined ? "?limit=" + String(limit) : "";
    const response = await fetch(
        API_URL + "/v1/user/" + encodeURIComponent(userId) + "/retiradas" + query,
        { method: "GET" },
    );
    if (!response.ok) {
        return [];
    }

    const data = (await response.json()) as { retiradas: RetiradaType[] | null };
    return data.retiradas ?? [];
}
