"use server";

import {
  createClubReportService,
} from "@dongle/service/club/club.report.service";
import { revalidateTag } from "next/cache";
import { validateActivityReportInput } from "@/feature/report/validation/activity-report.validation";
import { requireServerActionAccessToken } from "@/feature/shared/action/server-action-auth";
import { captureServerException } from "@/lib/sentry/capture-server-exception";
import { uploadReportImages } from "./upload-report-images";

// 서버 액션 타입 정의
export interface ActivityReportActionState {
  success?: boolean;
  error?: string;
  sessionExpired?: boolean;
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
      imageUrls = await uploadReportImages({
        clubId,
        images,
      });
    } catch (error) {
      captureServerException(error, "활동보고서 이미지 업로드 실패", {
        action: "activityReportAction",
        clubId,
      });
      return {
        error: "이미지 업로드에 실패했습니다. 다시 시도해주세요.",
      };
    }

    const response = await createClubReportService(Number(clubId), {
      title,
      content,
      image_urls: imageUrls,
    });

    if (response.isSuccess) {
      // 보고서 목록 캐시 초기화
      revalidateTag("report");
      return { success: true };
    } else {
      return { error: "활동보고서 생성에 실패했습니다. 다시 시도해주세요." };
    }
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return {
        error: "로그인 시간이 만료되었습니다. 다시 로그인해주세요.",
        sessionExpired: true,
      };
    }

    captureServerException(error, "활동보고서 생성 실패", {
      action: "activityReportAction",
      clubId,
    });
    return {
      error: "활동 보고서 등록에 실패했습니다. 다시 시도해주세요.",
    };
  }
}
