import { NextResponse } from "next/server";
import { getClubReportFromListService } from "@/lib/server/cached-services";

interface RouteContext {
    params: Promise<{
        clubId: string;
        reportId: string;
    }>;
}

export async function GET(_request: Request, { params }: RouteContext) {
    const { clubId, reportId } = await params;
    const clubIdNumber = Number(clubId);
    const reportIdNumber = Number(reportId);

    if (Number.isNaN(clubIdNumber) || Number.isNaN(reportIdNumber)) {
        return NextResponse.json(
            {
                isSuccess: false,
                error: {
                    message: "Bad Request",
                    detail: "clubId 또는 reportId 형식이 올바르지 않습니다.",
                },
            },
            { status: 400 }
        );
    }

    try {
        const response = await getClubReportFromListService(clubIdNumber, reportIdNumber);
        return NextResponse.json(response, { status: response.isSuccess ? 200 : 404 });
    } catch (error) {
        console.error("클럽 보고서 상세 조회 API Route 오류", {
            error,
            route: `/api/clubs/${clubId}/reports/${reportId}`,
            method: "GET",
        });

        return NextResponse.json(
            {
                isSuccess: false,
                error: {
                    message: "Internal Server Error",
                    detail: "활동보고서 상세 조회 중 오류가 발생했습니다.",
                },
            },
            { status: 500 }
        );
    }
}
