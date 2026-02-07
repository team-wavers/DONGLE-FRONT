"use server";

import { updateClubReportService, uploadClubReportImageService } from "@dongle/service/club/club.report.service";
import { revalidateTag } from "next/cache";

// 서버 액션 타입 정의
export interface UpdateActivityReportActionState {
    success?: boolean;
    error?: string;
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

    // 기존 이미지 URL과 삭제된 이미지 URL 처리
    const existingUrlsJson = formData.get("existingUrls") as string;
    const removedUrlsJson = formData.get("removedUrls") as string;
    let existingUrls: string[] = [];
    let removedUrls: string[] = [];
    let originalImageUrls: string[] = [];

    try {
        if (existingUrlsJson) {
            existingUrls = JSON.parse(existingUrlsJson);
        }
        if (removedUrlsJson) {
            removedUrls = JSON.parse(removedUrlsJson);
        }
        if (originalImageUrlsJson) {
            originalImageUrls = JSON.parse(originalImageUrlsJson);
        }
    } catch (error) {
        console.error("이미지 URL 파싱 오류:", error);
    }

    // 클라이언트 사이드 검증
    const fieldErrors: {
        title?: string;
        content?: string;
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

        // 기존 이미지 URL 추가 (삭제되지 않은 것만)
        if (existingUrls && existingUrls.length > 0) {
            imageUrls.push(...existingUrls.filter((url) => !removedUrls.includes(url)));
        }

        // 새로 업로드한 이미지가 있으면 업로드 (한 번에 한 장씩)
        if (images && images.length > 0) {
            for (const image of images) {
                if (image.size > 0) {
                    // 빈 파일이 아닌 경우만 업로드
                    try {
                        const { result, isSuccess } = await uploadClubReportImageService(Number(clubId), image);
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

        // 선택적 필드만 포함 (빈 값 제외)
        const updatePayload: {
            title?: string;
            content?: string;
            image_urls?: string[];
        } = {};

        if (title !== originalTitle) {
            updatePayload.title = title;
        }

        if (content !== originalContent) {
            updatePayload.content = content;
        }

        const finalImageUrls = imageUrls.sort().join(",");
        const originalImageUrlsSorted = originalImageUrls.sort().join(",");
        if (finalImageUrls !== originalImageUrlsSorted) {
            updatePayload.image_urls = imageUrls;
        }

        // 변경된 값이 없으면 에러 반환
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
        console.error("보고서 수정 실패:", error);
        return {
            error: "보고서 수정에 실패했습니다. 다시 시도해주세요.",
        };
    }
}
