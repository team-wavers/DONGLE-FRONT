export function normalizeDateTimeToApiFormat(value: string): string {
    const normalized = value.trim().replace("T", " ");
    return normalized.length === 16 ? `${normalized}:00` : normalized;
}
