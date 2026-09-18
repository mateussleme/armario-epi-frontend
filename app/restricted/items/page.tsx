import { GetSaved } from "@/api/controls";
import { GetItemData } from "@/api/item-data";
import { GetUser } from "@/api/users";
import { MenuItem } from "@/components/menu-item";
import { ProductItem } from "@/components/product-item";
import { SearchList, SearchItem } from "@/components/search-list";
import { Flex, VStack, Text } from "@chakra-ui/react";
import { IconListDetails } from "@tabler/icons-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { ViewTransition } from "react";
import { C, MAX_W } from "@/theme/colors";

export default async function Items() {
    await connection();

    const cookieStore = await cookies();
    const user = cookieStore.get("user")?.value ?? "";
    const userData = await GetUser(user);
    if (!(userData?.admin ?? false)) {
        redirect("/");
    }

    // GetSaved traz o estoque atual por produto, entao ja serve como lista de
    // produtos cadastrados e ainda da a quantidade de cada um.
    const stock = (await GetSaved()) ?? {};

    // Busca os dados de cada produto aqui no servidor para a busca por nome
    // funcionar. Antes o nome so era carregado dentro do componente, entao a
    // pagina nao tinha como filtrar por ele.
    //
    // A busca e por codigo e descricao. Endereco fica de fora porque muda quando
    // o armario e reorganizado, entao nao serve para procurar.
    const searchItems: SearchItem[] = [];
    for (const [itemId, quantity] of Object.entries(stock)) {
        const data = await GetItemData(itemId);
        searchItems.push({
            id: itemId,
            terms: [itemId, data?.title ?? "", data?.description ?? ""].join(" "),
            sort: data?.title ?? itemId,
            node: <ProductItem itemId={itemId} quantity={quantity} data={data} />,
        });
    }

    // Nao usa AbsoluteCenter: ele centraliza com posicionamento absoluto, e quando
    // a lista fica maior que a tela o conteudo sobra para fora nas duas pontas,
    // sem como rolar ate o inicio.
    return (
        <Flex justify="center" bg={C.bg} w="100vw" minH="100vh" py="3rem" px="4">
            <VStack gap="3rem" w="80vw" maxW={MAX_W}>
                <VStack gap="1rem">
                    <ViewTransition name="mainIcon">
                        <Text color={C.accent}>
                            <IconListDetails size={40} style={{ width: "min(10vw, 10vh)", height: "min(10vw, 10vh)" }} />
                        </Text>
                    </ViewTransition>
                    <ViewTransition name="mainText">
                        <Text textStyle="4xl" fontWeight="normal" color={C.ink}>Produtos</Text>
                    </ViewTransition>
                </VStack>

                <ViewTransition name="mainContent">
                    <VStack gap="1rem" w="100%">
                        <MenuItem action="newItem" />
                        <SearchList
                            items={searchItems}
                            placeholder="Buscar por código ou descrição"
                            emptyText="Nenhum produto encontrado."
                        />
                        <MenuItem action="back" override="/restricted" />
                    </VStack>
                </ViewTransition>
            </VStack>
        </Flex>
    );
}
