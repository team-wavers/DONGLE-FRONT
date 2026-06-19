export type ServiceErrorLike = {
    message?: string;
    detail?: string;
};

export function getServiceErrorMessage(error: ServiceErrorLike | undefined | null, fallback: string): string {
    return error?.message || error?.detail || fallback;
}
