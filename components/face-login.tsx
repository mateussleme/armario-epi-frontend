"use client"

import { GetUser } from "@/api/face";
import { Box } from "@chakra-ui/react"
import { setCookie } from "cookies-next";
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useRef } from "react"

export function FaceLogin({ url }: { url: string }) {
    const router = useRouter();
    const videoRef = useRef<HTMLVideoElement>(null);

    const doRecognition = useCallback(async (track: MediaStreamTrack): Promise<boolean> => {
        const imageCapture = new ImageCapture(track);
        const blob = await imageCapture.takePhoto({
            imageWidth: 720,
            imageHeight: 1280,
            redEyeReduction: true,
        });

        const user = await GetUser(blob);
        if (user == "") {
            return false;
        }
        
        if (videoRef.current) {
            if (videoRef.current.srcObject) {
                (videoRef.current.srcObject as MediaStream).getTracks().forEach(function (track) {
                    track.stop();
                });
            }

            videoRef.current.srcObject = null;
        }
        await setCookie("user", user);

        return true;
    }, [videoRef]);

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({
            audio: true,
            video: {
                width: 720,
                height: 1280,
                facingMode: "user",
            },
        }).then((stream) => {
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                const tracks = stream.getVideoTracks();
                if (tracks.length >= 1) {
                    const recognitionLoop = () => {
                        setTimeout(() => {
                            doRecognition(tracks[0]).then((recognized) => {
                                if (recognized) {
                                    router.push(url);
                                } else {
                                    recognitionLoop();
                                }
                            });
                        }, 1000);
                    };

                    recognitionLoop();
                }
            }
        });
    }, [url, doRecognition, router]);

    return <Box
        bg={"black"}
        borderWidth="1px"
        borderColor="border.disabled"
        borderRadius={"2xl"}
        w={"75vw"}
        h={"70vh"}
        style={{ overflow: "hidden" }}
    >
        <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ width: '100%', height: '100%', objectFit: "cover", transform: "scaleX(-1)" }}
        />
    </Box>
}