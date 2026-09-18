// Conteudo da etiqueta QR colada no local de armazenagem.
//
// Formato definido pelo Clairton: cifrao seguido do codigo do item.
//
//   $epi5
//
// O cifrao nao e enfeite. Ele marca que aquilo e etiqueta nossa, e nao um dos
// varios codigos de barras que ja vem na caixa do fabricante. Sem essa marca,
// bipar a embalagem errada daria "item errado" e a pessoa ficaria procurando o
// erro na prateleira, quando o erro foi ler a coisa errada.
//
// O parser ainda aceita um segundo campo (separado por | ; , ou espaco) e a
// leitura sem cifrao. O segundo campo e para a etiqueta poder crescer sem
// quebrar o que ja esta colado; a leitura sem cifrao e para quem digita o codigo
// na mao quando a etiqueta esta rasgada, que nao vai lembrar de por o simbolo.
export type Etiqueta = {
    codigo: string;
    // Veio com o cifrao, ou seja, e etiqueta do sistema e nao outro codigo
    // qualquer que estava na embalagem.
    doSistema: boolean;
    endereco?: string;
};

export function parseEtiqueta(texto: string): Etiqueta {
    const limpo = texto.trim();
    const doSistema = limpo.startsWith("$");

    // Tira o cifrao e qualquer espaco que tenha sobrado entre ele e o codigo.
    const semPrefixo = doSistema ? limpo.slice(1).trim() : limpo;

    const partes = semPrefixo.split(/[|;,\s]+/).filter((p) => p != "");

    return {
        codigo: partes[0] ?? "",
        doSistema,
        endereco: partes[1],
    };
}

// A etiqueta confere com o item esperado?
//
// Compara sem diferenciar maiusculas: o codigo pode ter sido digitado na mao no
// cadastro e impresso de outro jeito na etiqueta.
//
// O endereco nao entra na conferencia. Ele muda quando o armazem e
// reorganizado, e a etiqueta antiga continuaria colada la; travar por endereco
// faria o picking parar por um motivo que nao e erro de quem separa.
export function etiquetaConfere(etiqueta: Etiqueta, produtoEsperado: string) {
    return etiqueta.codigo != ""
        && etiqueta.codigo.toLowerCase() == produtoEsperado.trim().toLowerCase();
}

// Texto do problema, para a tela nao ter que montar frase.
//
// Distingue os tres casos que acontecem de verdade no corredor: leu sujeira,
// bipou a embalagem em vez da etiqueta, ou pegou o item errado da prateleira.
export function erroDaEtiqueta(etiqueta: Etiqueta, produtoEsperado: string) {
    if (etiqueta.codigo == "") {
        return "Não consegui ler a etiqueta.";
    }

    if (!etiqueta.doSistema) {
        return `Isto não parece uma etiqueta do sistema (elas começam com $). Li "${etiqueta.codigo}".`;
    }

    return `Esta etiqueta é do item ${etiqueta.codigo}, e o pedido é do ${produtoEsperado}.`;
}
