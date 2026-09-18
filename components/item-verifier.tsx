"use client"

import { CloseDoor, DoorState, GetCount, GetSaved, InitiateCount, OpenDoor } from "@/api/controls";
import { GetAvailableItemsByOrigin } from "@/api/item-data";
import { ORIGEM_ARMARIO } from "@/types/ItemData";
import { VerificationResult } from "@/types/VerificationResult";
import { getCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export const READING_TIME: number = 2000

export function ItemVerifier({ isInitial, override }: { isInitial: boolean, override?: string }) {
    const router = useRouter();
    const [doorOpened, setDoorOpened] = useState(false);
    const [initiated, setInitiated] = useState(false);

    useEffect(() => {
        (async () => {
            if (isInitial) {
                await InitiateCount();
                await new Promise(r => setTimeout(r, READING_TIME));
            }
            await OpenDoor();
        })().then(() => {
            setDoorOpened(true);
            setInitiated(true);
        })
    }, [setDoorOpened, setInitiated, isInitial]);

    useEffect(() => {
        if (initiated) {
            const intervalId = setInterval(() => {
                DoorState().then((opened) => {
                    setDoorOpened(opened);
                });
            }, 5000);

            return () => { clearInterval(intervalId) };
        }
    }, [setDoorOpened, initiated]);

    useEffect(() => {
        if (initiated && !doorOpened) {
            (async () => {
                await CloseDoor();
                await InitiateCount();
                await new Promise(r => setTimeout(r, READING_TIME));

                const savedItems = await GetSaved();
                const newItems = await GetCount();

                let isValid = true;
                const itemsChanged = {} as Record<string, number>;
                for (const [item, count] of Object.entries(savedItems)) {
                    const newCount = newItems[item] ?? 0;

                    if (newCount != count) {
                        itemsChanged[item] = newCount - count;
                    }
                }

                for (const [item, count] of Object.entries(newItems)) {
                    if (!(item in savedItems)) {
                        itemsChanged[item] = count;
                    }
                }

                if (override != undefined) {
                    const params = new URLSearchParams();
                    params.set("itemsChanged", JSON.stringify(itemsChanged));
                    router.push(override + "?" + params.toString());
                    return undefined;
                }

                const user = (await getCookie("user"))?.valueOf() ?? ""

                // So os itens do armario. Com a lista inteira, um item obrigatorio
                // do almoxarifado (que nunca vai ser lido pela antena, porque nao
                // esta ali) deixava isValid falso para sempre, e a pessoa ficava
                // presa na tela de corrigir a retirada sem ter o que corrigir.
                const availableItems = {} as Record<string, string>;
                for (const [_, value] of Object.entries(await GetAvailableItemsByOrigin(user, ORIGEM_ARMARIO) ?? {})) {
                    availableItems[value.id] = value.state;
                    if (value.state == "required" && (itemsChanged[value.id] ?? 0) != -1) {
                        isValid = false;
                    }
                }

                for (const [item, change] of Object.entries(itemsChanged)) {
                    if (change < -1) {
                        isValid = false;
                    }

                    if (!(availableItems[item])) {
                        isValid = false;
                    }
                }

                return {
                    valid: isValid,
                    itemsChanged: itemsChanged,
                    availableItems: availableItems
                } as VerificationResult;
            })().then((result) => {
                if (result != undefined) {
                    const params = new URLSearchParams();
                    params.set("result", JSON.stringify(result));
                    router.push("/took?" + params.toString());
                }
            })
        };
    }, [doorOpened, initiated, override, router]);

    return <></>
}