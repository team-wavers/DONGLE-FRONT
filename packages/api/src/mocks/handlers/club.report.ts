import { http, HttpResponse } from "msw";
import { ClubReport } from "@dongle/types";

const clubReportHandlers = [
    // 특정 동아리의 보고서 목록 조회 (실제 서비스 함수에 맞게 수정)
    http.get(`/clubs/:clubId/reports`, ({ params }) => {
        const { clubId } = params;
        const clubIdNum = Number(clubId);

        // 목업용 고정 보고서 데이터
        const reports: ClubReport[] = [
            {
                id: 1,
                content: "D-Maker의 첫 번째 활동보고서입니다. React 스터디를 진행했습니다.",
                image_urls: [
                    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500",
                    "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=500",
                ],
                title: "React 스터디 활동보고서",
                createdAt: "2024-07-15T10:00:00Z",
                updatedAt: "2024-07-15T10:00:00Z",
                deletedAt: null,
                club_id: clubIdNum,
            },
            {
                id: 2,
                content: "D-Maker의 두 번째 활동보고서입니다. 프로젝트 발표회를 진행했습니다.",
                image_urls: ["https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=500"],
                title: "프로젝트 발표회 보고서",
                createdAt: "2024-07-20T14:30:00Z",
                updatedAt: "2024-07-20T14:30:00Z",
                deletedAt: null,
                club_id: clubIdNum,
            },
        ];

        return HttpResponse.json({
            isSuccess: true,
            result: reports,
        });
    }),

    // 특정 동아리의 특정 보고서 조회
    http.get(`/clubs/:clubId/reports/:reportId`, ({ params }) => {
        const { clubId, reportId } = params;
        const clubIdNum = Number(clubId);
        const reportIdNum = Number(reportId);

        const report: ClubReport = {
            id: reportIdNum,
            content: "D-Maker의 첫 번째 활동보고서입니다. React 스터디를 진행했습니다.",
            image_urls: [
                "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500",
                "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=500",
            ],
            title: "React 스터디 활동보고서",
            createdAt: "2024-07-15T10:00:00Z",
            updatedAt: "2024-07-15T10:00:00Z",
            deletedAt: null,
            club_id: clubIdNum,
        };

        return HttpResponse.json({
            isSuccess: true,
            result: report,
        });
    }),

    // 보고서 생성
    http.post(`/clubs/:clubId/reports`, async ({ request, params }) => {
        const { clubId } = params;
        const body = (await request.json()) as {
            title: string;
            content: string;
            image_urls?: string[];
        };

        const newReport = {
            id: Math.floor(Math.random() * 1000) + 100, // 임시 ID 생성
            content: body.content,
            image_urls: body.image_urls || [],
            title: body.title,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            deletedAt: null,
            club_id: Number(clubId),
        };

        return HttpResponse.json(
            {
                isSuccess: true,
                result: newReport,
            },
            { status: 201 }
        );
    }),

    // 보고서 수정
    http.put(`/clubs/:clubId/reports/:reportId`, async ({ request, params }) => {
        const { clubId, reportId } = params;
        const body = (await request.json()) as {
            title: string;
            content: string;
            image_urls?: string[];
        };

        const updatedReport = {
            id: Number(reportId),
            content: body.content,
            image_urls: body.image_urls || [],
            title: body.title,
            createdAt: "2024-07-15T10:00:00Z",
            updatedAt: new Date().toISOString(),
            deletedAt: null,
            club_id: Number(clubId),
        };

        return HttpResponse.json(
            {
                isSuccess: true,
                result: updatedReport,
            },
            { status: 200 }
        );
    }),

    // 보고서 삭제
    http.delete(`/clubs/:clubId/reports/:reportId`, ({ params }) => {
        const { clubId, reportId } = params;
        console.log(`동아리 ${clubId}의 보고서 ${reportId} 삭제 요청`);

        return HttpResponse.json({
            isSuccess: true,
            result: null,
        });
    }),

    // 이미지 업로드
    http.post(`/clubs/:clubId/report-images`, async ({ request }) => {
        // service는 { file: image } 형태로 JSON으로 전송하지만,
        // File 객체는 FormData로 전송해야 하므로 두 가지 경우 모두 처리
        let file: File | null = null;

        try {
            // FormData로 시도
            const formData = await request.formData();
            file = formData.get("file") as File;
        } catch {
            // JSON으로 시도 (실제로는 File 객체를 JSON으로 보낼 수 없지만)
            try {
                //const body = (await request.json()) as { file?: File };
                // JSON으로는 File 객체를 받을 수 없으므로 null 처리
                file = null;
            } catch {
                file = null;
            }
        }

        if (!file) {
            // File이 없어도 mock에서는 임시 URL 반환
            const imageUrl = `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000000)}?w=500`;

            return HttpResponse.json({
                isSuccess: true,
                result: imageUrl,
            });
        }

        // 임시 이미지 URL 생성
        const imageUrl = `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000000)}?w=500`;

        return HttpResponse.json({
            isSuccess: true,
            result: imageUrl,
        });
    }),
];

export default clubReportHandlers;
