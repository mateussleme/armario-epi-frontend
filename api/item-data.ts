import { ItemData } from "@/types/ItemData";
import { GetSaved } from "./controls";
import { API_URL } from "./base";

export type AvailableItem = {
    id: string;
    state: string;
}

export async function GetAllItems() {
    const stock = await GetSaved();

    return Object.keys(stock);
}

export async function GetAvailableItems(userId: string) {
    const response = await fetch(API_URL + "/v1/user/" + encodeURIComponent(userId) + "/data", { method: "GET" });
    if (!response.ok) {
        return undefined;
    }

    const data = (await response.json()) as {
        requiredItems: string[];
        availableItems: string[];
    };

    const items = [] as AvailableItem[];
    for (const item of Object.values(data.availableItems)) {
        if (data.requiredItems.includes(item)) {
            items.push({
                id: item,
                state: "required"
            });
        } else {
            items.push({
                id: item,
                state: "available"
            });
        }
    }

    return items;
}

export async function GetItemData(itemId: string) {
    const response = await fetch(API_URL + "/v1/items/" + encodeURIComponent(itemId) + "/data", { method: "GET" });
    if (!response.ok) {
        return undefined;
    }

    return (await response.json()).item as ItemData;
}

export async function GetUnknown() {
    const response = await fetch(API_URL + "/v1/session/inventory/unknown", { method: "GET" });
    if (!response.ok) {
        return undefined;
    }

    const data = (await response.json()) as {
        tags: string[];
    };

    return data.tags;
}

export async function SetUnknown(itemId: string) {
    const response = await fetch(API_URL + "/v1/session/inventory/" + encodeURIComponent(itemId), { method: "POST" });
    if (!response.ok) {
        return false;
    }

    return true;
}