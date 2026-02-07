"use server";

import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE_NAME, REFRESH_TOKEN_COOKIE_NAME } from "./cookie.contant";

export const getServerCookie = async (name: string) => {
    const cookieStore = await cookies();
    return cookieStore.get(name)?.value;
};

export const setServerCookie = async (name: string, value: string) => {
    const cookieStore = await cookies();
    cookieStore.set(name, value);
};

export const deleteServerCookie = async (name: string) => {
    const cookieStore = await cookies();
    cookieStore.delete(name);
};

export const getAccessTokenFromServerCookie = async () => {
    const accessToken = await getServerCookie(ACCESS_TOKEN_COOKIE_NAME);
    return accessToken;
};

export const setAccessTokenToServerCookie = async (accessToken: string) => {
    setServerCookie(ACCESS_TOKEN_COOKIE_NAME, accessToken);
};

export const getRefreshTokenFromServerCookie = async () => {
    const refreshToken = await getServerCookie(REFRESH_TOKEN_COOKIE_NAME);
    return refreshToken;
};

export const setRefreshTokenToServerCookie = async (refreshToken: string) => {
    setServerCookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken);
};
