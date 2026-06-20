import { formatDateForRequest, formatDateTimeForRequest } from "@dongle/utils";

export function formatDatePickerValue(date: Date | undefined, options?: { includeTime?: boolean }): string {
    return options?.includeTime ? formatDateTimeForRequest(date) : formatDateForRequest(date);
}

function parseNumericDateParts(value: RegExpMatchArray) {
    return {
        year: Number(value[1]),
        month: Number(value[2]),
        day: Number(value[3]),
        hour: Number(value[4] ?? "0"),
        minute: Number(value[5] ?? "0"),
        second: Number(value[6] ?? "0"),
    };
}

function isSameLocalDateParts(
    date: Date,
    parts: {
        year: number;
        month: number;
        day: number;
        hour: number;
        minute: number;
        second: number;
    }
) {
    return (
        date.getFullYear() === parts.year &&
        date.getMonth() === parts.month - 1 &&
        date.getDate() === parts.day &&
        date.getHours() === parts.hour &&
        date.getMinutes() === parts.minute &&
        date.getSeconds() === parts.second
    );
}

export function parseDatePickerValue(value: string | Date | undefined): Date | undefined {
    if (!value) {
        return undefined;
    }

    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? undefined : value;
    }

    const trimmedValue = value.trim();
    if (!trimmedValue) {
        return undefined;
    }

    const localDateTimeMatch = trimmedValue.match(
        /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?$/
    );

    if (localDateTimeMatch) {
        const parts = parseNumericDateParts(localDateTimeMatch);
        const date = new Date(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second, 0);

        return isSameLocalDateParts(date, parts) ? date : undefined;
    }

    const date = new Date(trimmedValue);
    return Number.isNaN(date.getTime()) ? undefined : date;
}
