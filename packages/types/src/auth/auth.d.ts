import type { AuthRole } from "./auth-role";

export interface LoginActionState {
    success?: boolean;
    error?: string;
    fieldErrors?: {
        username?: string;
        password?: string;
    };
    role?: AuthRole;
    clubId?: string;
}

export interface LoginRequest {
    login_id: string;
    password: string;
}
