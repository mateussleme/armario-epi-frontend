import { API_URL } from "./base";

export async function InitiateCount() {
    const response = await fetch(API_URL + "/v1/session/initiate", { method: "POST" });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
}

export async function GetCount() {
    const response = await fetch(API_URL + "/v1/session/poke", { method: "GET" });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return (await response.json()).products as Record<string, number>
}

export async function GetSaved() {
    const response = await fetch(API_URL + "/v1/stock", { method: "GET" });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return (await response.json()).products as Record<string, number>;
}

export async function UpdateInventory() {
    const response = await fetch(API_URL + "/v1/session/commit", { method: "POST" });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
}

export async function OpenDoor() {
    const response = await fetch(API_URL + "/v1/door/open", { method: "POST" });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
}

export async function CloseDoor() {
    const response = await fetch(API_URL + "/v1/door/close", { method: "POST" });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
}

export async function DoorState() {
    const response = await fetch(API_URL + "/v1/door/state", { method: "GET" });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return (await response.json()).state == "opened";
}