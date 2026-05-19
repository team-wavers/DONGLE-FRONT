import { formatDateForRequest, formatDateTimeForRequest } from "@dongle/utils";

export function formatDatePickerValue(date: Date | undefined, options?: { includeTime?: boolean }): string {
    return options?.includeTime ? formatDateTimeForRequest(date) : formatDateForRequest(date);
}
