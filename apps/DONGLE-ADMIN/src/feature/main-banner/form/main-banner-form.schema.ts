import { z } from "zod";
import type {
    CreateMainBannerRequest,
    UpdateMainBannerRequest,
} from "@dongle/types/main-banner/main-banner.response";
import type { MainBanner } from "@dongle/types/main-banner/main-banner";
import { normalizeDisplayBannerLinkUrl } from "@dongle/service/main-banner/main-banner.service";
import { formatDateTimeForInput, trimToEmpty } from "@dongle/utils";
import { normalizeDateTimeToApiFormat } from "@/feature/main-banner/utils/main-banner-datetime";

export const mainBannerSchema = z
    .object({
        imageUrls: z.array(z.string()),
        imageFile: z.custom<File | null>().nullable().optional(),
        link_url: z.string().transform(trimToEmpty),
        publish_start_at: z.string().transform(trimToEmpty),
        publish_end_at: z.string().transform(trimToEmpty),
        is_active: z.boolean(),
    })
    .superRefine((value, context) => {
        const hasExistingImage = value.imageUrls.length > 0;
        const hasNewImage = Boolean(value.imageFile && value.imageFile.size > 0);

        if (!hasExistingImage && !hasNewImage) {
            context.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["imageUrls"],
                message: "배너 이미지를 업로드해주세요.",
            });
        }

        if (value.link_url && !normalizeDisplayBannerLinkUrl(value.link_url)) {
            context.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["link_url"],
                message: "링크는 http(s) URL 또는 /로 시작하는 내부 경로만 입력할 수 있습니다.",
            });
        }

        if (!value.publish_start_at) {
            context.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["publish_start_at"],
                message: "게시 시작일시를 입력해주세요.",
            });
        }

        if (!value.publish_end_at) {
            context.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["publish_end_at"],
                message: "게시 종료일시를 입력해주세요.",
            });
        }

        if (value.publish_start_at && value.publish_end_at) {
            const start = new Date(value.publish_start_at);
            const end = new Date(value.publish_end_at);

            if (Number.isNaN(start.getTime())) {
                context.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["publish_start_at"],
                    message: "게시 시작일시 형식이 올바르지 않습니다.",
                });
            }

            if (Number.isNaN(end.getTime())) {
                context.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["publish_end_at"],
                    message: "게시 종료일시 형식이 올바르지 않습니다.",
                });
            }

            if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && start >= end) {
                context.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["publish_end_at"],
                    message: "게시 종료일시는 게시 시작일시보다 늦어야 합니다.",
                });
            }
        }
    });

export type MainBannerFormValues = z.infer<typeof mainBannerSchema>;
export type MainBannerField = keyof MainBannerFormValues;

export const MAIN_BANNER_DEFAULT_VALUES: MainBannerFormValues = {
    imageUrls: [],
    imageFile: null,
    link_url: "",
    publish_start_at: "",
    publish_end_at: "",
    is_active: true,
};

export function createMainBannerDefaultValues(initialData?: Partial<MainBanner>): MainBannerFormValues {
    return {
        imageUrls: initialData?.image_url ? [initialData.image_url] : [],
        imageFile: null,
        link_url: initialData?.link_url ?? "",
        publish_start_at: formatDateTimeForInput(initialData?.publish_start_at),
        publish_end_at: formatDateTimeForInput(initialData?.publish_end_at),
        is_active: initialData?.is_active ?? true,
    };
}

export function createMainBannerDraftValues(values: MainBannerFormValues): MainBannerFormValues {
    return {
        ...values,
        imageFile: null,
    };
}

export function buildMainBannerPayload(
    values: MainBannerFormValues,
    imageUrl: string
): CreateMainBannerRequest | UpdateMainBannerRequest {
    return {
        image_url: imageUrl,
        link_url: normalizeDisplayBannerLinkUrl(values.link_url),
        publish_start_at: normalizeDateTimeToApiFormat(values.publish_start_at),
        publish_end_at: normalizeDateTimeToApiFormat(values.publish_end_at),
        is_active: values.is_active,
    };
}
