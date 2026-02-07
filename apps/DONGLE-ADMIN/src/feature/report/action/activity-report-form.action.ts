"use server";

import {
  createClubReportService,
  uploadClubReportImageService,
} from "@dongle/service/club/club.report.service";
import { revalidateTag } from "next/cache";

// 서버 액션 타입 정의
export interface ActivityReportActionState {
  success?: boolean;
  error?: string;
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

  // 클라이언트 사이드 검증
  const fieldErrors: {
    title?: string;
    content?: string;
    reportDate?: string;
    images?: string;
  } = {};

  if (!title) {
    fieldErrors.title = "제목을 입력해주세요";
  } else if (title.length < 2) {
    fieldErrors.title = "제목은 최소 2자 이상이어야 합니다";
  } else if (title.length > 100) {
    fieldErrors.title = "제목은 최대 100자 이하여야 합니다";
  }

  if (!content) {
    fieldErrors.content = "내용을 입력해주세요";
  } else if (content.length < 10) {
    fieldErrors.content = "내용은 최소 10자 이상이어야 합니다";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      fieldErrors,
    };
  }

  try {
    const imageUrls: string[] = [];

    if (images && images.length > 0) {
      for (const image of images) {
        if (image.size > 0) {
          try {
            const { result, isSuccess } = await uploadClubReportImageService(
              Number(clubId),
              image
            );
            if (isSuccess && result) {
              imageUrls.push(result);
            }
          } catch (error) {
            console.error("이미지 업로드 실패:", error);
            return {
              error: "이미지 업로드에 실패했습니다. 다시 시도해주세요.",
            };
          }
        }
      }
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
    console.error("활동보고서 생성 실패:", error);
    return {
      error: "활동 보고서 등록에 실패했습니다. 다시 시도해주세요.",
    };
  }
}
