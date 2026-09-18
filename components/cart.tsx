"use client"

import { ItemData } from "@/types/ItemData";
import { createContext, ReactNode, useContext, useMemo, useState } from "react";

export type CartItem = {
    id: string;
    data?: ItemData;
    isMandatory?: boolean; // Flag que avisa o sistema que o item não pode ser removido
    // Por que esta travado, em texto pronto ("prazo de 5 dias vencido há 4 dias").
    // Quem monta e o backend, que e quem sabe o prazo do GES e a ultima retirada.
    reason?: string;
};

type CartContext = {
    items: CartItem[];
    has: (id: string) => boolean;
    add: (item: CartItem) => void;
    remove: (id: string) => void;
    clear: () => void;
};

const Context = createContext<CartContext | undefined>(undefined);

// O carrinho vive so enquanto a tela esta aberta. Nao grava em lugar nenhum ate
// a pessoa clicar em Solicitar, quando vira um registro no banco.
//
// Por enquanto e uma unidade por item: e como a retirada funciona hoje. Se
// precisar de quantidade, entra um campo aqui sem mexer no resto.
export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState([] as CartItem[]);

    const value = useMemo(() => ({
        items,
        has: (id: string) => items.some((i) => i.id == id),
        add: (item: CartItem) => {
            setItems((current) => {
                const existing = current.find((i) => i.id == item.id);
                if (existing != undefined) {
                    // Ja esta no carrinho. So interessa um caso: a pessoa tinha
                    // escolhido o item na mao e agora ele chega como obrigatorio.
                    // Sem isto ele ficaria sem trava so por ter sido adicionado
                    // primeiro.
                    if (item.isMandatory && !existing.isMandatory) {
                        return current.map((i) => i.id == item.id ? { ...i, isMandatory: true } : i);
                    }
                    return current;
                }
                return [...current, item];
            });
        },
        // Item obrigatorio nao sai do carrinho. A tela ja esconde a lixeira; a
        // trava fica aqui tambem para nao depender so da interface.
        remove: (id: string) => {
            setItems((current) => current.filter((i) => i.id != id || (i.isMandatory ?? false)));
        },
        clear: () => { setItems([]) },
    }), [items]);

    return <Context.Provider value={value}>{children}</Context.Provider>
}

export function useCart() {
    const context = useContext(Context);
    if (context == undefined) {
        throw new Error("useCart precisa estar dentro de um CartProvider");
    }
    return context;
}