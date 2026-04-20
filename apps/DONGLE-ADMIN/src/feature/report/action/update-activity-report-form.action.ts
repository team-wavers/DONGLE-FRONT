"use server";

import { updateClubReportService } from "@dongle/service/club/club.report.service";
import { revalidateTag } from "next/cache";
import { validateActivityReportInput } from "@/feature/report/validation/activity-report.validation";
import {
    buildReportUpdatePayload,
    mergeReportImageUrls,
    parseJsonStringArray,
} from "@/feature/report/validation/report-update-payload";
import { requireServerActionAccessToken } from "@/feature/shared/action/server-action-auth";
import { captureServerException } from "@/lib/sentry/capture-server-exception";
import { uploadReportImages } from "./upload-report-images";

// 서버 액션 타입 정의
export interface UpdateActivityReportActionState {
    success?: boolean;
    error?: string;
    sessionExpired?: boolean;
    fieldErrors?: {
        title?: string;
        content?: string;
        images?: string;
    };
}

// 서버 액션
export async function updateActivityReportAction(
    prevState: UpdateActivityReportActionState,
    formData: FormData
): Promise<UpdateActivityReportActionState> {
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const images = formData.getAll("images") as File[];
    const reportId = formData.get("reportId") as string;
    const clubId = formData.get("clubId") as string;
    const originalTitle = formData.get("originalTitle") as string;
    const originalContent = formData.get("originalContent") as string;
    const originalImageUrlsJson = formData.get("originalImageUrls") as string;
    const existingUrlsJson = formData.get("existingUrls") as string;
    const removedUrlsJson = formData.get("removedUrls") as string;
    let existingUrls: string[] = [];
    let removedUrls: string[] = [];
    let originalImageUrls: string[] = [];

    try {
        existingUrls = parseJsonStringArray(existingUrlsJson);
        removedUrls = parseJsonStringArray(removedUrlsJson);
        originalImageUrls = parseJsonStringArray(originalImageUrlsJson);
    } catch (error) {
        captureServerException(error, "보고서 수정 이미지 URL 파싱 오류", {
            action: "updateActivityReportAction",
        });
    }

    const { fieldErrors, isValid } = validateActivityReportInput({
        title,
        content,
    });

    if (!isValid) {
        return {
            fieldErrors,
        };
    }

    try {
        await requireServerActionAccessToken();

        let uploadedImageUrls: string[] = [];

        try {
            uploadedImageUrls = await uploadReportImages({
                clubId,
                images,
            });
        } catch (error) {
            captureServerException(error, "보고서 수정 이미지 업로드 실패", {
                action: "updateActivityReportAction",
                clubId,
                reportId,
            });
            return {
                error: "이미지 업로드에 실패했습니다. 다시 시도해주세요.",
            };
        }

        const imageUrls = mergeReportImageUrls(existingUrls, removedUrls, uploadedImageUrls);
        const updatePayload = buildReportUpdatePayload({
            title,
            content,
            imageUrls,
            originalTitle,
            originalContent,
            originalImageUrls,
        });

        if (Object.keys(updatePayload).length === 0) {
            return {
                success: false,
                error: "변경된 정보가 없습니다.",
            };
        }

        const { result, isSuccess } = await updateClubReportService(Number(clubId), Number(reportId), updatePayload);
        if (!isSuccess || !result) {
            return {
                error: "보고서 수정에 실패했습니다. 다시 시도해주세요.",
            };
        }

        revalidateTag(`report-${reportId}`);

        return {
            success: true,
        };
    } catch (error) {
        if (error instanceof Error && error.message === "Unauthorized") {
            return {
                error: "로그인 시간이 만료되었습니다. 다시 로그인해주세요.",
                sessionExpired: true,
            };
        }

        captureServerException(error, "보고서 수정 실패", {
            action: "updateActivityReportAction",
            clubId,
            reportId,
        });
        return {
            error: "보고서 수정에 실패했습니다. 다시 시도해주세요.",
        };
    }
}
