export type Local = {
    id: string;
    nome: string;
    // Define o fluxo: armario e retirada direta, almoxarifado passa por
    // solicitacao e separacao.
    tipo: string;
    // Reservado para o multiempresa; vazio por enquanto.
    empresa?: string;
    ativo: boolean;
};

export const TIPO_ARMARIO = "armario";
export const TIPO_ALMOXARIFADO = "almoxarifado";

export const TIPOS_LOCAL = [
    { value: TIPO_ARMARIO, label: "Armário" },
    { value: TIPO_ALMOXARIFADO, label: "Almoxarifado" },
];

export function labelTipo(tipo: string) {
    return TIPOS_LOCAL.find((t) => t.value == tipo)?.label ?? tipo;
}