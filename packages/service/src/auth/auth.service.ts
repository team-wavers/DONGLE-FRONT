import { LoginResponse, LogoutResponse, RefreshTokenResponse } from "@dongle/types/auth/auth.response";
import FetchInstance from "@dongle/api/instance";
import { LoginRequest } from "@dongle/types/auth/auth";

const instance = FetchInstance.getInstance();

export const loginService = async ({ login_id, password }: LoginRequest): Promise<LoginResponse> => {
    return instance.post<LoginResponse>(
        "/auth/login",
        {
            login_id,
            password,
        },
        { skipAuthRefresh: true }
    );
};

export const logoutService = async (): Promise<LogoutResponse> => {
    return instance.post<LogoutResponse>("/auth/logout", {}, { skipAuthRefresh: true });
};

export const refreshTokenService = async ({
    refreshToken,
}: {
    refreshToken: string;
}): Promise<RefreshTokenResponse> => {
    return instance.post<RefreshTokenResponse>(
        "/auth/refresh",
        {
            refreshToken,
        },
        { skipAuthRefresh: true }
    );
};
