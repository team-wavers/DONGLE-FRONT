export async function requestLogout(): Promise<{ isSuccess: boolean }> {
    try {
        const response = await fetch("/api/auth/logout", { method: "POST" });
        return { isSuccess: response.ok };
    } catch {
        return { isSuccess: false };
    }
}
