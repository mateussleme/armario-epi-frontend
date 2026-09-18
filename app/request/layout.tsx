import { CartProvider } from "@/components/cart";
import { ReactNode } from "react";

// O carrinho precisa sobreviver quando a pessoa vai da lista para a tela do
// carrinho e volta. Ficando aqui no layout, o estado se mantem enquanto ela
// estiver dentro de /request.
export default function RequestLayout({ children }: { children: ReactNode }) {
    return <CartProvider>{children}</CartProvider>
}
