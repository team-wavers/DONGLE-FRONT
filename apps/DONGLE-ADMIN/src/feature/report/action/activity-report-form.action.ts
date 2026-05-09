"use server";

import { revalidateTag } from "next/cache";
import { validateActivityReportInput } from "@/feature/report/validation/activity-report.validation";
import { requireServerActionAccessToken } from "@/feature/shared/action/server-action-auth";
import { captureServerException } from "@/lib/sentry/capture-server-exception";
import { reportActionNetwork } from "./report-action-network";
import { buildReportActionError, isUnauthorizedError, type ReportActionErrorResult } from "./report-action-error-policy";

// 서버 액션 타입 정의
export interface ActivityReportActionState {
  success?: boolean;
  error?: ReportActionErrorResult["error"];
  sessionExpired?: ReportActionErrorResult["sessionExpired"];
  errorType?: ReportActionErrorResult["errorType"];
  retryable?: ReportActionErrorResult["retryable"];
  retryHint?: ReportActionErrorResult["retryHint"];
  fieldErrors?: {
    title?: string;
    content?: string;
    reportDate?: string;
    images?: string;
  };
}

// 서버 액션
export async function activityReportAction(
  prevState: ActivityReportActionState,
  formData: FormData
): Promise<ActivityReportActionState> {
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const clubId = formData.get("clubId") as string;
  const images = formData.getAll("images") as File[];

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

    let imageUrls: string[] = [];

    try {
      imageUrls = await reportActionNetwork.uploadImages({
        clubId,
        images,
      });
    } catch (error) {
      captureServerException(error, "활동보고서 이미지 업로드 실패", {
        action: "activityReportAction",
        clubId,
      });
      return buildReportActionError({ branch: "upload", actionLabel: "create" });
    }

    const response = await reportActionNetwork.createReport(Number(clubId), {
      title,
      content,
      image_urls: imageUrls,
    });

    if (response.isSuccess) {
      // 보고서 목록 캐시 초기화
      revalidateTag("report");
      return { success: true };
    } else {
      return buildReportActionError({ branch: "service", actionLabel: "create" });
    }
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return buildReportActionError({ branch: "auth", actionLabel: "create" });
    }

    captureServerException(error, "활동보고서 생성 실패", {
      action: "activityReportAction",
      clubId,
    });
    return buildReportActionError({ branch: "exception", actionLabel: "create" });
  }
}
