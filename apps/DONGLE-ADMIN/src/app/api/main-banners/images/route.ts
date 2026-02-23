import { NextRequest, NextResponse } from "next/server";
import { uploadMainBannerImageService } from "@dongle/service/main-banner/main-banner.service";

export async function POST(request: NextRequest) {
    try {
        const incoming = await request.formData();
        const file = incoming.get("file");

        if (!(file instanceof File)) {
            return NextResponse.json(
                {
                    isSuccess: false,
                    error: {
                        message: "Bad Request",
                        detail: "file 필드가 필요합니다.",
                    },
                },
                { status: 400 }
            );
        }

        const response = await uploadMainBannerImageService(file);
        const status = response.isSuccess ? 200 : 400;
        return NextResponse.json(response, { status });
    } catch (error) {
        console.error("Main banner image upload API Route 오류:", error);
        return NextResponse.json(
            {
                isSuccess: false,
                error: {
                    message: "Internal Server Error",
                    detail: "배너 이미지 업로드 중 오류가 발생했습니다.",
                },
            },
            { status: 500 }
        );
    }
}
