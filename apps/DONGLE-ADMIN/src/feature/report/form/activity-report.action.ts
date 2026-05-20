"use server";

import { reportTagGroups } from "@dongle/service";
import { actionFailure, actionSuccess, getZodFieldErrors, type ActionResult } from "@/shared/action";
import { requireServerActionAccessToken } from "@/shared/action/server-action-auth";
import { captureServerException } from "@/lib/sentry/capture-server-exception";
import { revalidateTags } from "@/lib/server/revalidate-tags";
import { reportActionNetwork } from "@/feature/report/action/report-action-network";
import { buildReportActionError, isUnauthorizedError } from "@/feature/report/action/report-action-error-policy";
import {
    activityReportSchema,
    buildActivityReportUpdatePayload,
    type ActivityReportField,
    type ActivityReportFormValues,
} from "./activity-report.schema";

type ActivityReportResult = ActionResult<ActivityReportField>;

function toActionFailure(error: ReturnType<typeof buildReportActionError>): ActivityReportResult {
    return actionFailure({
        formError: error.error,
        sessionExpired: error.sessionExpired,
        errorType: error.errorType,
        retryable: error.retryable,
        retryHint: error.retryHint,
    });
}

function getImages(values: ActivityReportFormValues): File[] {
    return values.imageFile ? [values.imageFile] : [];
}

export async function submitActivityReportCreateAction({
    clubId,
    values,
}: {
    clubId: string;
    values: ActivityReportFormValues;
}): Promise<ActivityReportResult> {
    const parsed = activityReportSchema.safeParse(values);

    if (!parsed.success) {
        return actionFailure({
            fieldErrors: getZodFieldErrors<ActivityReportField>(parsed.error),
            formError: "활동보고서 내용을 다시 확인해주세요.",
        });
    }

    try {
        await requireServerActionAccessToken();

        let imageUrls: string[] = [];
        try {
            imageUrls = await reportActionNetwork.uploadImages({ clubId, images: getImages(parsed.data) });
        } catch (error) {
            captureServerException(error, "활동보고서 이미지 업로드 실패", {
                action: "submitActivityReportCreateAction",
                clubId,
            });
            return toActionFailure(buildReportActionError({ branch: "upload", actionLabel: "create" }));
        }

        const response = await reportActionNetwork.createReport(Number(clubId), {
            title: parsed.data.title,
            content: parsed.data.content,
            image_urls: imageUrls,
        });

        if (!response.isSuccess) {
            return toActionFailure(buildReportActionError({ branch: "service", actionLabel: "create" }));
        }

        revalidateTags(reportTagGroups.club(clubId));
        return actionSuccess({ message: "활동 보고서가 성공적으로 등록되었습니다!" });
    } catch (error) {
        if (isUnauthorizedError(error)) {
            return toActionFailure(buildReportActionError({ branch: "auth", actionLabel: "create" }));
        }

        captureServerException(error, "활동보고서 생성 실패", {
            action: "submitActivityReportCreateAction",
            clubId,
        });
        return toActionFailure(buildReportActionError({ branch: "exception", actionLabel: "create" }));
    }
}

export async function submitActivityReportUpdateAction({
    clubId,
    reportId,
    values,
    originalReport,
}: {
    clubId: string;
    reportId: string;
    values: ActivityReportFormValues;
    originalReport: {
        title: string;
        content: string;
        image_urls: string[];
    };
}): Promise<ActivityReportResult> {
    const parsed = activityReportSchema.safeParse(values);

    if (!parsed.success) {
        return actionFailure({
            fieldErrors: getZodFieldErrors<ActivityReportField>(parsed.error),
            formError: "활동보고서 내용을 다시 확인해주세요.",
        });
    }

    try {
        await requireServerActionAccessToken();

        let uploadedImageUrls: string[] = [];
        try {
            uploadedImageUrls = await reportActionNetwork.uploadImages({ clubId, images: getImages(parsed.data) });
        } catch (error) {
            captureServerException(error, "보고서 수정 이미지 업로드 실패", {
                action: "submitActivityReportUpdateAction",
                clubId,
                reportId,
            });
            return toActionFailure(buildReportActionError({ branch: "upload", actionLabel: "update" }));
        }

        const updatePayload = buildActivityReportUpdatePayload({
            values: parsed.data,
            originalReport,
            uploadedImageUrls,
        });

        if (Object.keys(updatePayload).length === 0) {
            return actionFailure({ formError: "변경된 정보가 없습니다." });
        }

        const { isSuccess, result } = await reportActionNetwork.updateReport(
            Number(clubId),
            Number(reportId),
            updatePayload
        );
        if (!isSuccess || !result) {
            return toActionFailure(buildReportActionError({ branch: "service", actionLabel: "update" }));
        }

        revalidateTags(reportTagGroups.item(clubId, reportId));
        return actionSuccess({ message: "활동 보고서가 성공적으로 수정되었습니다!" });
    } catch (error) {
        if (isUnauthorizedError(error)) {
            return toActionFailure(buildReportActionError({ branch: "auth", actionLabel: "update" }));
        }

        captureServerException(error, "보고서 수정 실패", {
            action: "submitActivityReportUpdateAction",
            clubId,
            reportId,
        });
        return toActionFailure(buildReportActionError({ branch: "exception", actionLabel: "update" }));
    }
}
