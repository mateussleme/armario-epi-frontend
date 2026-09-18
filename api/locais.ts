import { Local } from "@/types/Local";
import { API_URL } from "./base";

export async function GetLocal(id: string) {
    const response = await fetch(API_URL + "/v1/locais/" + encodeURIComponent(id) + "/data", { method: "GET" });
    if (!response.ok) {
        return undefined;
    }

    return (await response.json()).local as Local;
}

export async function GetLocais() {
    const response = await fetch(API_URL + "/v1/locais/all", { method: "GET" });
    if (!response.ok) {
        return undefined;
    }

    const data = (await response.json()) as {
        locais: Local[] | null;
    };

    // Em Go uma lista vazia vira null no JSON, nao [].
    return data.locais ?? [];
}

// So os locais disponiveis para escolha. O cadastro mostra todos, inclusive os
// desativados, mas na hora de vincular um produto so os ativos valem.
export async function GetLocaisAtivos() {
    const locais = await GetLocais();
    if (locais == undefined) {
        return undefined;
    }

    return locais.filter((l) => l.ativo);
}

// Cria e edita usam a mesma rota: o banco faz INSERT ... ON CONFLICT DO UPDATE.
export async function UpdateLocal(id: string, nome: string, tipo: string, ativo: boolean) {
    const formData = new FormData();
    formData.append("nome", nome);
    formData.append("tipo", tipo);
    formData.append("ativo", ativo ? "1" : "0");

    const response = await fetch(API_URL + "/v1/locais/" + encodeURIComponent(id) + "/create", {
        method: "POST",
        body: formData,
    });

    return response.ok;
}

// Falha quando existe produto apontando para o local (o banco recusa pela chave
// estrangeira). Nesse caso o caminho e desativar, nao excluir.
export async function DeleteLocal(id: string) {
    const response = await fetch(API_URL + "/v1/locais/" + encodeURIComponent(id) + "/delete", {
        method: "POST",
    });

    return response.ok;
}