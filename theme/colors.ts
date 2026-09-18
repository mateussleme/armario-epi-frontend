// Paleta industrial. Hex fixo (igual ao mockup apresentado)
// Base neutra, cor forte so quando
// comunica alguma coisa (acao principal, status, alerta).
export const C = {
    // base
    bg: "#EDEEEB",
    surface: "#FFFFFF",
    surfaceHover: "#F7F8F6",
    line: "#E4E5E2",

    // texto
    ink: "#2A2E33",
    sub: "#697077",
    faint: "#9BA1A7",

    // acao principal
    accent: "#2E7C8A",
    accentHover: "#25697A",
    accentSoft: "#E1EDEF",
    accentInk: "#1E5A66",

    // status: retirada / acao positiva
    success: "#2F7D4F",
    successSoft: "#E6F0E9",
    successInk: "#245F3C",

    // status: informacao / instrucoes
    info: "#2C5F86",
    infoSoft: "#E4EDF4",
    infoInk: "#224A69",

    // status: erro / sair / excluir
    danger: "#C24A44",
    dangerSoft: "#F8E8E7",
    dangerInk: "#96352F",

    // status: atencao / refazer
    warning: "#B0741F",
    warningSoft: "#F7EDDD",
    warningInk: "#87591A",
};

// Largura maxima do conteudo. Em tela pequena o conteudo usa 80vw e se adapta;
// a partir de um certo tamanho ele para de esticar e fica centralizado, senao os
// botoes viram faixas enormes com o texto de um lado e o icone do outro em monitor
// grande. Na tela do armario nao muda nada, so melhora quando alguem abre em uma visualizacao maior.
export const MAX_W = "42rem";