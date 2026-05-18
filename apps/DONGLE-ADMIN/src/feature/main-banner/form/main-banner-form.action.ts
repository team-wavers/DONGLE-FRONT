"use server";

import {
    createMainBannerService,
    updateMainBannerService,
    uploadMainBannerImageService,
} from "@dongle/service/main-banner/main-banner.service";
import { revalidateTag } from "next/cache";
import { actionFailure, actionSuccess, getZodFieldErrors, type ActionResult } from "@/shared/action";
import { requireServerActionAccessToken } from "@/shared/action/server-action-auth";
import { captureServerException } from "@/lib/sentry/capture-server-exception";
import {
    buildMainBannerPayload,
    mainBannerSchema,
    type MainBannerField,
    type MainBannerFormValues,
} from "./main-banner-form.schema";

type MainBannerActionResult = ActionResult<MainBannerField>;

async function resolveMainBannerImageUrl(values: MainBannerFormValues): Promise<{
    imageUrl?: string;
    fieldError?: string;
}> {
    if (values.imageFile && values.imageFile.size > 0) {
        const response = await uploadMainBannerImageService(values.imageFile);

        if (!response.isSuccess || !response.result?.image_url) {
            return {
                fieldError: response.error?.message || "배너 이미지 업로드에 실패했습니다.",
            };
        }

        return {
            imageUrl: response.result.image_url,
        };
    }

    if (values.imageUrls[0]) {
        return {
            imageUrl: values.imageUrls[0],
        };
    }

    return {
        fieldError: "배너 이미지를 업로드해주세요.",
    };
}

function getActionErrorMessage(error: unknown, fallback: string): string {
    return error instanceof Error && error.message ? error.message : fallback;
}

export async function submitMainBannerCreateAction(values: MainBannerFormValues): Promise<MainBannerActionResult> {
    const parsed = mainBannerSchema.safeParse(values);

    if (!parsed.success) {
        return actionFailure({
            fieldErrors: getZodFieldErrors<MainBannerField>(parsed.error),
            formError: "배너 정보를 다시 확인해주세요.",
        });
    }

    try {
        await requireServerActionAccessToken();

        const { imageUrl, fieldError } = await resolveMainBannerImageUrl(parsed.data);
        if (!imageUrl) {
            return actionFailure({
                formError: fieldError || "배너 이미지를 업로드해주세요.",
                fieldErrors: {
                    imageUrls: fieldError || "배너 이미지를 업로드해주세요.",
                },
            });
        }

        const response = await createMainBannerService(buildMainBannerPayload(parsed.data, imageUrl));

        if (!response.isSuccess) {
            return actionFailure({
                formError: response.error?.message || "배너 등록에 실패했습니다.",
            });
        }

        revalidateTag("main-banner");
        return actionSuccess({
            message: "배너가 등록되었습니다.",
            redirectTo: "/admin/banner",
        });
    } catch (error) {
        captureServerException(error, "배너 등록 중 오류", {
            action: "submitMainBannerCreateAction",
        });
        return actionFailure({
            formError: getActionErrorMessage(error, "배너 등록 중 오류가 발생했습니다. 다시 시도해주세요."),
        });
    }
}

export async function submitMainBannerUpdateAction({
    bannerId,
    values,
}: {
    bannerId: number;
    values: MainBannerFormValues;
}): Promise<MainBannerActionResult> {
    if (!Number.isFinite(bannerId)) {
        return actionFailure({
            formError: "수정할 배너 ID가 없습니다.",
        });
    }

    const parsed = mainBannerSchema.safeParse(values);

    if (!parsed.success) {
        return actionFailure({
            fieldErrors: getZodFieldErrors<MainBannerField>(parsed.error),
            formError: "배너 정보를 다시 확인해주세요.",
        });
    }

    try {
        await requireServerActionAccessToken();

        const { imageUrl, fieldError } = await resolveMainBannerImageUrl(parsed.data);
        if (!imageUrl) {
            return actionFailure({
                formError: fieldError || "배너 이미지를 업로드해주세요.",
                fieldErrors: {
                    imageUrls: fieldError || "배너 이미지를 업로드해주세요.",
                },
            });
        }

        const response = await updateMainBannerService(bannerId, buildMainBannerPayload(parsed.data, imageUrl));

        if (!response.isSuccess) {
            return actionFailure({
                formError: response.error?.message || "배너 수정에 실패했습니다.",
            });
        }

        revalidateTag("main-banner");
        revalidateTag(`main-banner-${bannerId}`);
        return actionSuccess({
            message: "배너가 수정되었습니다.",
            redirectTo: "/admin/banner",
        });
    } catch (error) {
        captureServerException(error, "배너 수정 중 오류", {
            action: "submitMainBannerUpdateAction",
            bannerId,
        });
        return actionFailure({
            formError: getActionErrorMessage(error, "배너 수정 중 오류가 발생했습니다. 다시 시도해주세요."),
        });
    }
}
