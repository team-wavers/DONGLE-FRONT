export interface DateTimeFormatOptions {
    timeZone?: string;
}

export interface DateTimeRequestFormatOptions extends DateTimeFormatOptions {
    separator?: "space" | "T";
}

export interface DateDisplayFormatOptions extends DateTimeFormatOptions {
    locale?: string;
}

const DEFAULT_TIME_ZONE = "Asia/Seoul";
const TIME_ZONE_OFFSET_REGEXP = /[zZ]|[+-]\d{2}:?\d{2}$/;
const DATE_TIME_WITHOUT_TIME_ZONE_REGEXP = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}/;

function padDatePart(value: number) {
    return String(value).padStart(2, "0");
}

function getDateTimeInputParts(value: string) {
    const [datePart = "", timePart = ""] = value.split(/[T ]/);
    const [year = "", month = "", day = ""] = datePart.split("-");
    const [hour = "00", minute = "00", second = "00"] = timePart.split(":");

    return {
        year,
        month,
        day,
        hour: hour.padStart(2, "0"),
        minute: minute.padStart(2, "0"),
        second: second.padStart(2, "0").slice(0, 2),
    };
}

function isDateTimeWithoutTimeZone(value: string) {
    return DATE_TIME_WITHOUT_TIME_ZONE_REGEXP.test(value) && !TIME_ZONE_OFFSET_REGEXP.test(value);
}

function getLocalDateParts(date: Date) {
    return {
        year: String(date.getFullYear()),
        month: padDatePart(date.getMonth() + 1),
        day: padDatePart(date.getDate()),
        hour: padDatePart(date.getHours()),
        minute: padDatePart(date.getMinutes()),
        second: padDatePart(date.getSeconds()),
    };
}

function getTimeZoneDateParts(value: string | Date, timeZone: string) {
    const date = typeof value === "string" ? new Date(value) : value;

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    }).formatToParts(date);
    const partMap = Object.fromEntries(parts.map((part) => [part.type, part.value]));

    return {
        year: partMap.year,
        month: partMap.month,
        day: partMap.day,
        hour: partMap.hour,
        minute: partMap.minute,
        second: partMap.second,
    };
}

function getDateParts(value: Date, timeZone?: string) {
    if (Number.isNaN(value.getTime())) {
        return null;
    }

    if (timeZone) {
        return getTimeZoneDateParts(value, timeZone);
    }

    return getLocalDateParts(value);
}

function getStringDateParts(value: string, timeZone?: string) {
    if (timeZone && isDateTimeWithoutTimeZone(value)) {
        return getDateTimeInputParts(value);
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return getDateParts(date, timeZone);
}

export function formatDateForRequest(value: Date | string | undefined, options?: DateTimeFormatOptions): string {
    if (!value) {
        return "";
    }

    const parts = typeof value === "string" ? getStringDateParts(value, options?.timeZone) : getDateParts(value, options?.timeZone);

    if (!parts) {
        return "";
    }

    return `${parts.year}-${parts.month}-${parts.day}`;
}

export function formatDateByLocale(value: string | Date, options?: DateDisplayFormatOptions) {
    const timeZone = options?.timeZone ?? DEFAULT_TIME_ZONE;

    if (typeof value === "string" && isDateTimeWithoutTimeZone(value)) {
        const parts = getDateTimeInputParts(value);
        return `${parts.year}.${parts.month}.${parts.day}`;
    }

    const date = typeof value === "string" ? new Date(value) : value;

    if (Number.isNaN(date.getTime())) {
        return "-";
    }

    return new Intl.DateTimeFormat(options?.locale ?? "ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        timeZone,
    })
        .format(date)
        .replace(/\. /g, ".")
        .replace(/\.$/, "");
}

export function formatDateRange(start: string | Date, end: string | Date, options?: DateDisplayFormatOptions) {
    const startDate = formatDateByLocale(start, options);
    const endDate = formatDateByLocale(end, options);

    if (startDate === "-" || endDate === "-") {
        return "-";
    }

    return `${startDate} ~ ${endDate}`;
}

export function formatDateTimeForRequest(
    value: Date | string | undefined,
    options?: DateTimeRequestFormatOptions
): string {
    if (!value) {
        return "";
    }

    const separator = options?.separator === "T" ? "T" : " ";

    if (typeof value === "string" && value.includes("T") && !TIME_ZONE_OFFSET_REGEXP.test(value)) {
        const parts = getDateTimeInputParts(value);
        return `${parts.year}-${parts.month}-${parts.day}${separator}${parts.hour}:${parts.minute}:${parts.second}`;
    }

    const date = typeof value === "string" ? new Date(value) : value;
    const parts = typeof value === "string" ? getStringDateParts(value, options?.timeZone) : getDateParts(date, options?.timeZone);

    if (!parts) {
        return "";
    }

    return `${parts.year}-${parts.month}-${parts.day}${separator}${parts.hour}:${parts.minute}:${parts.second}`;
}

export function formatDateTimeForInput(value: string | Date | undefined, options?: DateTimeFormatOptions): string {
    if (!value) {
        return "";
    }

    if (typeof value === "string" && options?.timeZone && isDateTimeWithoutTimeZone(value)) {
        const parts = getDateTimeInputParts(value);
        return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
    }

    const parts = getTimeZoneDateParts(value, options?.timeZone ?? DEFAULT_TIME_ZONE);

    if (!parts) {
        return "";
    }

    return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

export function formatMonthKey(date: Date, options?: DateTimeFormatOptions) {
    const parts = getDateParts(date, options?.timeZone);

    if (!parts) {
        return "";
    }

    return `${parts.year}-${parts.month}`;
}

export function parseMonthKey(monthKey: string) {
    const match = /^(\d{4})-(\d{2})$/.exec(monthKey);

    if (!match) {
        return null;
    }

    const year = Number(match[1]);
    const month = Number(match[2]);

    if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
        return null;
    }

    return new Date(year, month - 1, 1);
}

export function getMonthDateTimeRange(date: Date, options?: DateTimeFormatOptions) {
    if (!options?.timeZone) {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const monthPart = padDatePart(month);
        const lastDay = new Date(year, month, 0).getDate();

        return {
            from: `${year}-${monthPart}-01 00:00:00`,
            to: `${year}-${monthPart}-${padDatePart(lastDay)} 23:59:59`,
        };
    }

    const parts = getTimeZoneDateParts(date, options.timeZone);

    if (!parts) {
        return {
            from: "",
            to: "",
        };
    }

    const year = Number(parts.year);
    const month = Number(parts.month);
    const monthPart = padDatePart(month);
    const lastDay = new Date(year, month, 0).getDate();

    return {
        from: `${year}-${monthPart}-01 00:00:00`,
        to: `${year}-${monthPart}-${padDatePart(lastDay)} 23:59:59`,
    };
}
