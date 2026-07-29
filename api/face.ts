import { FACE_URL } from "./base";

export async function GetUser(blob: Blob) {
    const formData  = new FormData();
    formData.append("file", blob)

    const response = await fetch(FACE_URL + "/v1/recognize", { method: "POST", body: formData });
    if (!response.ok) {
        return "";
    }

    return (await response.json())["result"] as string;
}