import type { Metadata } from "next";
import "./globals.css";
import { DEMO } from "@/api/demo";
import { Provider } from "@/components/ui/provider";
import { VirtualKeyboard } from "@/components/virtual-keyboard";

export const metadata: Metadata = {
    title: "Armário de EPI",
    description: "Controle de EPI: retirada no armário, requisição ao almoxarifado e compras",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt-BR" suppressHydrationWarning>
            <body>
                <Provider>
                    {children}
                    {/* Fica em todas as telas porque a administracao tambem e
                        feita na tela do armario, onde nao ha teclado fisico.
                        Comeca escondido: so aparece ao tocar no botao.

                        No modo demonstracao ele sai: quem abre o link esta num
                        computador ou num celular, que ja tem teclado proprio. */}
                    {!DEMO ? <VirtualKeyboard /> : undefined}
                </Provider>
            </body>
        </html>
    );
}
