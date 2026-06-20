export type ServiceErrorLike = {
    message?: string;
    detail?: string;
};

function logServiceErrorDetail(detail: string | undefined) {
    const normalizedDetail = detail?.trim();

    if (normalizedDetail) {
        console.error(normalizedDetail);
    }
}

export function getServiceErrorMessage(error: ServiceErrorLike | undefined | null, fallback: string): string {
    logServiceErrorDetail(error?.detail);

    return error?.message || error?.detail || fallback;
}
