"use client"

import { useEffect } from "react";
import { ItemData } from "@/types/ItemData";
import { useCart } from "@/components/cart";
import { RequiredDetail } from "@/api/item-data";
import { requiredReason } from "@/types/Required";

type Item = {
    id: string;
    state: string;
    data?: ItemData;
};

// Coloca no carrinho, travado, os itens que a pessoa e obrigada a pedir.
//
// Quem decide isso e o backend, nao a tela: o item entra como "required" quando
// e obrigatorio no GES da pessoa e passou do prazo desde a ultima retirada dela
// (ou ela nunca retirou). O prazo e por GES, entao a mesma luva pode vencer em 5
// dias para um grupo e em 15 para outro, e so o servidor tem essa conta.
//
// Nao usa o caVencimento do produto: aquilo e a validade do Certificado de
// Aprovacao, que vale para o item na prateleira, nao para o uso de cada pessoa.
export function useRequiredItems(items: Item[], detail: RequiredDetail[] = []) {
    const cart = useCart();

    useEffect(() => {
        for (const item of items) {
            if (item.state != "required") {
                continue;
            }

            // add ja ignora id repetido, entao nao duplica se a pessoa voltar
            // para a tela. O que nao pode e sobrescrever: se ela adicionou o item
            // na mao antes, ele entra sem trava e precisa ganhar a trava agora.
            if (cart.has(item.id)) {
                continue;
            }

            const found = detail.find((d) => d.produto == item.id);
            cart.add({
                id: item.id,
                data: item.data,
                isMandatory: true,
                reason: found != undefined
                    ? requiredReason(found.diasValidade, found.diasDesdeUso)
                    : undefined,
            });
        }
        // items muda de identidade a cada render do server component, mas o
        // conteudo e o mesmo; a dependencia real e a lista de ids obrigatorios.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [items.filter((i) => i.state == "required").map((i) => i.id).join(","), cart]);
}
