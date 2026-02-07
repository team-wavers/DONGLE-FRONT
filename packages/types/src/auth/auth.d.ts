export interface LoginActionState {
    success?: boolean;
    error?: string;
    fieldErrors?: {
        username?: string;
        password?: string;
    };
    role?: "admin" | "club";
    clubId?: string;
}

export interface LoginRequest {
    login_id: string;
    password: string;
}
