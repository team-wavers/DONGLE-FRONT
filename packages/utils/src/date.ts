export interface DateTimeFormatOptions {
    timeZone?: string;
}

export interface DateTimeRequestFormatOptions extends DateTimeFormatOptions {
    separator?: "space" | "T";
}

const DEFAULT_TIME_ZONE = "Asia/Seoul";

function padDatePart(value: number) {
    return String(value).padStart(2, "0");
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
    if (timeZone) {
        return getTimeZoneDateParts(value, timeZone);
    }

    return getLocalDateParts(value);
}

function getTimeZoneOffsetMs(date: Date, timeZone: string) {
    const parts = getTimeZoneDateParts(date, timeZone);

    if (!parts) {
        return 0;
    }

    const timeZoneAsUtc = Date.UTC(
        Number(parts.year),
        Number(parts.month) - 1,
        Number(parts.day),
        Number(parts.hour),
        Number(parts.minute),
        Number(parts.second)
    );

    const dateWithoutMilliseconds = Math.trunc(date.getTime() / 1000) * 1000;

    return timeZoneAsUtc - dateWithoutMilliseconds;
}

function getDateInTimeZone(parts: {
    year: number;
    monthIndex: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
    millisecond: number;
}, timeZone: string) {
    const utcTime = Date.UTC(
        parts.year,
        parts.monthIndex,
        parts.day,
        parts.hour,
        parts.minute,
        parts.second,
        parts.millisecond
    );
    const firstOffset = getTimeZoneOffsetMs(new Date(utcTime), timeZone);
    const firstGuess = utcTime - firstOffset;
    const secondOffset = getTimeZoneOffsetMs(new Date(firstGuess), timeZone);

    return new Date(utcTime - secondOffset);
}

function normalizeDateTimeInputParts(value: string) {
    const [datePart = "", timePart = ""] = value.split("T");
    const [hour = "00", minute = "00", second = "00"] = timePart.split(":");

    return {
        datePart,
        hour: hour.padStart(2, "0"),
        minute: minute.padStart(2, "0"),
        second: second.padStart(2, "0"),
    };
}

export function formatDateForRequest(date: Date | undefined, options?: DateTimeFormatOptions): string {
    if (!date) {
        return "";
    }

    const parts = getDateParts(date, options?.timeZone);

    if (!parts) {
        return "";
    }

    return `${parts.year}-${parts.month}-${parts.day}`;
}

export function formatDateTimeForRequest(
    value: Date | string | undefined,
    options?: DateTimeRequestFormatOptions
): string {
    if (!value) {
        return "";
    }

    const separator = options?.separator === "T" ? "T" : " ";

    if (typeof value === "string" && value.includes("T") && !/[zZ]|[+-]\d{2}:?\d{2}$/.test(value)) {
        const parts = normalizeDateTimeInputParts(value);
        return `${parts.datePart}${separator}${parts.hour}:${parts.minute}:${parts.second}`;
    }

    const date = typeof value === "string" ? new Date(value) : value;
    const parts = getDateParts(date, options?.timeZone);

    if (!parts) {
        return "";
    }

    return `${parts.year}-${parts.month}-${parts.day}${separator}${parts.hour}:${parts.minute}:${parts.second}`;
}

export function formatDateTimeForInput(value: string | Date | undefined, options?: DateTimeFormatOptions): string {
    if (!value) {
        return "";
    }

    const parts = getTimeZoneDateParts(value, options?.timeZone ?? DEFAULT_TIME_ZONE);

    if (!parts) {
        return "";
    }

    return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

export function getMonthDateTimeRange(date: Date, options?: DateTimeFormatOptions) {
    const formatRangeDateTime = (value: Date) => formatDateTimeForRequest(value, options);

    if (!options?.timeZone) {
        const from = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
        const to = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 0);

        return {
            from: formatRangeDateTime(from),
            to: formatRangeDateTime(to),
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
    const monthIndex = Number(parts.month) - 1;
    const from = getDateInTimeZone(
        {
            year,
            monthIndex,
            day: 1,
            hour: 0,
            minute: 0,
            second: 0,
            millisecond: 0,
        },
        options.timeZone
    );
    const to = getDateInTimeZone(
        {
            year,
            monthIndex: monthIndex + 1,
            day: 0,
            hour: 23,
            minute: 59,
            second: 59,
            millisecond: 0,
        },
        options.timeZone
    );

    return {
        from: formatRangeDateTime(from),
        to: formatRangeDateTime(to),
    };
}
