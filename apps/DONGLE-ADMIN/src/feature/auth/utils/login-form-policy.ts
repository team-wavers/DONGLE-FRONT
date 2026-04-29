import type { LoginActionState } from "@dongle/types/auth/auth";

export type LoginFieldErrors = { username?: string; password?: string };

export function normalizeUsernameInput(rawValue: FormDataEntryValue | null): string {
    return typeof rawValue === "string" ? rawValue.trim() : "";
}

export function preservePasswordInput(rawValue: FormDataEntryValue | null): string {
    return typeof rawValue === "string" ? rawValue : "";
}

export function validateLoginFields(username: string, password: string): LoginFieldErrors {
    const fieldErrors: LoginFieldErrors = {};

    if (!username) fieldErrors.username = "아이디를 입력해주세요";
    if (!password) fieldErrors.password = "비밀번호를 입력해주세요";

    return fieldErrors;
}

export function toFieldErrorState(fieldErrors: LoginFieldErrors): LoginActionState {
    return { fieldErrors };
}

export function mapLoginActionError(error: unknown): LoginActionState {
    if (error instanceof Error) {
        return {
            success: false,
            error: error.message,
        };
    }

    return {
        success: false,
        error: "로그인 처리 중 오류가 발생했습니다.",
    };
}
