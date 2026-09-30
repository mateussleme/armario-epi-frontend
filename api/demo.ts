import { GetUser } from "./users";

// Modo demonstracao. Ligado por NEXT_PUBLIC_DEMO=1, que e como o ambiente da
// Vercel sobe.
//
// Existe porque o modulo de compras roda inteiro no navegador, mas as telas de
// /restricted checam admin no backend. Sem backend no ar, toda pagina cairia no
// redirect para a home e nao daria para navegar em nada.
//
// No modo demonstracao:
//   - as telas de compras (cotacao, pedido, estoque) abrem sem login
//   - a home e o Gerenciamento mostram so essas telas, porque o resto depende
//     do banco, do leitor RFID e do reconhecimento facial
//
// Em producao a variavel nao existe, entao tudo volta a exigir admin.
export const DEMO = process.env.NEXT_PUBLIC_DEMO == "1";

// Quem pode abrir as telas de gerenciamento. No modo demonstracao ninguem e
// barrado; fora dele, so admin, como sempre foi.
export async function PodeEntrar(user: string): Promise<boolean> {
    if (DEMO) {
        return true;
    }

    const userData = await GetUser(user);
    return userData?.admin ?? false;
}
