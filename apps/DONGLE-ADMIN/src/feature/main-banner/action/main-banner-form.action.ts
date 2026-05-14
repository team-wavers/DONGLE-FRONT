"use server";

import {
    createMainBannerService,
    deleteMainBannerService,
    normalizeDisplayBannerLinkUrl,
    updateMainBannerService,
} from "@dongle/service/main-banner/main-banner.service";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireServerActionAccessToken } from "@/feature/shared/action/server-action-auth";
import { captureServerException } from "@/lib/sentry/capture-server-exception";
import { normalizeDateTimeToApiFormat } from "@/feature/main-banner/utils/main-banner-datetime";

export interface MainBannerActionState {
    success?: boolean;
    error?: string;
    fieldErrors?: {
        image?: string;
        publish_start_at?: string;
        publish_end_at?: string;
        link_url?: string;
        is_active?: string;
        banner_id?: string;
    };
}

interface MainBannerFormValues {
    link_url: string;
    publish_start_at: string;
    publish_end_at: string;
    is_active: boolean | null;
}

function validateMainBannerForm(values: MainBannerFormValues): MainBannerActionState["fieldErrors"] {
    const fieldErrors: MainBannerActionState["fieldErrors"] = {};
    const linkUrl = values.link_url.trim();

    if (linkUrl && !normalizeDisplayBannerLinkUrl(linkUrl)) {
        fieldErrors.link_url = "링크는 http(s) URL 또는 /로 시작하는 내부 경로만 입력할 수 있습니다.";
    }

    if (!values.publish_start_at) {
        fieldErrors.publish_start_at = "게시 시작일시를 입력해주세요.";
    }

    if (!values.publish_end_at) {
        fieldErrors.publish_end_at = "게시 종료일시를 입력해주세요.";
    }

    if (values.is_active === null) {
        fieldErrors.is_active = "사용여부를 선택해주세요.";
    }

    if (values.publish_start_at && values.publish_end_at) {
        const start = new Date(values.publish_start_at);
        const end = new Date(values.publish_end_at);

        if (Number.isNaN(start.getTime())) {
            fieldErrors.publish_start_at = "게시 시작일시 형식이 올바르지 않습니다.";
        }

        if (Number.isNaN(end.getTime())) {
            fieldErrors.publish_end_at = "게시 종료일시 형식이 올바르지 않습니다.";
        }

        if (!fieldErrors.publish_start_at && !fieldErrors.publish_end_at && start >= end) {
            fieldErrors.publish_end_at = "게시 종료일시는 게시 시작일시보다 늦어야 합니다.";
        }
    }

    return fieldErrors;
}

function normalizeLinkUrlForSubmit(value: string): string | null {
    return normalizeDisplayBannerLinkUrl(value);
}

async function resolveImageUrlForSubmit(formData: FormData): Promise<{ imageUrl?: string; error?: string }> {
    const uploadedImageUrl = (formData.get("image_uploaded_url") as string | null)?.trim() || "";
    const existingUrls = parseExistingImageUrls(formData);
    const removedUrls = parseRemovedImageUrls(formData);

    if (uploadedImageUrl) {
        return { imageUrl: uploadedImageUrl };
    }

    const availableUrls = existingUrls.filter((url) => !removedUrls.includes(url));
    if (availableUrls.length > 0) {
        return { imageUrl: availableUrls[0] };
    }

    return { error: "배너 이미지를 업로드해주세요." };
}

function parseExistingImageUrls(formData: FormData): string[] {
    const existingUrlsRaw = (formData.get("image_existing_urls") as string | null)?.trim() || "[]";

    try {
        return JSON.parse(existingUrlsRaw);
    } catch {
        return [];
    }
}

function parseRemovedImageUrls(formData: FormData): string[] {
    const removedUrlsRaw = (formData.get("image_removed_urls") as string | null)?.trim() || "[]";

    try {
        return JSON.parse(removedUrlsRaw);
    } catch {
        return [];
    }
}

export async function createMainBannerAction(
    prevState: MainBannerActionState,
    formData: FormData
): Promise<MainBannerActionState> {
    const publishStartAt = formData.get("publish_start_at") as string;
    const publishEndAt = formData.get("publish_end_at") as string;
    const linkUrl = (formData.get("link_url") as string | null) ?? "";
    const isActiveRaw = formData.get("is_active") as string | null;
    const isActive = isActiveRaw === "true" ? true : isActiveRaw === "false" ? false : null;

    const values: MainBannerFormValues = {
        link_url: linkUrl,
        publish_start_at: publishStartAt,
        publish_end_at: publishEndAt,
        is_active: isActive,
    };

    const fieldErrors = validateMainBannerForm(values);
    if (Object.keys(fieldErrors ?? {}).length > 0) {
        return { ...prevState, fieldErrors };
    }

    try {
        await requireServerActionAccessToken();

        const { imageUrl, error } = await resolveImageUrlForSubmit(formData);
        if (!imageUrl) {
            return {
                ...prevState,
                fieldErrors: {
                    ...fieldErrors,
                    image: error || "배너 이미지를 업로드해주세요.",
                },
            };
        }

        const response = await createMainBannerService({
            image_url: imageUrl,
            link_url: normalizeLinkUrlForSubmit(values.link_url),
            publish_start_at: normalizeDateTimeToApiFormat(values.publish_start_at),
            publish_end_at: normalizeDateTimeToApiFormat(values.publish_end_at),
            is_active: values.is_active as boolean,
        });

        if (!response.isSuccess) {
            return {
                ...prevState,
                error: response.error?.message || "배너 등록에 실패했습니다.",
            };
        }

        revalidateTag("main-banner");
        return {
            success: true,
        };
    } catch (error) {
        captureServerException(error, "배너 등록 중 오류", {
            action: "createMainBannerAction",
        });
        return {
            ...prevState,
            error: "배너 등록 중 오류가 발생했습니다. 다시 시도해주세요.",
        };
    }
}

export async function updateMainBannerAction(
    prevState: MainBannerActionState,
    formData: FormData
): Promise<MainBannerActionState> {
    const bannerId = formData.get("banner_id") as string;
    const publishStartAt = formData.get("publish_start_at") as string;
    const publishEndAt = formData.get("publish_end_at") as string;
    const linkUrl = (formData.get("link_url") as string | null) ?? "";
    const isActiveRaw = formData.get("is_active") as string | null;
    const isActive = isActiveRaw === "true" ? true : isActiveRaw === "false" ? false : null;

    if (!bannerId) {
        return {
            ...prevState,
            fieldErrors: {
                banner_id: "수정할 배너 ID가 없습니다.",
            },
        };
    }

    const values: MainBannerFormValues = {
        link_url: linkUrl,
        publish_start_at: publishStartAt,
        publish_end_at: publishEndAt,
        is_active: isActive,
    };

    const fieldErrors = validateMainBannerForm(values);
    if (Object.keys(fieldErrors ?? {}).length > 0) {
        return { ...prevState, fieldErrors };
    }

    try {
        await requireServerActionAccessToken();

        const { imageUrl, error } = await resolveImageUrlForSubmit(formData);
        if (!imageUrl) {
            return {
                ...prevState,
                fieldErrors: {
                    ...fieldErrors,
                    image: error || "배너 이미지를 업로드해주세요.",
                },
            };
        }

        const response = await updateMainBannerService(Number(bannerId), {
            image_url: imageUrl,
            link_url: normalizeLinkUrlForSubmit(values.link_url),
            publish_start_at: normalizeDateTimeToApiFormat(values.publish_start_at),
            publish_end_at: normalizeDateTimeToApiFormat(values.publish_end_at),
            is_active: values.is_active as boolean,
        });

        if (!response.isSuccess) {
            return {
                ...prevState,
                error: response.error?.message || "배너 수정에 실패했습니다.",
            };
        }

        revalidateTag("main-banner");
        revalidateTag(`main-banner-${bannerId}`);
        return {
            success: true,
        };
    } catch (error) {
        captureServerException(error, "배너 수정 중 오류", {
            action: "updateMainBannerAction",
            bannerId,
        });
        return {
            ...prevState,
            error: "배너 수정 중 오류가 발생했습니다. 다시 시도해주세요.",
        };
    }
}

export async function deleteMainBannerAction(id: number, _formData: FormData): Promise<void> {
    await requireServerActionAccessToken();

    const response = await deleteMainBannerService(id);

    if (!response.isSuccess) {
        throw new Error(response.error?.message || "배너 삭제에 실패했습니다.");
    }

    revalidateTag("main-banner");
    revalidateTag(`main-banner-${id}`);
    redirect("/admin/banner");
}
