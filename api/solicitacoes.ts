import { API_URL } from "./base";

// Status do pedido. Nomes vindos do Clairton: aberta, separando, aguardando
// retirada. Cancelada existe mas sai da lista.
export const STATUS_ABERTA = "aberta";
export const STATUS_SEPARANDO = "separando";
export const STATUS_AGUARDANDO = "aguardando_retirada";
export const STATUS_CANCELADA = "cancelada";
export const STATUS_ENTREGUE = "entregue";

export type Solicitacao = {
    id: number;
    pessoa: string;
    pessoaNome: string;
    data: string;
    // Hora limite para separar. A lista pinta a linha a partir disto.
    separarAte: string;
    status: string;
    separador: string;
    dataSeparacao: string;
    totalItens: number;
    itensSeparados: number;
}

export type SolicitacaoItem = {
    produto: string;
    nome: string;
    quantidade: number;
    // Quanto saiu de fato. Menor que quantidade quando faltou saldo no local.
    quantidadeSeparada: number;
    obrigatorio: boolean;
    separado: boolean;
    local: string;
    endereco: string;
    saldo: number;
}

export type NovoItem = {
    produto: string;
    quantidade?: number;
    obrigatorio?: boolean;
}

// Cria o pedido a partir do carrinho. Manda JSON, nao multipart como o resto do
// projeto: sao varios itens de uma vez.
export async function CreateSolicitacao(pessoa: string, itens: NovoItem[]) {
    const response = await fetch(API_URL + "/v1/solicitacoes/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            pessoa,
            itens: itens.map((item) => ({
                produto: item.produto,
                quantidade: item.quantidade ?? 1,
                obrigatorio: item.obrigatorio ?? false,
            })),
        }),
    });

    if (!response.ok) {
        return undefined;
    }

    return (await response.json()).id as number;
}

// A Lista de Separacao. Sem status traz tudo que ainda esta em aberto.
export async function GetSolicitacoes(status?: string) {
    const query = status != undefined && status != "" ? "?status=" + encodeURIComponent(status) : "";
    const response = await fetch(API_URL + "/v1/solicitacoes/all" + query, { method: "GET" });
    if (!response.ok) {
        return [];
    }

    // Em Go uma lista vazia vira null no JSON, nao [].
    const data = (await response.json()) as { solicitacoes: Solicitacao[] | null };
    return data.solicitacoes ?? [];
}

export async function GetSolicitacao(id: number) {
    const response = await fetch(API_URL + "/v1/solicitacoes/" + String(id) + "/data", { method: "GET" });
    if (!response.ok) {
        return undefined;
    }

    return (await response.json()).solicitacao as Solicitacao;
}

export async function GetSolicitacaoItens(id: number) {
    const response = await fetch(API_URL + "/v1/solicitacoes/" + String(id) + "/itens", { method: "GET" });
    if (!response.ok) {
        return [];
    }

    const data = (await response.json()) as { itens: SolicitacaoItem[] | null };
    return data.itens ?? [];
}

// Marca ou desmarca o item no picking. O status do pedido e recalculado pelo
// backend a partir disto, entao a tela nao manda status.
//
// quantidade e quanto saiu de fato; sem ela o backend assume que saiu tudo que
// foi pedido, que e o caso comum.
export async function SetItemSeparado(
    id: number,
    produto: string,
    separado: boolean,
    quantidade?: number,
    separador?: string,
) {
    const params = new URLSearchParams();
    params.set("separado", separado ? "1" : "0");
    if (quantidade != undefined && quantidade > 0) {
        params.set("quantidade", String(quantidade));
    }
    if (separador != undefined && separador != "") {
        params.set("separador", separador);
    }

    const response = await fetch(
        API_URL + "/v1/solicitacoes/" + String(id) + "/item/" + encodeURIComponent(produto) + "?" + params.toString(),
        { method: "PUT" },
    );

    return response.ok;
}

// Efetiva a entrega. pessoa e quem o reconhecimento facial identificou: o
// backend confere se e mesmo o requisitante antes de entregar.
//
// false quer dizer que a regra recusou (requisicao nao esta pronta, ou a pessoa
// reconhecida nao e a que pediu), nao que deu erro de rede.
export async function EntregarSolicitacao(id: number, pessoa: string) {
    const response = await fetch(
        API_URL + "/v1/solicitacoes/" + String(id) + "/entregar?pessoa=" + encodeURIComponent(pessoa),
        { method: "POST" },
    );

    return response.ok;
}

// Cancelamento pelo solicitante. O backend recusa se o pedido nao for da pessoa
// ou se a separacao ja comecou, entao a tela nao precisa checar isso: basta
// mostrar o resultado.
//
// false aqui quer dizer "nao pode mais", nao "deu erro".
export async function CancelSolicitacao(id: number, pessoa: string) {
    const response = await fetch(
        API_URL + "/v1/solicitacoes/" + String(id) + "/cancel?pessoa=" + encodeURIComponent(pessoa),
        { method: "POST" },
    );

    return response.ok;
}

export function statusLabel(status: string) {
    if (status == STATUS_ABERTA) {
        return "Aberta";
    }
    if (status == STATUS_SEPARANDO) {
        return "Separando";
    }
    if (status == STATUS_AGUARDANDO) {
        return "Aguardando retirada";
    }
    if (status == STATUS_CANCELADA) {
        return "Cancelada";
    }
    if (status == STATUS_ENTREGUE) {
        return "Entregue";
    }
    return status;
}
