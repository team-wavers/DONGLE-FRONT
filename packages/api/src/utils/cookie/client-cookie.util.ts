"use client";

import Cookies from "js-cookie";
import {
  ACCESS_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
} from "./cookie.contant";

export const getClientCookie = (name: string) => {
  if (typeof window === "undefined") return null;
  return Cookies.get(name);
};

export const setClientCookie = (name: string, value: string) => {
  if (typeof window === "undefined") return;
  Cookies.set(name, value);
};

export const deleteClientCookie = (name: string) => {
  if (typeof window === "undefined") return;
  Cookies.remove(name);
};

export const getAccessTokenFromClientCookie = () => {
  return getClientCookie(ACCESS_TOKEN_COOKIE_NAME);
};

export const getRefreshTokenFromClientCookie = () => {
  return getClientCookie(REFRESH_TOKEN_COOKIE_NAME);
};
