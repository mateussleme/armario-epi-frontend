"use client"

import { CloseDoor, DoorState, GetCount, GetSaved, InitiateCount, OpenDoor } from "@/api/controls";
import { GetAvailableItems } from "@/api/item-data";
import { VerificationResult } from "@/types/VerificationResult";
import { getCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export const READING_TIME: number = 2000

export function ItemVerifier({ isInitial }: { isInitial: boolean }) {
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

                const user = (await getCookie("user"))?.valueOf() ?? ""

                const availableItems = {} as Record<string, string>;
                for (const [_, value] of Object.entries(await GetAvailableItems(user) ?? {})) {
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
                const params = new URLSearchParams();
                params.set("result", JSON.stringify(result));
                router.push("/took?" + params.toString());
            })
        };
    }, [doorOpened, initiated, router]);

    return <></>
}