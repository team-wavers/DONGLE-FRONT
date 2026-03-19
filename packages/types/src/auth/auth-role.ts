export const AUTH_ROLE = {
    ADMIN: "admin",
    PRESIDENT: "president",
} as const;

export type AuthRole = (typeof AUTH_ROLE)[keyof typeof AUTH_ROLE];
