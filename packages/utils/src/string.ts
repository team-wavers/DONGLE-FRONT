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
