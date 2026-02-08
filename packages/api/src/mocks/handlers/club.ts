import { http, HttpResponse } from "msw";

const clubHandlers = [
    // 동아리 목록 조회
    http.get(`/clubs`, () => {
        return HttpResponse.json({
            isSuccess: true,
            result: [
                {
                    id: 1,
                    name: "D-Maker",
                    icon_url: null,
                    is_recruiting: true,
                    category: "학술분과",
                    sns: {
                        youtube: "https://www.youtube.com/dmaker",
                        instagram: "https://www.instagram.com/dmaker",
                    },
                    tags: ["#개발", "#디자인"],
                    recruit_start: "2024-08-01T00:00:00Z",
                    recruit_end: "2024-08-31T23:59:59Z",
                    description: "디자인과 개발을 함께하는 IT 동아리 D-Maker 입니다.",
                    main_activities: "주 2회 스터디, 프로젝트 진행",
                    location: "동국대학교",
                    created_at: "2023-01-01T00:00:00Z",
                    updated_at: "2024-07-29T10:00:00Z",
                    deleted_at: null,
                    president: {
                        id: 1,
                        name: "홍길동",
                        phone: "010-1234-5678",
                    },
                },
                {
                    id: 2,
                    name: "Dongguk Creative",
                    icon_url: null,
                    is_recruiting: false,
                    category: "문예분과",
                    sns: {
                        youtube: "https://www.youtube.com/donggukcreative",
                        instagram: "https://www.instagram.com/donggukcreative",
                    },
                    tags: ["#광고", "#기획"],
                    recruit_start: "2024-09-01T00:00:00Z",
                    recruit_end: "2024-09-30T23:59:59Z",
                    description: "동국 크리에이티브는 광고 및 기획 동아리입니다.",
                    main_activities: "광고 공모전 참여, 아이디어 기획",
                    location: "동국대학교",
                    created_at: "2023-02-01T00:00:00Z",
                    updated_at: "2024-07-29T10:00:00Z",
                    deleted_at: null,
                    president: {
                        id: 2,
                        name: "김철수",
                        phone: "010-2345-6789",
                    },
                },
                {
                    id: 3,
                    name: "맛따라 멋따라",
                    icon_url: null,
                    is_recruiting: true,
                    category: "체육분과",
                    sns: {
                        youtube: "https://www.youtube.com/matttara",
                        instagram: "https://www.instagram.com/matttara",
                    },
                    tags: ["#맛집탐방"],
                    recruit_start: "2024-10-01T00:00:00Z",
                    recruit_end: "2024-10-31T23:59:59Z",
                    description: "맛있는 음식을 찾아 떠나는 동아리입니다.",
                    main_activities: "맛집 탐방, 요리 대회 참여",
                    location: "동국대학교",
                    created_at: "2023-03-01T00:00:00Z",
                    updated_at: "2024-07-29T10:00:00Z",
                    deleted_at: null,
                    president: {
                        id: 3,
                        name: "이영희",
                        phone: "010-3456-7890",
                    },
                },
            ],
        });
    }),

    // 동아리 상세 조회
    http.get(`/clubs/:id`, ({ params }) => {
        const { id } = params;
        return HttpResponse.json({
            isSuccess: true,
            result: {
                id: Number(id),
                name: "D-Maker",
                icon_url: null,
                is_recruiting: true,
                category: "학술분과",
                sns: {
                    youtube: "https://www.youtube.com/dmaker",
                    instagram: "https://www.instagram.com/dmaker",
                },
                tags: ["#개발", "#디자인"],
                recruit_start: "2024-08-01T00:00:00Z",
                recruit_end: "2024-08-31T23:59:59Z",
                description: "디자인과 개발을 함께하는 IT 동아리 D-Maker 입니다.",
                main_activities: "주 2회 스터디, 프로젝트 진행",
                location: "동국대학교",
                created_at: "2023-01-01T00:00:00Z",
                updated_at: "2024-07-29T10:00:00Z",
                deleted_at: null,
                president: {
                    id: 1,
                    name: "홍길동",
                    phone: "010-1234-5678",
                },
            },
        });
    }),

    // 동아리 등록
    http.post(`/clubs`, async ({ request }) => {
        const body = (await request.json()) as {
            key: string;
            name: string;
            tags: string[];
            category: string;
            location: string;
            description: string;
            main_activities: string;
            is_recruiting: boolean;
            recruit_start: string;
            recruit_end: string;
            sns: {
                youtube?: string;
                instagram?: string;
                facebook?: string;
                twitter?: string;
                tiktok?: string;
                blog?: string;
            };
            president_id: number;
        };

        const newClub = {
            id: Math.floor(Math.random() * 1000) + 100,
            name: body.name,
            icon_url: null,
            is_recruiting: body.is_recruiting,
            category: body.category,
            sns: body.sns,
            tags: body.tags,
            recruit_start: body.recruit_start,
            recruit_end: body.recruit_end,
            description: body.description,
            main_activities: body.main_activities,
            location: body.location,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            deleted_at: null,
            president: {
                id: body.president_id,
                name: "회장 이름",
                phone: "010-0000-0000",
            },
        };

        return HttpResponse.json(
            {
                isSuccess: true,
                result: newClub,
            },
            { status: 201 }
        );
    }),

    // 동아리 수정
    http.put(`/clubs/:id`, async ({ request, params }) => {
        const { id } = params;
        const body = (await request.json()) as {
            name?: string;
            tags?: string[];
            category?: string;
            description?: string;
            main_activities?: string;
            is_recruiting?: boolean;
            recruit_start?: string;
            recruit_end?: string;
            sns?: {
                youtube?: string;
                instagram?: string;
                facebook?: string;
                twitter?: string;
                tiktok?: string;
                blog?: string;
            };
            president_id: number;
            location?: string;
        };

        const updatedClub = {
            id: Number(id),
            name: body.name || "D-Maker",
            icon_url: null,
            is_recruiting: body.is_recruiting ?? true,
            category: body.category || "학술분과",
            sns: body.sns || {
                youtube: "https://www.youtube.com/dmaker",
                instagram: "https://www.instagram.com/dmaker",
            },
            tags: body.tags || ["#개발", "#디자인"],
            recruit_start: body.recruit_start || "2024-08-01T00:00:00Z",
            recruit_end: body.recruit_end || "2024-08-31T23:59:59Z",
            description: body.description || "디자인과 개발을 함께하는 IT 동아리 D-Maker 입니다.",
            main_activities: body.main_activities || "주 2회 스터디, 프로젝트 진행",
            location: body.location || "동국대학교",
            created_at: "2023-01-01T00:00:00Z",
            updated_at: new Date().toISOString(),
            deleted_at: null,
            president: {
                id: body.president_id,
                name: "회장 이름",
                phone: "010-0000-0000",
            },
        };

        return HttpResponse.json({
            isSuccess: true,
            result: updatedClub,
        });
    }),

    // 동아리 삭제
    http.delete(`/clubs/:id`, ({ params }) => {
        const { id } = params;
        console.log(`동아리 ${id} 삭제 요청`);
        return HttpResponse.json({
            isSuccess: true,
            result: null,
        });
    }),

    // 동아리 등록 URL 발급
    http.post(`/clubs/registration-urls`, () => {
        return HttpResponse.json({
            isSuccess: true,
            result: "http://localhost:3000/club-register/1",
        });
    }),
];

export default clubHandlers;
