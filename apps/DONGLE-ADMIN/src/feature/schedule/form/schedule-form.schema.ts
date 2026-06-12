import { z } from "zod";
import type { CreateClubScheduleRequest } from "@dongle/types/club/club.schedule";
import { formatDateTimeForInput, formatDateTimeForRequest, normalizeExternalUrl, trimToEmpty } from "@dongle/utils";
import type { ClubSchedule, ScheduleType } from "../schedule.types";

const SCHEDULE_EXTERNAL_URL_ERROR = "외부 링크는 http 또는 https URL로 입력해주세요.";

export interface ClubSchedulePayloadForm {
    title: string | null | undefined;
    type: ScheduleType;
    startsAt: string;
    endsAt: string;
    location: string | null | undefined;
    description: string | null | undefined;
    isPublic: boolean;
    externalUrl?: string | null | undefined;
}

function toSchedulePayloadText(value: string | null | undefined) {
    return value?.trim() ?? "";
}

function isValidDateTimeInput(value: string) {
    const match = value.match(
        /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?$/
    );

    if (!match) {
        return false;
    }

    const parts = {
        year: Number(match[1]),
        month: Number(match[2]),
        day: Number(match[3]),
        hour: Number(match[4]),
        minute: Number(match[5]),
        second: Number(match[6] ?? "0"),
    };
    const date = new Date(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second, 0);

    return (
        date.getFullYear() === parts.year &&
        date.getMonth() === parts.month - 1 &&
        date.getDate() === parts.day &&
        date.getHours() === parts.hour &&
        date.getMinutes() === parts.minute &&
        date.getSeconds() === parts.second
    );
}

export function getScheduleExternalUrlError(value: string | null | undefined) {
    const trimmedValue = value?.trim();

    if (!trimmedValue) {
        return null;
    }

    return normalizeExternalUrl(trimmedValue) ? null : SCHEDULE_EXTERNAL_URL_ERROR;
}

function getScheduleExternalUrlPayloadValue(value: string | null | undefined) {
    const trimmedValue = value?.trim();

    if (!trimmedValue) {
        return "";
    }

    const normalizedUrl = normalizeExternalUrl(trimmedValue);

    if (!normalizedUrl) {
        throw new Error(SCHEDULE_EXTERNAL_URL_ERROR);
    }

    return normalizedUrl;
}

export const CLUB_SCHEDULE_DEFAULT_VALUES = {
    title: "",
    type: "event",
    startsAt: "",
    endsAt: "",
    location: "",
    description: "",
    isPublic: true,
    externalUrl: "",
} satisfies ClubSchedulePayloadForm;

export const clubScheduleSchema = z
    .object({
        title: z.string().transform(trimToEmpty),
        type: z.enum(["recruitment", "event", "regular_meeting"]),
        startsAt: z.string().transform(trimToEmpty),
        endsAt: z.string().transform(trimToEmpty),
        location: z.string().transform(trimToEmpty),
        description: z.string().transform(trimToEmpty),
        isPublic: z.boolean(),
        externalUrl: z.string().transform(trimToEmpty),
    })
    .superRefine((value, context) => {
        if (!value.title) {
            context.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["title"],
                message: "일정 제목을 입력해주세요.",
            });
        }

        if (!value.startsAt) {
            context.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["startsAt"],
                message: "시작일시를 입력해주세요.",
            });
        } else if (!isValidDateTimeInput(value.startsAt)) {
            context.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["startsAt"],
                message: "시작일시 형식이 올바르지 않습니다.",
            });
        }

        if (!value.endsAt) {
            context.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["endsAt"],
                message: "종료일시를 입력해주세요.",
            });
        } else if (!isValidDateTimeInput(value.endsAt)) {
            context.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["endsAt"],
                message: "종료일시 형식이 올바르지 않습니다.",
            });
        }

        const externalUrlError = getScheduleExternalUrlError(value.externalUrl);
        if (externalUrlError) {
            context.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["externalUrl"],
                message: externalUrlError,
            });
        }

        if (isValidDateTimeInput(value.startsAt) && isValidDateTimeInput(value.endsAt)) {
            const start = new Date(value.startsAt);
            const end = new Date(value.endsAt);

            if (start > end) {
                context.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["endsAt"],
                    message: "종료일시는 시작일시보다 늦어야 합니다.",
                });
            }
        }
    });

export type ClubScheduleFormValues = z.infer<typeof clubScheduleSchema>;
export type ClubScheduleField = keyof ClubScheduleFormValues;

export function createClubScheduleDefaultValues(schedule?: ClubSchedule | null): ClubScheduleFormValues {
    if (!schedule) {
        return CLUB_SCHEDULE_DEFAULT_VALUES;
    }

    return {
        title: schedule.title,
        type: schedule.type,
        startsAt: formatDateTimeForInput(schedule.startsAt),
        endsAt: formatDateTimeForInput(schedule.endsAt),
        location: schedule.location,
        description: schedule.description,
        isPublic: schedule.isPublic,
        externalUrl: schedule.externalUrl ?? "",
    };
}

export function buildClubSchedulePayload(form: ClubSchedulePayloadForm): CreateClubScheduleRequest {
    return {
        title: toSchedulePayloadText(form.title),
        type: form.type,
        start_at: formatDateTimeForRequest(form.startsAt),
        end_at: formatDateTimeForRequest(form.endsAt),
        is_public: form.isPublic,
        location: toSchedulePayloadText(form.location),
        description: toSchedulePayloadText(form.description),
        external_url: getScheduleExternalUrlPayloadValue(form.externalUrl),
    };
}
