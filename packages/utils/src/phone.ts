export function normalizePhoneNumber(value: string): string {
    return value.replace(/\s/g, "");
}

export function formatMobilePhoneNumber(value: string): string {
    const digits = value.replace(/\D/g, "");

    if (digits.length === 10) {
        return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
    }

    if (digits.length === 11) {
        return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
    }

    return value;
}

export function isValidMobilePhoneNumber(value: string): boolean {
    const cleaned = normalizePhoneNumber(value);
    const phoneRegex = /^01[0-9]-?\d{3,4}-?\d{4}$/;

    return phoneRegex.test(cleaned);
}
