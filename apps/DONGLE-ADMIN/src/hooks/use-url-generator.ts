"use client";

import { useState, useTransition, useCallback } from "react";
import { toast } from "sonner";
import { issueClubRegisterUrlService } from "@dongle/service/club/club.service";

interface GenerateUrlState {
    success?: boolean;
    error?: string;
    registerUrl?: string;
}

export const transformRegisterUrl = (originalUrl: string, origin?: string): string => {
    try {
        const url = new URL(originalUrl);
        const key = url.searchParams.get("key");

        if (!key) {
            return originalUrl; // 키가 없으면 원본 URL 반환
        }

        if (origin) {
            return `${origin}/club-register/${key}`;
        }

        if (typeof window === "undefined") {
            return `/club-register/${key}`;
        }

        return `${window.location.origin}/club-register/${key}`;
    } catch (error) {
        console.error("URL 변환 오류:", error);
        return originalUrl; // 오류 시 원본 URL 반환
    }
};

export function useUrlGenerator() {
    const [isPending, startTransition] = useTransition();
    const [state, setState] = useState<GenerateUrlState>({});

    const generateUrl = useCallback(() => {
        setState({});

        startTransition(async () => {
            try {
                const response = await issueClubRegisterUrlService();

                if (!response.isSuccess) {
                    const errorMessage = response.error?.detail || "URL 생성 중 오류가 발생했습니다.";
                    setState({ success: false, error: errorMessage });
                    toast.error(errorMessage);
                    return;
                }

                // 키값 추출하여 원하는 도메인으로 변경
                const transformedUrl = transformRegisterUrl(response.result);

                const newState = { success: true, registerUrl: transformedUrl };
                setState(newState);

                try {
                    await navigator.clipboard.writeText(transformedUrl);
                    toast.success("URL이 클립보드에 복사되었습니다");
                } catch (clipboardError) {
                    console.error("URL 복사 오류:", clipboardError);
                    toast.error("URL은 생성되었지만 클립보드 복사에 실패했습니다.");
                }
            } catch (error) {
                console.error("URL 생성 오류:", error);
                const errorMessage = "URL 생성 중 오류가 발생했습니다.";
                setState({ success: false, error: errorMessage });
                toast.error(errorMessage);
            }
        });
    }, []);

    const copyUrl = useCallback(async () => {
        if (state.registerUrl) {
            try {
                await navigator.clipboard.writeText(state.registerUrl);
                toast.success("URL이 복사되었습니다!");
            } catch (error) {
                console.error("URL 복사 오류:", error);
                toast.error("클립보드 복사에 실패했습니다.");
            }
        }
    }, [state.registerUrl]);

    return { generateUrl, copyUrl, isPending, state };
}
