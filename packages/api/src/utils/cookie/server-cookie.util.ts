"use server";

import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE_NAME, REFRESH_TOKEN_COOKIE_NAME } from "./cookie.contant";

export const getServerCookie = async (name: string) => {
    const cookieStore = await cookies();
    return cookieStore.get(name)?.value;
};

export const setServerCookie = async (
    name: string,
    value: string,
    options?: {
        path?: string;
        secure?: boolean;
        sameSite?: "strict" | "lax" | "none";
        maxAge?: number;
        httpOnly?: boolean;
    }
) => {
    const cookieStore = await cookies();
    cookieStore.set(name, value, options);
};

export const deleteServerCookie = async (name: string) => {
    const cookieStore = await cookies();
    cookieStore.delete(name);
};

export const getAccessTokenFromServerCookie = async () => {
    const accessToken = await getServerCookie(ACCESS_TOKEN_COOKIE_NAME);
    return accessToken;
};

export const setAccessTokenToServerCookie = async (
    accessToken: string,
    options?: {
        path?: string;
        secure?: boolean;
        sameSite?: "strict" | "lax" | "none";
        maxAge?: number;
        httpOnly?: boolean;
    }
) => {
    await setServerCookie(ACCESS_TOKEN_COOKIE_NAME, accessToken, options);
};

export const getRefreshTokenFromServerCookie = async () => {
    const refreshToken = await getServerCookie(REFRESH_TOKEN_COOKIE_NAME);
    return refreshToken;
};

export const setRefreshTokenToServerCookie = async (
    refreshToken: string,
    options?: {
        path?: string;
        secure?: boolean;
        sameSite?: "strict" | "lax" | "none";
        maxAge?: number;
        httpOnly?: boolean;
    }
) => {
    await setServerCookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, options);
};
