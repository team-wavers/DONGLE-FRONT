import { LoginResponse, LogoutResponse, RefreshTokenResponse } from "@dongle/types/auth/auth.response";
import FetchInstance from "@dongle/api/instance";
import { LoginRequest } from "@dongle/types/auth/auth";

const instance = FetchInstance.getInstance();

export const loginService = async ({ login_id, password }: LoginRequest): Promise<LoginResponse> => {
    const response = await instance.post("/auth/login", {
        login_id,
        password,
    });
    return response as LoginResponse;
};

export const logoutService = async (): Promise<LogoutResponse> => {
    const response = await instance.post("/auth/logout", {});
    return response as LogoutResponse;
};

export const refreshTokenService = async ({
    refreshToken,
}: {
    refreshToken: string;
}): Promise<RefreshTokenResponse> => {
    const response = await instance.post("/auth/refresh", {
        refreshToken,
    });
    return response as RefreshTokenResponse;
};
