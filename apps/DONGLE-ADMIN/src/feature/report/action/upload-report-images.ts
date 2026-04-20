"use server";

import { uploadClubReportImageService } from "@dongle/service/club/club.report.service";

interface UploadReportImagesOptions {
    clubId: string;
    images: File[];
}

export async function uploadReportImages({ clubId, images }: UploadReportImagesOptions): Promise<string[]> {
    const validImages = images.filter((image) => image.size > 0);

    if (validImages.length === 0) {
        return [];
    }

    return Promise.all(
        validImages.map(async (image) => {
            const { result, isSuccess } = await uploadClubReportImageService(Number(clubId), image);

            if (!isSuccess || !result) {
                throw new Error("이미지 업로드 실패");
            }

            return result;
        })
    );
}
