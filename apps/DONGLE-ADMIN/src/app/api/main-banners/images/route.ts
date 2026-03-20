import { NextRequest, NextResponse } from "next/server";
import { uploadMainBannerImageService } from "@dongle/service/main-banner/main-banner.service";
import { captureServerException } from "@/lib/sentry/capture-server-exception";

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
        captureServerException(error, "메인 배너 이미지 업로드 API Route 오류", {
            route: "/api/main-banners/images",
            method: "POST",
        });
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
