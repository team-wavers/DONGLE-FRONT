import { Response } from "../response";

//response
export type LoginResponse = Response<{
    accessToken: string;
    refreshToken: string;
    tokenType?: string;
    expiresIn?: number; // 밀리초 단위
}>;

export type LogoutResponse = Response<{
    message: string;
}>;

export type RefreshTokenResponse = Response<{
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
}>;
