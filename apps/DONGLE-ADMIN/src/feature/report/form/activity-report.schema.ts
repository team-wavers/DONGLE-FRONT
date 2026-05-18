import { z } from "zod";
import type { ClubReport } from "@dongle/types/club/club.report";
import { validateActivityReportInput } from "@/feature/report/validation/activity-report.validation";
import {
    buildReportUpdatePayload,
    mergeReportImageUrls,
} from "@/feature/report/validation/report-update-payload";

export const activityReportSchema = z
    .object({
        title: z.string(),
        content: z.string(),
        imageUrls: z.array(z.string()),
        imageFile: z.custom<File | null>().nullable().optional(),
    })
    .superRefine((value, context) => {
        const { fieldErrors, isValid } = validateActivityReportInput({
            title: value.title,
            content: value.content,
        });

        if (isValid) {
            return;
        }

        if (fieldErrors.title) {
            context.addIssue({ code: z.ZodIssueCode.custom, path: ["title"], message: fieldErrors.title });
        }

        if (fieldErrors.content) {
            context.addIssue({ code: z.ZodIssueCode.custom, path: ["content"], message: fieldErrors.content });
        }
    });

export type ActivityReportFormValues = z.infer<typeof activityReportSchema>;
export type ActivityReportField = keyof ActivityReportFormValues;

export const ACTIVITY_REPORT_DEFAULT_VALUES: ActivityReportFormValues = {
    title: "",
    content: "",
    imageUrls: [],
    imageFile: null,
};

export function createActivityReportDefaultValues(values?: {
    title?: string;
    content?: string;
    images?: string[];
}): ActivityReportFormValues {
    return {
        title: values?.title ?? "",
        content: values?.content ?? "",
        imageUrls: values?.images ?? [],
        imageFile: null,
    };
}

export function createActivityReportDraftValues(values: ActivityReportFormValues): ActivityReportFormValues {
    return {
        ...values,
        imageFile: null,
    };
}

export function buildActivityReportUpdatePayload({
    values,
    originalReport,
    uploadedImageUrls,
}: {
    values: ActivityReportFormValues;
    originalReport: Pick<ClubReport, "title" | "content" | "image_urls">;
    uploadedImageUrls: string[];
}) {
    const imageUrls = mergeReportImageUrls(values.imageUrls, [], uploadedImageUrls);

    return buildReportUpdatePayload({
        title: values.title,
        content: values.content,
        imageUrls,
        originalTitle: originalReport.title,
        originalContent: originalReport.content,
        originalImageUrls: originalReport.image_urls ?? [],
    });
}
