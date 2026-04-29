export function trimToEmpty(value: FormDataEntryValue | string | null | undefined): string {
    if (typeof value !== "string") {
        return "";
    }

    return value.trim();
}

export function trimToNull(value: FormDataEntryValue | string | null | undefined): string | null {
    const trimmed = trimToEmpty(value);
    return trimmed ? trimmed : null;
}

export function normalizePhoneNumber(value: string): string {
    return value.replace(/\s/g, "");
}

export function isValidMobilePhoneNumber(value: string): boolean {
    const cleaned = normalizePhoneNumber(value);
    const phoneRegex = /^01[0-9]-?\d{3,4}-?\d{4}$/;

    return phoneRegex.test(cleaned);
}
