declare module "js-cookie" {
  export interface CookieAttributes {
    path?: string;
    domain?: string;
    expires?: number | Date;
    sameSite?: "lax" | "strict" | "none";
    secure?: boolean;
    maxAge?: number;
  }

  const Cookies: {
    get(name: string): string | undefined;
    set(name: string, value: string, options?: CookieAttributes): void;
    remove(name: string, options?: CookieAttributes): void;
  };

  export default Cookies;
}

declare module "jose" {
  export function decodeJwt(token: string): Record<string, unknown>;
}
