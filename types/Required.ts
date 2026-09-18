// Texto do motivo pelo qual um item esta obrigatorio.
//
// Fica fora dos componentes porque as tres telas usam e precisam dizer a mesma
// coisa: o aviso da Retirada, a confirmacao e o carrinho da Solicitacao. Como e
// funcao pura, nao arrasta componente nenhum para o bundle do cliente.
//
// diasDesdeUso -1 quer dizer que a pessoa nunca retirou o item.
export function requiredReason(diasValidade: number, diasDesdeUso: number) {
    if (diasDesdeUso < 0) {
        return "ainda não retirado";
    }

    if (diasValidade <= 0) {
        return "obrigatório no seu grupo";
    }

    const atraso = diasDesdeUso - diasValidade;
    if (atraso <= 0) {
        return `prazo de ${diasValidade} dias vencendo hoje`;
    }
    if (atraso == 1) {
        return `prazo de ${diasValidade} dias vencido ontem`;
    }
    return `prazo de ${diasValidade} dias vencido há ${atraso} dias`;
}
