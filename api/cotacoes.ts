"use client"

// Modulo de cotacoes, no formato do modulo de compras do TopSisErp (telas que o
// Clairton mandou). Por enquanto TUDO aqui e mockado no navegador: nao existe
// tabela de fornecedor nem de cotacao no banco. Quando o backend existir, e so
// trocar o corpo destas funcoes por fetch, como api/solicitacoes.ts faz.
//
// Os nomes dos campos sao os das telas dele de proposito: e o que vai virar
// coluna. O estado e copiado para o sessionStorage para o F5 no meio da
// demonstracao nao apagar a cotacao recem montada.
//
// Cuidado com a palavra requisicao: aqui ela e a REQUISICAO DE COMPRA, que pede
// item ao setor de compras. No armario, requisicao e o pedido de EPI do
// funcionario (api/solicitacoes.ts). Sao coisas diferentes.

// Status da cotacao. A letra e o que aparece no campo da tela dele.
export const STATUS_ABERTA = "A";
export const STATUS_PENDENTE = "P";
export const STATUS_FECHADA = "F";

export const STATUS_COTACAO = [
    { value: STATUS_ABERTA, label: "Aberta" },
    { value: STATUS_PENDENTE, label: "Pendente" },
    { value: STATUS_FECHADA, label: "Fechada" },
];

export function statusLabel(status: string) {
    return STATUS_COTACAO.find((s) => s.value == status)?.label ?? status;
}

export const FRETE_CIF = 0;
export const FRETE_FOB = 1;

export const TIPOS_FRETE = [
    { value: String(FRETE_CIF), label: "CIF (fornecedor entrega)" },
    { value: String(FRETE_FOB), label: "FOB (a cargo do comprador)" },
];

// Linha da requisicao de compra esperando cotacao. E a tela "Consulta
// Requisicoes": uma linha por item de requisicao.
export type RequisicaoItem = {
    id: number;
    requisicao: string;
    empresa: string;
    numeroItem: number;
    produto: string;
    descricao: string;
    complemento: string;
    quantidade: number;
    unidade: string;
    // Valor unitario da ultima compra. Serve de referencia na hora de cotar.
    valorUltimaCompra: number;
    // Quem vendeu da ultima vez. O botao "Carregar fornecedor da ultima compra"
    // usa isto para ja marcar os fornecedores.
    fornecedorUltimaCompra?: string;
    conta: string;
    nomeConta: string;
    centroCusto: string;
    descricaoCentroCusto: string;
    // Quem pediu. Vai junto ate o pedido de compra, como na tela dele.
    solicitante: string;
    data: string;
    // Sai da fila quando entra numa cotacao.
    cotada: boolean;
};

export type Fornecedor = {
    // Codigo curto, como na tela dele: GAL, VIK, 312.
    codigo: string;
    razaoSocial: string;
    cnpj: string;
    inscricaoEstadual: string;
    endereco: string;
    numero: string;
    cidade: string;
    estado: string;
    cep: string;
    telefone: string;
    contato: string;
    email: string;
    // Vao para o cabecalho do pedido quando ele e gerado.
    condicaoPagamento: string;
    transportadora: string;
};

// Item dentro da cotacao. Guarda de qual requisicao veio: uma linha agrupada
// pode vir de mais de uma.
export type CotacaoItem = {
    id: number;
    numeroItem: number;
    produto: string;
    descricao: string;
    complemento: string;
    quantidade: number;
    unidade: string;
    conta: string;
    nomeConta: string;
    centroCusto: string;
    descricaoCentroCusto: string;
    // Quem pediu. Numa linha agrupada, os solicitantes das requisicoes que
    // entraram nela.
    solicitantes: string[];
    origens: string[];
};

// Os valores de um item para um fornecedor. E a linha da planilha que ele
// exporta: uma por item e fornecedor.
export type CotacaoFornecedorItem = {
    item: number;
    vencedor: boolean;
    valorUnitario: number;
    ipi: number;
    icms: number;
    pis: number;
    cofins: number;
    icmsSt: number;
    difal: number;
    fatorImpostos: number;
    leadTimeItem: number;
    leadTimeTransporte: number;
    fabricante: string;
    // Numero da linha na planilha exportada, so para conferencia.
    idRegistro: number;
};

// O fornecedor dentro da cotacao, com o que vale para a proposta inteira.
export type CotacaoFornecedor = {
    fornecedor: string;
    // Ate quando a proposta vale. aaaa-mm-dd, para caber no input de data.
    validade: string;
    numeroCotacaoFornecedor: string;
    condicaoPagamento: string;
    // Fornecedor que ainda nao esta cadastrado entra so pelo nome.
    razaoSocialSemCadastro: string;
    tipoFrete: number;
    freteFornecedor: number;
    freteMk: number;
    desconto: number;
    itens: CotacaoFornecedorItem[];
};

export type Cotacao = {
    id: number;
    // Numero visivel. No ERP dele e sequencia por empresa.
    numero: string;
    // Codigo interno, separado do numero, como o CODCOTACAO da tela.
    codCotacao: string;
    empresa: string;
    status: string;
    criacao: string;
    usuario: string;
    observacao: string;
    codigoSolicitacao: string;
    aprovadorTecnico: string;
    aprovadorComercial: string;
    observacaoAprovacao: string;
    itens: CotacaoItem[];
    fornecedores: CotacaoFornecedor[];
    // Gerar e o passo que mescla itens com fornecedores e cria as linhas de
    // valor. Antes disso a cotacao e so as duas listas.
    gerada: boolean;
};

type Store = {
    estoque: ProdutoEstoque[];
    requisicoes: RequisicaoItem[];
    fornecedores: Fornecedor[];
    cotacoes: Cotacao[];
    pedidos: Pedido[];
    proximaRequisicao: number;
    proximaCotacao: number;
    proximoItem: number;
    proximoRegistro: number;
    proximoPedido: number;
    proximaReposicao: number;
};

export const EMPRESA_PADRAO = "Planta Q. Barras";

// Fornecedores das telas do Clairton. Continuam fixos ate ele mandar a lista
// real da Clairton.
const FORNECEDORES: Fornecedor[] = [
    {
        codigo: "GAL", razaoSocial: "GALE FERRAMENTAS LTDA",
        cnpj: "11.222.333/0001-44", inscricaoEstadual: "90123456-78",
        endereco: "Rua das Ferramentas", numero: "1200",
        cidade: "Curitiba", estado: "PR", cep: "81000-000",
        telefone: "(41) 3000-1000", contato: "Ricardo", email: "vendas@galeferramentas.com.br",
        condicaoPagamento: "28 dias", transportadora: "FORNECEDOR",
    },
    {
        codigo: "VIK", razaoSocial: "SANDVIK COROMANT DO BRASIL INDUSTRIA E COMERCIO DE FERRAMENTAS LTDA",
        cnpj: "22.333.444/0001-55", inscricaoEstadual: "10234567-89",
        endereco: "Avenida Industrial", numero: "455",
        cidade: "São Paulo", estado: "SP", cep: "04500-000",
        telefone: "(11) 4000-2000", contato: "Fernanda", email: "pedidos@sandvik.com.br",
        condicaoPagamento: "35 dias", transportadora: "FORNECEDOR",
    },
    {
        codigo: "312", razaoSocial: "FF SOUZA COMERCIO LTDA",
        cnpj: "33.444.555/0001-66", inscricaoEstadual: "20345678-90",
        endereco: "Rua do Comércio", numero: "87",
        cidade: "Uberaba", estado: "MG", cep: "38000-000",
        telefone: "(34) 3300-4400", contato: "Souza", email: "contato@ffsouza.com.br",
        condicaoPagamento: "À vista", transportadora: "CIF",
    },
];

const CONTA_FERRAMENTAS = { conta: "4901", nomeConta: "FERRAMENTAS PARA DESENVOLVIMENTO" };

// Linhas da tela "Consulta Requisicoes" que ele mandou, na mesma ordem. Vale a
// pena ser fiel: ele reconhece a tela de imediato.
function requisicoesIniciais(): RequisicaoItem[] {
    const agora = Date.now();
    const dia = 24 * 60 * 60 * 1000;

    const linhas: [string, number, string, string, number, string, number, string | undefined][] = [
        ["161354", 1, "02990315", "CABO PP 4X 10 MM", 50, "PC", 18.21, "312"],
        ["161361", 1, "02620195", "JAQUETA MASCULINA AZUL MARINHO TECIDO BRIM TAMANHO PP", 1, "UN", 65.8, undefined],
        ["161361", 2, "03726156", "SENSOR MAGNÉTICO LINEAL CABLE L =4mt", 4, "PÇ", 1150.8, undefined],
        ["161361", 3, "03735065", "FLEJE ACERO (INOXIDABLE)", 5, "PÇ", 0, undefined],
        ["161361", 4, "03726157", "CINTA MAGNÉTICA 60cm", 4, "PÇ", 0, undefined],
        ["161361", 5, "03726158", "CINTA MAGNÉTICA 90cm", 5, "PÇ", 0, undefined],
        ["161371", 1, "05990231", "MANTA CERÂMICA 1260ºC 7620x610x25MM DENS.96KG/M3 CX C/ 4,65mt", 27.9, "M", 23.059857, undefined],
        ["161381", 1, "02630002", "Cartucho de Tinta HP 122 XL Preto", 4, "UNI", 105, "312"],
        ["161411", 1, "05280498", "CONE MAS BT30-F-022-040-063", 1, "PC", 248, "VIK"],
        ["161411", 2, "05280467", "CONE MAS BT30-M-028-050-051", 1, "PC", 216.6, "VIK"],
        ["161421", 1, "66666685", "SERVIÇO DE CALIBRAÇÃO DE INSTRUMENTO E MAQUINA", 1, "PC", 4000, undefined],
        ["161435", 1, "05994621", "GRANALHA S-70", 400, "PC", 2.7, undefined],
        ["161442", 1, "05511871", "PN 434-2 417 HASTE", 1, "PC", 112, undefined],
        ["161470", 1, "10880035", "LIQUIDAÇÃO FINANCEIRA DOS VALORES DECORRENTES DA CONTABILIZAÇÃO RELATIVA ÀS OPERAÇÕES REALIZADAS NA CAMARA DE COMERCIALIZAÇÃO DE ENERGIA ELETRICA - CCEE", 1, "UN", 1323.51, undefined],
        ["161478", 1, "05511841", "PN 797/1-2-3 126", 3, "PÇ", 118, undefined],
        ["161478", 2, "05511842", "PN 797/1-2-3 146", 6, "PÇ", 140, undefined],
        // Os quatro itens da cotacao 16889 dele, para dar para reproduzir aquela
        // cotacao inteira, com GALE e SANDVIK, e comparar com a planilha.
        ["161490", 1, "99999999", "REBAIXADOR 3C.18.0X25XH10MM", 1, "PÇ", 0, "GAL"],
        ["161490", 2, "99999999", "MANDRIL 930-B30-P-10-138", 1, "PÇ", 0, "VIK"],
        ["161490", 3, "99999999", "INS. TCGX 06 T1 04-AL H10", 10, "PÇ", 0, "VIK"],
        ["161490", 4, "99999999", "PARAF. 5513 020-28", 3, "PÇ", 0, "GAL"],
    ];

    // Solicitantes de exemplo, como aparecem na tela de pedidos dele.
    const solicitantes = ["ALMOX.COMPRAS", "ATHOS.JANNUZZI", "MANUTENCAO"];

    return linhas.map((linha, indice) => {
        const [requisicao, numeroItem, produto, descricao, quantidade, unidade, valor, fornecedor] = linha;
        const ferramenta = requisicao == "161490";

        return {
            id: indice + 1,
            requisicao,
            empresa: EMPRESA_PADRAO,
            numeroItem,
            produto,
            descricao,
            complemento: "",
            quantidade,
            unidade,
            valorUltimaCompra: valor,
            fornecedorUltimaCompra: fornecedor,
            conta: ferramenta ? CONTA_FERRAMENTAS.conta : "",
            nomeConta: ferramenta ? CONTA_FERRAMENTAS.nomeConta : "",
            centroCusto: ferramenta ? "1516" : "",
            descricaoCentroCusto: ferramenta ? "FERRAMENTARIA" : "",
            solicitante: solicitantes[indice % solicitantes.length],
            data: new Date(agora - (linhas.length - indice) * dia).toISOString(),
            cotada: false,
        };
    });
}

// ---------------------------------------------------------------------------
// Estoque e ponto de pedido
// ---------------------------------------------------------------------------
//
// A outra porta de entrada da reposicao: quando a saida de estoque derruba o
// saldo ate o ponto de pedido, o item entra sozinho na lista a cotar. Se o item
// tem fornecedor exclusivo, nem passa por cotacao: vira pedido de compra direto.
//
// No sistema de verdade quem chama a baixa e a retirada do armario e a entrega
// da requisicao. Aqui a tela de Estoque faz isso na mao, para dar para
// demonstrar a regra sem esperar alguem retirar EPI.

export type ProdutoEstoque = {
    codigo: string;
    descricao: string;
    unidade: string;
    saldo: number;
    // Saldo que dispara a reposicao.
    pontoPedido: number;
    // Quanto comprar quando dispara.
    loteReposicao: number;
    fornecedorPrincipal?: string;
    // Fornecedor unico do item: nao ha o que cotar, entao a baixa gera pedido.
    exclusivo: boolean;
    ultimoValor: number;
};

function estoqueInicial(): ProdutoEstoque[] {
    return [
        {
            codigo: "02990315", descricao: "CABO PP 4X 10 MM", unidade: "PC",
            saldo: 120, pontoPedido: 50, loteReposicao: 200,
            fornecedorPrincipal: "312", exclusivo: true, ultimoValor: 18.21,
        },
        {
            codigo: "02630002", descricao: "Cartucho de Tinta HP 122 XL Preto", unidade: "UNI",
            saldo: 12, pontoPedido: 6, loteReposicao: 20,
            fornecedorPrincipal: "312", exclusivo: false, ultimoValor: 105,
        },
        {
            codigo: "05994621", descricao: "GRANALHA S-70", unidade: "PC",
            saldo: 800, pontoPedido: 400, loteReposicao: 1000,
            fornecedorPrincipal: "GAL", exclusivo: false, ultimoValor: 2.7,
        },
        {
            codigo: "05280498", descricao: "CONE MAS BT30-F-022-040-063", unidade: "PC",
            saldo: 8, pontoPedido: 4, loteReposicao: 10,
            fornecedorPrincipal: "VIK", exclusivo: true, ultimoValor: 248,
        },
        {
            codigo: "05511841", descricao: "PN 797/1-2-3 126", unidade: "PÇ",
            saldo: 30, pontoPedido: 15, loteReposicao: 40,
            fornecedorPrincipal: undefined, exclusivo: false, ultimoValor: 118,
        },
        {
            codigo: "03726157", descricao: "CINTA MAGNÉTICA 60cm", unidade: "PÇ",
            saldo: 10, pontoPedido: 8, loteReposicao: 20,
            fornecedorPrincipal: "GAL", exclusivo: false, ultimoValor: 0,
        },
    ];
}

const CHAVE = "cotacoes-mock-v5";

let store: Store | undefined = undefined;

function inicial(): Store {
    const requisicoes = requisicoesIniciais();
    return {
        estoque: estoqueInicial(),
        requisicoes,
        fornecedores: FORNECEDORES,
        cotacoes: [],
        pedidos: [],
        proximaRequisicao: requisicoes.length + 1,
        proximaCotacao: 1,
        proximoItem: 1,
        // Comeca perto do numero da planilha dele so para parecer com o real.
        proximoRegistro: 94244,
        proximoPedido: 1,
        proximaReposicao: 1,
    };
}

function carregar(): Store {
    if (store != undefined) {
        return store;
    }

    // sessionStorage pode estar bloqueado (aba privada, politica do navegador),
    // entao a leitura nunca pode derrubar a tela.
    try {
        const salvo = sessionStorage.getItem(CHAVE);
        if (salvo != null) {
            store = JSON.parse(salvo) as Store;
            // Fornecedor nao e editavel na demonstracao: vem sempre da lista
            // fixa, para nao ficar preso a um sessionStorage antigo.
            store.fornecedores = FORNECEDORES;
            // Store gravado por uma versao anterior nao tem pedidos nem
            // estoque.
            store.pedidos = store.pedidos ?? [];
            store.proximoPedido = store.proximoPedido ?? 1;
            store.estoque = store.estoque ?? estoqueInicial();
            store.proximaReposicao = store.proximaReposicao ?? 1;
            return store;
        }
    } catch {
        // segue com o estado inicial
    }

    store = inicial();
    return store;
}

function salvar() {
    try {
        sessionStorage.setItem(CHAVE, JSON.stringify(carregar()));
    } catch {
        // sem persistencia: vale enquanto a aba nao recarregar
    }
}

// Copia rasa para o React enxergar mudanca de referencia. Sem isso o useState
// recebe o mesmo array e nao re-renderiza.
function copia<T>(itens: T[]): T[] {
    return itens.map((item) => ({ ...item }));
}

export function ListFornecedores(): Fornecedor[] {
    return copia(carregar().fornecedores);
}

export function FornecedorNome(codigo: string): string {
    return carregar().fornecedores.find((f) => f.codigo == codigo)?.razaoSocial ?? codigo;
}

// Como aparece na planilha exportada: codigo e razao social juntos.
export function FornecedorCompleto(codigo: string): string {
    const fornecedor = carregar().fornecedores.find((f) => f.codigo == codigo);
    return fornecedor != undefined ? fornecedor.codigo + " " + fornecedor.razaoSocial : codigo;
}

// A fila de itens a cotar: o que ainda nao entrou em cotacao.
export function ListRequisicoes(): RequisicaoItem[] {
    return copia(carregar().requisicoes.filter((r) => !r.cotada));
}

export function AddRequisicao(dados: {
    requisicao: string;
    produto: string;
    descricao: string;
    quantidade: number;
    unidade: string;
    fornecedorUltimaCompra?: string;
}): RequisicaoItem {
    const s = carregar();
    // Numero do item dentro da requisicao: continua de onde parou quando a
    // requisicao ja existe.
    const numeroItem = s.requisicoes.filter((r) => r.requisicao == dados.requisicao).length + 1;

    const linha: RequisicaoItem = {
        id: s.proximaRequisicao,
        requisicao: dados.requisicao,
        empresa: EMPRESA_PADRAO,
        numeroItem,
        produto: dados.produto,
        descricao: dados.descricao,
        complemento: "",
        quantidade: dados.quantidade,
        unidade: dados.unidade,
        valorUltimaCompra: 0,
        fornecedorUltimaCompra: dados.fornecedorUltimaCompra,
        conta: "",
        nomeConta: "",
        centroCusto: "",
        descricaoCentroCusto: "",
        solicitante: "ALMOX.COMPRAS",
        data: new Date().toISOString(),
        cotada: false,
    };

    s.proximaRequisicao = s.proximaRequisicao + 1;
    s.requisicoes.push(linha);
    salvar();
    return linha;
}

export function RemoveRequisicao(id: number) {
    const s = carregar();
    s.requisicoes = s.requisicoes.filter((r) => r.id != id);
    salvar();
}

// Agrupar item: junta as linhas do mesmo produto, somando a quantidade. As
// requisicoes de origem ficam registradas na linha agrupada.
export type LinhaACotar = {
    // Ids das linhas de requisicao que entraram nesta linha.
    ids: number[];
    solicitantes: string[];
    produto: string;
    descricao: string;
    quantidade: number;
    unidade: string;
    valorUltimaCompra: number;
    fornecedorUltimaCompra?: string;
    origens: string[];
    empresa: string;
    conta: string;
    nomeConta: string;
    centroCusto: string;
    descricaoCentroCusto: string;
};

function paraLinha(item: RequisicaoItem): LinhaACotar {
    return {
        ids: [item.id],
        solicitantes: [item.solicitante],
        produto: item.produto,
        descricao: item.descricao,
        quantidade: item.quantidade,
        unidade: item.unidade,
        valorUltimaCompra: item.valorUltimaCompra,
        fornecedorUltimaCompra: item.fornecedorUltimaCompra,
        origens: [item.requisicao + "/" + String(item.numeroItem)],
        empresa: item.empresa,
        conta: item.conta,
        nomeConta: item.nomeConta,
        centroCusto: item.centroCusto,
        descricaoCentroCusto: item.descricaoCentroCusto,
    };
}

export function Agrupar(itens: RequisicaoItem[], agrupar: boolean): LinhaACotar[] {
    if (!agrupar) {
        return itens.map(paraLinha);
    }

    const agrupadas: LinhaACotar[] = [];
    for (const item of itens) {
        // Produto 99999999 e item sem cadastro no ERP dele: agrupar por codigo
        // juntaria coisas diferentes, entao a descricao entra na chave.
        const igual = agrupadas.find((linha) => linha.produto == item.produto && linha.descricao == item.descricao);
        if (igual == undefined) {
            agrupadas.push(paraLinha(item));
            continue;
        }

        igual.ids.push(item.id);
        igual.quantidade = igual.quantidade + item.quantidade;
        igual.origens.push(item.requisicao + "/" + String(item.numeroItem));
        if (!igual.solicitantes.includes(item.solicitante)) {
            igual.solicitantes.push(item.solicitante);
        }
        if (igual.fornecedorUltimaCompra == undefined) {
            igual.fornecedorUltimaCompra = item.fornecedorUltimaCompra;
        }
    }

    return agrupadas;
}

// Monta a cotacao: cabecalho, itens e fornecedores escolhidos, ainda sem os
// valores.
export function CriarCotacao(linhas: LinhaACotar[], fornecedores: string[], usuario: string): Cotacao {
    const s = carregar();

    const itens: CotacaoItem[] = linhas.map((linha, indice) => {
        const item: CotacaoItem = {
            id: s.proximoItem + indice,
            numeroItem: indice + 1,
            produto: linha.produto,
            descricao: linha.descricao,
            complemento: "",
            quantidade: linha.quantidade,
            unidade: linha.unidade,
            conta: linha.conta,
            nomeConta: linha.nomeConta,
            centroCusto: linha.centroCusto,
            descricaoCentroCusto: linha.descricaoCentroCusto,
            solicitantes: linha.solicitantes,
            origens: linha.origens,
        };
        return item;
    });

    const cotacao: Cotacao = {
        id: s.proximaCotacao,
        numero: String(16888 + s.proximaCotacao),
        codCotacao: String(152460 + s.proximaCotacao),
        empresa: linhas[0]?.empresa ?? EMPRESA_PADRAO,
        status: STATUS_ABERTA,
        criacao: new Date().toISOString(),
        usuario: usuario != "" ? usuario : "ALMOXARIFADO",
        observacao: "",
        codigoSolicitacao: String(11875 + s.proximaCotacao),
        aprovadorTecnico: "",
        aprovadorComercial: "",
        observacaoAprovacao: "",
        itens,
        fornecedores: fornecedores.map((codigo) => novoFornecedor(codigo)),
        gerada: false,
    };

    const usados = linhas.flatMap((linha) => linha.ids);
    for (const requisicao of s.requisicoes) {
        if (usados.includes(requisicao.id)) {
            requisicao.cotada = true;
        }
    }

    s.proximoItem = s.proximoItem + itens.length;
    s.proximaCotacao = s.proximaCotacao + 1;
    s.cotacoes.push(cotacao);
    salvar();
    return cotacao;
}

function novoFornecedor(codigo: string): CotacaoFornecedor {
    return {
        fornecedor: codigo,
        validade: "",
        numeroCotacaoFornecedor: "",
        condicaoPagamento: "",
        razaoSocialSemCadastro: "",
        tipoFrete: FRETE_CIF,
        freteFornecedor: 0,
        freteMk: 0,
        desconto: 0,
        itens: [],
    };
}

export function ListCotacoes(): Cotacao[] {
    // Mais recente primeiro: e a que a pessoa acabou de montar.
    return carregar().cotacoes.map(clonar).reverse();
}

export function GetCotacao(id: number): Cotacao | undefined {
    const cotacao = carregar().cotacoes.find((c) => c.id == id);
    return cotacao != undefined ? clonar(cotacao) : undefined;
}

function clonar(cotacao: Cotacao): Cotacao {
    return {
        ...cotacao,
        itens: cotacao.itens.map((i) => ({ ...i, origens: [...i.origens], solicitantes: [...i.solicitantes] })),
        fornecedores: cotacao.fornecedores.map((f) => ({ ...f, itens: copia(f.itens) })),
    };
}

function achar(id: number): Cotacao | undefined {
    return carregar().cotacoes.find((c) => c.id == id);
}

export function SetCabecalho(id: number, dados: Partial<Cotacao>) {
    const cotacao = achar(id);
    if (cotacao == undefined) {
        return;
    }

    Object.assign(cotacao, dados);
    salvar();
}

export function SetQuantidadeItem(cotacaoId: number, itemId: number, quantidade: number) {
    const item = achar(cotacaoId)?.itens.find((i) => i.id == itemId);
    if (item == undefined) {
        return;
    }

    item.quantidade = quantidade;
    salvar();
}

export function RemoveItem(cotacaoId: number, itemId: number) {
    const cotacao = achar(cotacaoId);
    if (cotacao == undefined) {
        return;
    }

    cotacao.itens = cotacao.itens.filter((i) => i.id != itemId);
    for (const fornecedor of cotacao.fornecedores) {
        fornecedor.itens = fornecedor.itens.filter((i) => i.item != itemId);
    }
    salvar();
}

export function AddFornecedor(cotacaoId: number, codigo: string) {
    const cotacao = achar(cotacaoId);
    if (cotacao == undefined || cotacao.fornecedores.some((f) => f.fornecedor == codigo)) {
        return;
    }

    cotacao.fornecedores.push(novoFornecedor(codigo));
    // Cotacao ja gerada: o fornecedor novo precisa das linhas de valor, senao
    // fica sem onde preencher.
    if (cotacao.gerada) {
        GerarCotacao(cotacaoId);
        return;
    }
    salvar();
}

export function RemoveFornecedor(cotacaoId: number, codigo: string) {
    const cotacao = achar(cotacaoId);
    if (cotacao == undefined) {
        return;
    }

    cotacao.fornecedores = cotacao.fornecedores.filter((f) => f.fornecedor != codigo);
    salvar();
}

// Gerar Cotacao: mescla itens e fornecedores, criando uma linha de valor por
// item para cada fornecedor. E o que a planilha exporta e o que habilita a tela
// de entrada de valores. Aberta passa a Pendente.
export function GerarCotacao(cotacaoId: number) {
    const s = carregar();
    const cotacao = achar(cotacaoId);
    if (cotacao == undefined) {
        return;
    }

    for (const fornecedor of cotacao.fornecedores) {
        const existentes = fornecedor.itens;
        fornecedor.itens = cotacao.itens.map((item) => {
            // Regerar nao pode zerar o que ja foi preenchido.
            const anterior = existentes.find((i) => i.item == item.id);
            if (anterior != undefined) {
                return anterior;
            }

            const registro = s.proximoRegistro;
            s.proximoRegistro = s.proximoRegistro + 1;

            return {
                item: item.id,
                vencedor: false,
                valorUnitario: 0,
                ipi: 0,
                icms: 0,
                pis: 0,
                cofins: 0,
                icmsSt: 0,
                difal: 0,
                fatorImpostos: 0,
                leadTimeItem: 0,
                leadTimeTransporte: 0,
                fabricante: "",
                idRegistro: registro,
            };
        });
    }

    cotacao.gerada = true;
    if (cotacao.status == STATUS_ABERTA) {
        cotacao.status = STATUS_PENDENTE;
    }
    salvar();
}

export function SetStatus(cotacaoId: number, status: string) {
    const cotacao = achar(cotacaoId);
    if (cotacao == undefined) {
        return;
    }

    cotacao.status = status;
    salvar();
}

// Limpa Valores: apaga o que foi preenchido, mantendo as linhas.
export function LimpaValores(cotacaoId: number) {
    const cotacao = achar(cotacaoId);
    if (cotacao == undefined) {
        return;
    }

    for (const fornecedor of cotacao.fornecedores) {
        fornecedor.freteFornecedor = 0;
        fornecedor.freteMk = 0;
        fornecedor.desconto = 0;
        for (const item of fornecedor.itens) {
            item.vencedor = false;
            item.valorUnitario = 0;
            item.ipi = 0;
            item.icms = 0;
            item.pis = 0;
            item.cofins = 0;
            item.icmsSt = 0;
            item.difal = 0;
            item.fatorImpostos = 0;
            item.leadTimeItem = 0;
            item.leadTimeTransporte = 0;
            item.fabricante = "";
        }
    }
    salvar();
}

export function SetDadosFornecedor(cotacaoId: number, codigo: string, dados: Partial<CotacaoFornecedor>) {
    const fornecedor = achar(cotacaoId)?.fornecedores.find((f) => f.fornecedor == codigo);
    if (fornecedor == undefined) {
        return;
    }

    Object.assign(fornecedor, dados);
    salvar();
}

export function SetValorItem(
    cotacaoId: number,
    codigo: string,
    itemId: number,
    dados: Partial<CotacaoFornecedorItem>,
) {
    const item = achar(cotacaoId)
        ?.fornecedores.find((f) => f.fornecedor == codigo)
        ?.itens.find((i) => i.item == itemId);
    if (item == undefined) {
        return;
    }

    Object.assign(item, dados);
    salvar();
}

// Vencedor e por item: um item so pode ter um fornecedor vencedor, entao marcar
// num fornecedor desmarca nos outros. E daqui que sai o pedido de compra.
export function SetVencedor(cotacaoId: number, codigo: string, itemId: number, vencedor: boolean) {
    const cotacao = achar(cotacaoId);
    if (cotacao == undefined) {
        return;
    }

    for (const fornecedor of cotacao.fornecedores) {
        const linha = fornecedor.itens.find((i) => i.item == itemId);
        if (linha == undefined) {
            continue;
        }

        linha.vencedor = vencedor && fornecedor.fornecedor == codigo;
    }
    salvar();
}

// Vencedor pelo fornecedor inteiro: marca todos os itens dele de uma vez, e
// cada item marcado sai dos outros fornecedores. E a segunda forma que o
// Clairton pediu, ao lado da marcacao item a item.
//
// Item sem preco fica de fora: nao da para comprar de quem nao cotou.
export function SetVencedorFornecedor(cotacaoId: number, codigo: string, vencedor: boolean) {
    const cotacao = achar(cotacaoId);
    const alvo = cotacao?.fornecedores.find((f) => f.fornecedor == codigo);
    if (cotacao == undefined || alvo == undefined) {
        return;
    }

    for (const linha of alvo.itens) {
        if (vencedor && linha.valorUnitario <= 0) {
            continue;
        }

        for (const fornecedor of cotacao.fornecedores) {
            const outra = fornecedor.itens.find((i) => i.item == linha.item);
            if (outra != undefined) {
                outra.vencedor = vencedor && fornecedor.fornecedor == codigo;
            }
        }
    }
    salvar();
}

// Quantos itens o fornecedor esta vencendo. A tela usa para mostrar o resumo
// antes de gerar os pedidos.
export function ItensVencidos(cotacao: Cotacao, codigo: string): number {
    const fornecedor = cotacao.fornecedores.find((f) => f.fornecedor == codigo);
    return fornecedor != undefined ? fornecedor.itens.filter((i) => i.vencedor).length : 0;
}

// Itens da cotacao que ainda nao tem fornecedor vencedor. Enquanto houver, a
// geracao de pedidos deixa esses itens de fora.
export function ItensSemVencedor(cotacao: Cotacao): number {
    return cotacao.itens.filter(
        (item) => !cotacao.fornecedores.some(
            (f) => f.itens.some((i) => i.item == item.id && i.vencedor),
        ),
    ).length;
}

export function QuantidadeDoItem(cotacao: Cotacao, itemId: number): number {
    return cotacao.itens.find((i) => i.id == itemId)?.quantidade ?? 0;
}

// Valor total da linha, como na coluna "Valor Total" da planilha: unitario
// vezes quantidade, sem impostos.
export function ValorTotalItem(cotacao: Cotacao, linha: CotacaoFornecedorItem): number {
    return linha.valorUnitario * QuantidadeDoItem(cotacao, linha.item);
}

// Impostos que somam ao custo. ICMS, PIS e COFINS normalmente sao recuperaveis
// e por isso entram como informacao, sem somar. Confirmar com o Clairton se na
// Clairton e assim.
export function ImpostosItem(cotacao: Cotacao, linha: CotacaoFornecedorItem): number {
    const total = ValorTotalItem(cotacao, linha);
    return total * (linha.ipi + linha.fatorImpostos) / 100 + linha.icmsSt + linha.difal;
}

// Unitario com impostos, que e a coluna "Unitário c/" da tela de entrada de
// valores.
export function UnitarioComImpostos(cotacao: Cotacao, linha: CotacaoFornecedorItem): number {
    const quantidade = QuantidadeDoItem(cotacao, linha.item);
    if (quantidade <= 0) {
        return 0;
    }

    return (ValorTotalItem(cotacao, linha) + ImpostosItem(cotacao, linha)) / quantidade;
}

export type TotaisFornecedor = {
    produtos: number;
    impostos: number;
    ipi: number;
    icms: number;
    icmsSt: number;
    desconto: number;
    frete: number;
    total: number;
    semValor: number;
    // Maior leadtime somado ao transporte: e o prazo que o fornecedor entrega
    // tudo.
    prazo: number;
};

export function Totais(cotacao: Cotacao, codigo: string): TotaisFornecedor {
    const vazio: TotaisFornecedor = {
        produtos: 0, impostos: 0, ipi: 0, icms: 0, icmsSt: 0,
        desconto: 0, frete: 0, total: 0, semValor: cotacao.itens.length, prazo: 0,
    };

    const fornecedor = cotacao.fornecedores.find((f) => f.fornecedor == codigo);
    if (fornecedor == undefined) {
        return vazio;
    }

    const totais: TotaisFornecedor = { ...vazio, semValor: 0 };
    for (const linha of fornecedor.itens) {
        const total = ValorTotalItem(cotacao, linha);
        totais.produtos = totais.produtos + total;
        totais.impostos = totais.impostos + ImpostosItem(cotacao, linha);
        totais.ipi = totais.ipi + total * linha.ipi / 100;
        totais.icms = totais.icms + total * linha.icms / 100;
        totais.icmsSt = totais.icmsSt + linha.icmsSt;
        if (linha.valorUnitario <= 0) {
            totais.semValor = totais.semValor + 1;
        }

        const prazo = linha.leadTimeItem + linha.leadTimeTransporte;
        if (prazo > totais.prazo) {
            totais.prazo = prazo;
        }
    }

    totais.desconto = fornecedor.desconto;
    totais.frete = fornecedor.freteFornecedor + fornecedor.freteMk;
    totais.total = totais.produtos + totais.impostos + totais.frete - totais.desconto;
    return totais;
}

export function ItensSemValor(cotacao: Cotacao, codigo: string): number {
    return Totais(cotacao, codigo).semValor;
}

// ---------------------------------------------------------------------------
// Pedido de compra
// ---------------------------------------------------------------------------
//
// Depois que os vencedores estao definidos, a cotacao gera os pedidos. Um
// pedido por fornecedor, porque compra se faz com um fornecedor de cada vez:
// uma cotacao com dois vencedores vira dois pedidos.
//
// Os status sao um chute ate a tela de referencia dele chegar: aberto (gerado,
// ainda nao enviado), emitido (mandado para o fornecedor) e cancelado.

export const STATUS_PEDIDO_ABERTO = "A";
export const STATUS_PEDIDO_EMITIDO = "E";
export const STATUS_PEDIDO_CANCELADO = "C";

export const STATUS_PEDIDO = [
    { value: STATUS_PEDIDO_ABERTO, label: "Aberto" },
    { value: STATUS_PEDIDO_EMITIDO, label: "Emitido" },
    { value: STATUS_PEDIDO_CANCELADO, label: "Cancelado" },
];

export function statusPedidoLabel(status: string) {
    return STATUS_PEDIDO.find((s) => s.value == status)?.label ?? status;
}

// O item do pedido nasce da linha vencedora da cotacao, com o preco e os
// impostos ja congelados: mexer na cotacao depois nao muda o pedido.
export type PedidoItem = {
    id: number;
    numeroItem: number;
    produto: string;
    descricao: string;
    complemento: string;
    quantidade: number;
    unidade: string;
    valorUnitario: number;
    ipi: number;
    icms: number;
    pis: number;
    cofins: number;
    icmsSt: number;
    difal: number;
    fatorImpostos: number;
    leadTimeItem: number;
    leadTimeTransporte: number;
    fabricante: string;
    conta: string;
    nomeConta: string;
    centroCusto: string;
    descricaoCentroCusto: string;
    // Quem pediu e quem comprou, como nas duas primeiras colunas do grid dele.
    solicitante: string;
    comprador: string;
    // Controle do envio ao fornecedor, tambem colunas da tela dele.
    enviado: boolean;
    impresso: boolean;
    // Quanto ja foi recebido. O que falta e o saldo do pedido.
    recebido: number;
    // De quais requisicoes de compra o item veio, herdado da cotacao.
    origens: string[];
};

export type Pedido = {
    id: number;
    numero: string;
    // Id interno, separado do numero visivel, como o Id. Pedido da tela dele.
    idPedido: string;
    empresa: string;
    fornecedor: string;
    // Cotacao de origem, para dar para voltar nela.
    cotacao: number;
    cotacaoNumero: string;
    status: string;
    criacao: string;
    usuario: string;
    condicaoPagamento: string;
    transportadora: string;
    tipoFrete: number;
    freteFornecedor: number;
    freteMk: number;
    desconto: number;
    observacao: string;
    itens: PedidoItem[];
};

function clonarPedido(pedido: Pedido): Pedido {
    return {
        ...pedido,
        itens: pedido.itens.map((i) => ({ ...i, origens: [...i.origens] })),
    };
}

// Gera os pedidos dos itens marcados como vencedores, um por fornecedor.
//
// Fornecedor que ja tem pedido desta cotacao e pulado, em vez de gerar de novo:
// pedido emitido nao pode ser reescrito porque alguem clicou duas vezes. Para
// refazer, cancele o pedido antes.
export function GerarPedidos(cotacaoId: number, usuario: string): Pedido[] {
    const s = carregar();
    const cotacao = achar(cotacaoId);
    if (cotacao == undefined) {
        return [];
    }

    const gerados: Pedido[] = [];

    for (const fornecedor of cotacao.fornecedores) {
        const vencedores = fornecedor.itens.filter((i) => i.vencedor);
        if (vencedores.length == 0) {
            continue;
        }

        const jaTem = s.pedidos.some(
            (p) => p.cotacao == cotacaoId
                && p.fornecedor == fornecedor.fornecedor
                && p.status != STATUS_PEDIDO_CANCELADO,
        );
        if (jaTem) {
            continue;
        }

        const itens: PedidoItem[] = [];
        for (const linha of vencedores) {
            const item = cotacao.itens.find((i) => i.id == linha.item);
            if (item == undefined) {
                continue;
            }

            itens.push({
                id: item.id,
                numeroItem: itens.length + 1,
                produto: item.produto,
                descricao: item.descricao,
                complemento: item.complemento,
                quantidade: item.quantidade,
                unidade: item.unidade,
                valorUnitario: linha.valorUnitario,
                ipi: linha.ipi,
                icms: linha.icms,
                pis: linha.pis,
                cofins: linha.cofins,
                icmsSt: linha.icmsSt,
                difal: linha.difal,
                fatorImpostos: linha.fatorImpostos,
                leadTimeItem: linha.leadTimeItem,
                leadTimeTransporte: linha.leadTimeTransporte,
                fabricante: linha.fabricante,
                conta: item.conta,
                nomeConta: item.nomeConta,
                centroCusto: item.centroCusto,
                descricaoCentroCusto: item.descricaoCentroCusto,
                solicitante: item.solicitantes.join(" + "),
                comprador: usuario != "" ? usuario : cotacao.usuario,
                enviado: false,
                impresso: false,
                recebido: 0,
                origens: [...item.origens],
            });
        }

        if (itens.length == 0) {
            continue;
        }

        const cadastro = s.fornecedores.find((f) => f.codigo == fornecedor.fornecedor);

        const pedido: Pedido = {
            id: s.proximoPedido,
            numero: String(265600 + s.proximoPedido),
            idPedido: String(267100 + s.proximoPedido),
            empresa: cotacao.empresa,
            fornecedor: fornecedor.fornecedor,
            cotacao: cotacao.id,
            cotacaoNumero: cotacao.numero,
            status: STATUS_PEDIDO_ABERTO,
            criacao: new Date().toISOString(),
            usuario: usuario != "" ? usuario : cotacao.usuario,
            // Frete, desconto e condicao de pagamento vem da proposta daquele
            // fornecedor: foi o que ele ofereceu na cotacao. Sem proposta, cai
            // para o que esta no cadastro dele.
            condicaoPagamento: fornecedor.condicaoPagamento != ""
                ? fornecedor.condicaoPagamento
                : cadastro?.condicaoPagamento ?? "",
            transportadora: cadastro?.transportadora ?? "",
            tipoFrete: fornecedor.tipoFrete,
            freteFornecedor: fornecedor.freteFornecedor,
            freteMk: fornecedor.freteMk,
            desconto: fornecedor.desconto,
            observacao: "",
            itens,
        };

        s.proximoPedido = s.proximoPedido + 1;
        s.pedidos.push(pedido);
        gerados.push(clonarPedido(pedido));
    }

    // Cotacao que ja virou pedido esta encerrada. Reabrir continua possivel pelo
    // status, se ele quiser mexer depois.
    if (gerados.length > 0 && ItensSemVencedor(cotacao) == 0) {
        cotacao.status = STATUS_FECHADA;
    }

    salvar();
    return gerados;
}

export function ListPedidos(): Pedido[] {
    return carregar().pedidos.map(clonarPedido).reverse();
}

export function ListPedidosDaCotacao(cotacaoId: number): Pedido[] {
    return carregar().pedidos.filter((p) => p.cotacao == cotacaoId).map(clonarPedido);
}

export function GetPedido(id: number): Pedido | undefined {
    const pedido = carregar().pedidos.find((p) => p.id == id);
    return pedido != undefined ? clonarPedido(pedido) : undefined;
}

export function SetPedidoCabecalho(id: number, dados: Partial<Pedido>) {
    const pedido = carregar().pedidos.find((p) => p.id == id);
    if (pedido == undefined) {
        return;
    }

    Object.assign(pedido, dados);
    salvar();
}

export function SetPedidoItem(pedidoId: number, itemId: number, dados: Partial<PedidoItem>) {
    const item = carregar().pedidos.find((p) => p.id == pedidoId)?.itens.find((i) => i.id == itemId);
    if (item == undefined) {
        return;
    }

    Object.assign(item, dados);
    salvar();
}

// Pesquisa avancada por item: acha os pedidos que tem aquele produto, sem
// precisar saber de qual fornecedor ele e.
//
// Devolve o pedido inteiro mais os ids dos itens que casaram, porque o item
// procurado costuma estar no meio de varios outros e a tela precisa destaca-lo.
export type ResultadoBusca = {
    pedido: Pedido;
    encontrados: number[];
};

function normalizarBusca(valor: string): string {
    return valor.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function BuscarPedidosPorItem(texto: string): ResultadoBusca[] {
    const palavras = normalizarBusca(texto.trim()).split(/\s+/).filter((p) => p != "");
    if (palavras.length == 0) {
        return [];
    }

    const resultados: ResultadoBusca[] = [];
    for (const pedido of carregar().pedidos) {
        const encontrados: number[] = [];
        for (const item of pedido.itens) {
            // Codigo e descricao, que e o que ele pediu para poder procurar.
            const termos = normalizarBusca(item.produto + " " + item.descricao + " " + item.complemento);
            if (palavras.every((palavra) => termos.includes(palavra))) {
                encontrados.push(item.id);
            }
        }

        if (encontrados.length > 0) {
            resultados.push({ pedido: clonarPedido(pedido), encontrados });
        }
    }

    return resultados.reverse();
}

export function RemovePedidoItem(pedidoId: number, itemId: number) {
    const pedido = carregar().pedidos.find((p) => p.id == pedidoId);
    if (pedido == undefined) {
        return;
    }

    pedido.itens = pedido.itens.filter((i) => i.id != itemId);
    salvar();
}

export type TotaisPedido = {
    produtos: number;
    impostos: number;
    ipi: number;
    icms: number;
    icmsSt: number;
    desconto: number;
    frete: number;
    total: number;
    prazo: number;
    // Valor do que ainda nao foi recebido, como o "Total do saldo" da tela dele.
    saldo: number;
};

export function PedidoTotais(pedido: Pedido): TotaisPedido {
    const totais: TotaisPedido = {
        produtos: 0, impostos: 0, ipi: 0, icms: 0, icmsSt: 0,
        desconto: pedido.desconto, frete: pedido.freteFornecedor + pedido.freteMk,
        total: 0, prazo: 0, saldo: 0,
    };

    for (const item of pedido.itens) {
        const total = item.valorUnitario * item.quantidade;
        totais.produtos = totais.produtos + total;
        totais.impostos = totais.impostos
            + total * (item.ipi + item.fatorImpostos) / 100 + item.icmsSt + item.difal;
        totais.ipi = totais.ipi + total * item.ipi / 100;
        totais.icms = totais.icms + total * item.icms / 100;
        totais.icmsSt = totais.icmsSt + item.icmsSt;

        const falta = item.quantidade - item.recebido;
        if (falta > 0) {
            totais.saldo = totais.saldo + falta * item.valorUnitario;
        }

        const prazo = item.leadTimeItem + item.leadTimeTransporte;
        if (prazo > totais.prazo) {
            totais.prazo = prazo;
        }
    }

    totais.total = totais.produtos + totais.impostos + totais.frete - totais.desconto;
    return totais;
}

// Planilha do pedido, no mesmo formato da cotacao: uma linha por item.
export function PedidoCsv(pedido: Pedido): string {
    const colunas = [
        "Item", "Descrição", "Complemento", "Qt", "Unidade", "Unitário",
        "IPI%", "ICMS%", "PIS%", "COFINS%", "ICMS-ST (Valor)", "DIFAL (Valor)",
        "Fator Impostos %", "Valor Total", "LeadTime Item", "LeadTime Transporte",
        "Fabricante", "Conta", "Centro de Custo", "Requisições",
    ];

    function num(valor: number): string {
        return String(valor).replace(".", ",");
    }

    function campo(valor: string): string {
        if (valor.includes(";") || valor.includes("\"") || valor.includes("\n")) {
            return "\"" + valor.replace(/"/g, "\"\"") + "\"";
        }
        return valor;
    }

    const linhas: string[] = [
        "sep=;",
        "PEDIDO : " + pedido.numero + " - " + FornecedorCompleto(pedido.fornecedor),
        "Cotação de origem : " + pedido.cotacaoNumero,
        "",
        colunas.join(";"),
    ];

    for (const item of pedido.itens) {
        linhas.push([
            item.produto,
            item.descricao,
            item.complemento,
            num(item.quantidade),
            item.unidade,
            num(item.valorUnitario),
            num(item.ipi),
            num(item.icms),
            num(item.pis),
            num(item.cofins),
            num(item.icmsSt),
            num(item.difal),
            num(item.fatorImpostos),
            num(item.valorUnitario * item.quantidade),
            String(item.leadTimeItem),
            String(item.leadTimeTransporte),
            item.fabricante,
            item.conta,
            item.centroCusto,
            item.origens.join(" "),
        ].map(campo).join(";"));
    }

    return linhas.join("\r\n");
}

// ---------------------------------------------------------------------------
// Movimentacao de estoque e reposicao automatica
// ---------------------------------------------------------------------------

export function ListEstoque(): ProdutoEstoque[] {
    return copia(carregar().estoque);
}

export function GetProdutoEstoque(codigo: string): ProdutoEstoque | undefined {
    const produto = carregar().estoque.find((p) => p.codigo == codigo);
    return produto != undefined ? { ...produto } : undefined;
}

// O que a baixa provocou. A tela usa para contar o que aconteceu, em vez de a
// pessoa ter que ir procurar na outra tela.
export type ResultadoBaixa = {
    ok: boolean;
    saldo: number;
    mensagem: string;
    // Preenchido quando a baixa criou item na lista a cotar.
    requisicao?: RequisicaoItem;
    // Preenchido quando o item tem fornecedor exclusivo e virou pedido direto.
    pedido?: Pedido;
};

// Prefixo das linhas que nasceram do ponto de pedido, para separar do que veio
// de requisicao de compra digitada.
const PREFIXO_REPOSICAO = "EST-";

// Ja existe reposicao em andamento para este produto? Sem isso, cada baixa
// abaixo do ponto de pedido criaria uma linha nova, e a lista a cotar encheria
// de repeticao do mesmo item.
//
// So conta reposicao: uma requisicao de compra que alguem digitou para o mesmo
// produto e outra necessidade, e nao substitui a reposicao do estoque.
function temReposicaoAberta(s: Store, codigo: string): boolean {
    const naFila = s.requisicoes.some(
        (r) => r.produto == codigo && !r.cotada && r.requisicao.startsWith(PREFIXO_REPOSICAO),
    );
    const emCotacao = s.cotacoes.some(
        (c) => c.status != STATUS_FECHADA && c.itens.some(
            (i) => i.produto == codigo && i.origens.some((o) => o.startsWith(PREFIXO_REPOSICAO)),
        ),
    );
    // Pedido conta sempre: se ja tem compra em andamento daquele item, de onde
    // quer que ela tenha vindo, nao ha por que pedir de novo.
    const emPedido = s.pedidos.some(
        (p) => p.status != STATUS_PEDIDO_CANCELADO && p.itens.some((i) => i.produto == codigo),
    );

    return naFila || emCotacao || emPedido;
}

// Saida de estoque. No sistema de verdade quem chama isto e a retirada do
// armario e a entrega da requisicao; aqui a tela de Estoque chama na mao.
export function BaixarEstoque(codigo: string, quantidade: number, usuario: string): ResultadoBaixa {
    const s = carregar();
    const produto = s.estoque.find((p) => p.codigo == codigo);
    if (produto == undefined) {
        return { ok: false, saldo: 0, mensagem: "Produto não encontrado." };
    }

    if (quantidade <= 0) {
        return { ok: false, saldo: produto.saldo, mensagem: "Informe a quantidade." };
    }

    // Saldo nao fica negativo: a baixa leva o que tem.
    const saiu = Math.min(quantidade, produto.saldo);
    produto.saldo = produto.saldo - saiu;

    if (produto.saldo > produto.pontoPedido) {
        salvar();
        return {
            ok: true,
            saldo: produto.saldo,
            mensagem: `Saíram ${decimal(saiu)} ${produto.unidade}. Saldo ${decimal(produto.saldo)}, acima do ponto de pedido.`,
        };
    }

    if (temReposicaoAberta(s, produto.codigo)) {
        salvar();
        return {
            ok: true,
            saldo: produto.saldo,
            mensagem: `Saldo ${decimal(produto.saldo)}, no ponto de pedido. Já existe reposição em andamento para este item.`,
        };
    }

    // Fornecedor exclusivo: nao ha o que cotar, entao a baixa gera o pedido de
    // compra direto. Foi o caso que o Clairton levantou.
    if (produto.exclusivo && produto.fornecedorPrincipal != undefined) {
        const pedido = criarPedidoDireto(s, produto, usuario);
        salvar();
        return {
            ok: true,
            saldo: produto.saldo,
            pedido,
            mensagem: `Saldo ${decimal(produto.saldo)}, no ponto de pedido. Fornecedor exclusivo: gerado o pedido ${pedido.numero}.`,
        };
    }

    const requisicao = criarPendenciaReposicao(s, produto);
    salvar();
    return {
        ok: true,
        saldo: produto.saldo,
        requisicao,
        mensagem: `Saldo ${decimal(produto.saldo)}, no ponto de pedido. Item enviado para a lista a cotar (${requisicao.requisicao}).`,
    };
}

// Entrada de estoque, so para dar para repetir a demonstracao sem recarregar
// tudo.
export function EntrarEstoque(codigo: string, quantidade: number): number {
    const produto = carregar().estoque.find((p) => p.codigo == codigo);
    if (produto == undefined || quantidade <= 0) {
        return 0;
    }

    produto.saldo = produto.saldo + quantidade;
    salvar();
    return produto.saldo;
}

// A linha que a reposicao automatica joga na lista a cotar. Nasce do estoque, e
// nao de uma requisicao de compra digitada, entao o numero leva EST na frente
// para dar para saber de onde veio.
function criarPendenciaReposicao(s: Store, produto: ProdutoEstoque): RequisicaoItem {
    const linha: RequisicaoItem = {
        id: s.proximaRequisicao,
        requisicao: PREFIXO_REPOSICAO + String(1000 + s.proximaReposicao),
        empresa: EMPRESA_PADRAO,
        numeroItem: 1,
        produto: produto.codigo,
        descricao: produto.descricao,
        complemento: "",
        quantidade: produto.loteReposicao,
        unidade: produto.unidade,
        valorUltimaCompra: produto.ultimoValor,
        fornecedorUltimaCompra: produto.fornecedorPrincipal,
        conta: "",
        nomeConta: "",
        centroCusto: "",
        descricaoCentroCusto: "",
        solicitante: "ESTOQUE",
        data: new Date().toISOString(),
        cotada: false,
    };

    s.proximaRequisicao = s.proximaRequisicao + 1;
    s.proximaReposicao = s.proximaReposicao + 1;
    s.requisicoes.push(linha);
    return linha;
}

// Pedido sem cotacao, do item de fornecedor exclusivo. O preco e o da ultima
// compra: e o unico que existe ate o fornecedor responder.
function criarPedidoDireto(s: Store, produto: ProdutoEstoque, usuario: string): Pedido {
    const cadastro = s.fornecedores.find((f) => f.codigo == produto.fornecedorPrincipal);

    const pedido: Pedido = {
        id: s.proximoPedido,
        numero: String(265600 + s.proximoPedido),
        idPedido: String(267100 + s.proximoPedido),
        empresa: EMPRESA_PADRAO,
        fornecedor: produto.fornecedorPrincipal ?? "",
        // Sem cotacao de origem: veio direto do ponto de pedido.
        cotacao: 0,
        cotacaoNumero: "",
        status: STATUS_PEDIDO_ABERTO,
        criacao: new Date().toISOString(),
        usuario: usuario != "" ? usuario : "ESTOQUE",
        condicaoPagamento: cadastro?.condicaoPagamento ?? "",
        transportadora: cadastro?.transportadora ?? "",
        tipoFrete: FRETE_CIF,
        freteFornecedor: 0,
        freteMk: 0,
        desconto: 0,
        observacao: "Reposição automática: saldo no ponto de pedido, fornecedor exclusivo.",
        itens: [{
            id: s.proximoItem,
            numeroItem: 1,
            produto: produto.codigo,
            descricao: produto.descricao,
            complemento: "",
            quantidade: produto.loteReposicao,
            unidade: produto.unidade,
            valorUnitario: produto.ultimoValor,
            ipi: 0, icms: 0, pis: 0, cofins: 0, icmsSt: 0, difal: 0, fatorImpostos: 0,
            leadTimeItem: 0,
            leadTimeTransporte: 0,
            fabricante: "",
            conta: "",
            nomeConta: "",
            centroCusto: "",
            descricaoCentroCusto: "",
            solicitante: "ESTOQUE",
            comprador: usuario != "" ? usuario : "ESTOQUE",
            enviado: false,
            impresso: false,
            recebido: 0,
            origens: [PREFIXO_REPOSICAO + String(1000 + s.proximaReposicao)],
        }],
    };

    s.proximoItem = s.proximoItem + 1;
    s.proximoPedido = s.proximoPedido + 1;
    s.proximaReposicao = s.proximaReposicao + 1;
    s.pedidos.push(pedido);
    return clonarPedido(pedido);
}

// ---------------------------------------------------------------------------
// Comparativo de fornecedores
// ---------------------------------------------------------------------------
//
// A ferramenta auxiliar que o comprador usa para decidir: item por item, o que
// cada fornecedor cobrou, o unitario e o total, com o melhor preco destacado.

export type Proposta = {
    fornecedor: string;
    unitario: number;
    total: number;
    prazo: number;
    vencedor: boolean;
    // Menor preco do item entre quem cotou.
    melhor: boolean;
};

export type LinhaComparativo = {
    item: number;
    produto: string;
    descricao: string;
    quantidade: number;
    unidade: string;
    propostas: Proposta[];
};

export function Comparativo(cotacao: Cotacao): LinhaComparativo[] {
    return cotacao.itens.map((item) => {
        const propostas: Proposta[] = [];

        for (const fornecedor of cotacao.fornecedores) {
            const linha = fornecedor.itens.find((i) => i.item == item.id);
            if (linha == undefined) {
                continue;
            }

            propostas.push({
                fornecedor: fornecedor.fornecedor,
                unitario: linha.valorUnitario,
                total: linha.valorUnitario * item.quantidade,
                prazo: linha.leadTimeItem + linha.leadTimeTransporte,
                vencedor: linha.vencedor,
                melhor: false,
            });
        }

        // Quem nao cotou fica no fim: unitario zero nao e preco melhor, e sim
        // ausencia de proposta.
        propostas.sort((a, b) => {
            if (a.unitario <= 0) {
                return 1;
            }
            if (b.unitario <= 0) {
                return -1;
            }
            return a.unitario - b.unitario;
        });

        const comPreco = propostas.filter((p) => p.unitario > 0);
        if (comPreco.length > 0) {
            comPreco[0].melhor = true;
        }

        return {
            item: item.id,
            produto: item.produto,
            descricao: item.descricao,
            quantidade: item.quantidade,
            unidade: item.unidade,
            propostas,
        };
    });
}

// Quanto sairia comprando cada item de quem cobrou menos. E o piso da cotacao,
// que o comprador usa como referencia contra o total de um fornecedor so.
export function TotalMelhorCombinacao(cotacao: Cotacao): number {
    return Comparativo(cotacao).reduce((soma, linha) => {
        const melhor = linha.propostas.find((p) => p.melhor);
        return soma + (melhor != undefined ? melhor.total : 0);
    }, 0);
}

// Quanto sairia se um fornecedor so levasse tudo. Fornecedor que deixou item em
// branco nao consegue atender a cotacao inteira, e a tela avisa isso.
export function TotalSeLevarTudo(cotacao: Cotacao, codigo: string): number {
    const fornecedor = cotacao.fornecedores.find((f) => f.fornecedor == codigo);
    if (fornecedor == undefined) {
        return 0;
    }

    return fornecedor.itens.reduce(
        (soma, linha) => soma + linha.valorUnitario * QuantidadeDoItem(cotacao, linha.item),
        0,
    ) + fornecedor.freteFornecedor + fornecedor.freteMk - fornecedor.desconto;
}

// Planilha da cotacao, nas mesmas colunas e na mesma ordem do Excel que ele
// exporta: uma linha por item e fornecedor. Sai como CSV com ponto e virgula,
// que o Excel em portugues abre direto.
export function CotacaoCsv(cotacao: Cotacao): string {
    const colunas = [
        "Fornecedor", "Item", "Descrição", "Complemento", "Qt", "Unidade", "Unitário",
        "IPI%", "ICMS%", "PIS%", "COFINS%", "ICMS-ST (Valor)", "DIFAL (Valor)",
        "Fator Impostos %", "Valor Total", "LeadTime Item", "LeadTime Transporte",
        "Fabricante", "Tipo Frete(0-CIF,1-FOB)", "Vlr. Frete Fornecedor", "Vlr. Frete MK",
        "ID Registro",
    ];

    // Numero com virgula decimal, como o Excel em portugues espera.
    function num(valor: number): string {
        return String(valor).replace(".", ",");
    }

    function campo(valor: string): string {
        // Ponto e virgula, aspas ou quebra de linha dentro do texto quebram a
        // coluna, entao o campo vai entre aspas com as aspas internas dobradas.
        if (valor.includes(";") || valor.includes("\"") || valor.includes("\n")) {
            return "\"" + valor.replace(/"/g, "\"\"") + "\"";
        }
        return valor;
    }

    // "sep=;" na primeira linha e uma convencao que o Excel le: sem ela, numa
    // instalacao em portugues que espera virgula, o arquivo abre com tudo
    // grudado na coluna A. Outros programas mostram essa linha como texto, o
    // que e um preco baixo perto de abrir torto no Excel.
    const linhas: string[] = ["sep=;", "COTAÇÃO : " + cotacao.numero, "", colunas.join(";")];

    for (const fornecedor of cotacao.fornecedores) {
        for (const valor of fornecedor.itens) {
            const item = cotacao.itens.find((i) => i.id == valor.item);
            if (item == undefined) {
                continue;
            }

            linhas.push([
                FornecedorCompleto(fornecedor.fornecedor),
                item.produto,
                item.descricao,
                item.complemento,
                num(item.quantidade),
                item.unidade,
                num(valor.valorUnitario),
                num(valor.ipi),
                num(valor.icms),
                num(valor.pis),
                num(valor.cofins),
                num(valor.icmsSt),
                num(valor.difal),
                num(valor.fatorImpostos),
                num(ValorTotalItem(cotacao, valor)),
                String(valor.leadTimeItem),
                String(valor.leadTimeTransporte),
                valor.fabricante,
                String(fornecedor.tipoFrete),
                num(fornecedor.freteFornecedor),
                num(fornecedor.freteMk),
                String(valor.idRegistro),
            ].map(campo).join(";"));
        }
    }

    return linhas.join("\r\n");
}

// Entrega o arquivo ao usuario. O BOM no inicio e o que faz o Excel entender os
// acentos; sem ele "CERÂMICA" abre torto.
export function BaixarCsv(nome: string, conteudo: string) {
    const blob = new Blob(["﻿" + conteudo], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = nome;
    link.click();
    URL.revokeObjectURL(url);
}

export function moeda(valor: number): string {
    return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function decimal(valor: number): string {
    return valor.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
}

export function dataHora(iso: string): string {
    if (iso == "") {
        return "";
    }

    return new Date(iso).toLocaleString("pt-BR", {
        day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
}

export function dataCurta(iso: string): string {
    if (iso == "") {
        return "";
    }

    return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

// Le "1.234,56" e devolve 1234.56. O usuario digita com virgula.
export function numeroDigitado(digitado: string): number {
    const limpo = digitado.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
    const valor = Number(limpo);
    return isNaN(valor) ? 0 : valor;
}

export function comoTexto(valor: number): string {
    if (valor == 0) {
        return "";
    }

    return String(valor).replace(".", ",");
}
