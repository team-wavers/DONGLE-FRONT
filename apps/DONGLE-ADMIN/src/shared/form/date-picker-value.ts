import { format } from "date-fns";

export function formatDatePickerValue(date: Date | undefined, options?: { includeTime?: boolean }): string {
    if (!date) {
        return "";
    }

    return format(date, options?.includeTime ? "yyyy-MM-dd HH:mm:ss" : "yyyy-MM-dd");
}
