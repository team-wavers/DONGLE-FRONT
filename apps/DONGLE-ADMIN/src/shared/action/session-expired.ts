const SESSION_EXPIRED_MESSAGE = "로그인 시간이 만료되었습니다. 다시 로그인해주세요.";

export function isSessionExpiredError(error: unknown): boolean {
    if (error instanceof Error && error.message === "Unauthorized") {
        return true;
    }

    if (!error || typeof error !== "object") {
        return false;
    }

    const candidate = error as {
        status?: unknown;
        message?: unknown;
        error?: { status?: unknown; message?: unknown };
    };

    return (
        candidate.status === 401 ||
        candidate.message === "Unauthorized" ||
        candidate.error?.status === 401 ||
        candidate.error?.message === "Unauthorized"
    );
}

export function getSessionExpiredActionFailure(error: unknown):
    | { formError: string; sessionExpired: true }
    | undefined {
    return isSessionExpiredError(error)
        ? { formError: SESSION_EXPIRED_MESSAGE, sessionExpired: true }
        : undefined;
}
