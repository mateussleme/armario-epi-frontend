export type ItemData = {
    title: string
    description: string
    imageUri: string
    videoUri?: string
    ca?: string
    caVencimento?: string
    endereco?: string
    porta?: number
    // De onde o produto e retirado. Define o fluxo do usuario: armario e retirada
    // direta (abre a porta, leitura RFID); almoxarifado passa por solicitacao e
    // separacao.
    origem?: string
    // Id do local especifico (tabela Local) de onde esse produto e retirado,
    // ex.: qual armario ou almoxarifado. Ainda nao existe coluna real pra isso
    // no epiproduto, so o cadastro de Locais em si ja e real.
    local?: string
    isVencido?: boolean;
}

// A obrigatoriedade e o prazo de troca nao ficam aqui: eles dependem do GES da
// pessoa, nao do produto. Ver GroupProduct em api/groups.ts.
//
// caVencimento acima e outra coisa: e a validade do Certificado de Aprovacao,
// que vale para o item na prateleira e nao para o uso de cada pessoa.

export const ORIGEM_ARMARIO = "armario";
export const ORIGEM_ALMOXARIFADO = "almoxarifado";

export const ORIGENS = [
    { value: ORIGEM_ARMARIO, label: "Armário" },
    { value: ORIGEM_ALMOXARIFADO, label: "Almoxarifado" },
];

// As quatro portas do armario. Fica aqui num lugar so para o dia em que isso
// virar cadastro proprio (com o multiempresa, cada armario pode ter uma
// configuracao diferente) ser uma troca simples.
export const PORTAS = [1, 2, 3, 4];
