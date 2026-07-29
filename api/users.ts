import { API_URL } from "./base";

export type UserType = {
    id: string;
    name: string;
    admin: boolean;
    imageUri: string;
}

export async function GetUser(userId: string) {
    const response = await fetch(API_URL + "/v1/user/" + encodeURIComponent(userId) + "/data", { method: "GET" });
    if (!response.ok) {
        console.log(response)
        return undefined;
    }

    const data = (await response.json()) as {
        user: UserType;
    };

    return data.user;
}

export async function GetUsers() {
    const response = await fetch(API_URL + "/v1/user/all", { method: "GET" });
    if (!response.ok) {
        return undefined;
    }

    const data = (await response.json()) as {
        users: UserType[];
    };

    return data.users;
}