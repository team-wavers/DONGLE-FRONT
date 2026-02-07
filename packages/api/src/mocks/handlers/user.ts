import { http, HttpResponse } from "msw";

const userHandlers = [
    // 사용자 목록 조회
    http.get(`/users`, () => {
        return HttpResponse.json({
            isSuccess: true,
            result: [
                {
                    id: 1,
                    name: "홍길동",
                    login_id: "2020123456",
                    password: "hashed_password",
                    role: "club",
                    phone: "010-1234-5678",
                    refresh_token: "mock-refresh-token",
                    created_at: "2023-01-01T00:00:00Z",
                    updated_at: "2024-07-29T10:00:00Z",
                    deleted_at: null,
                    club: {
                        id: 1,
                        name: "D-Maker",
                    },
                },
                {
                    id: 2,
                    name: "김철수",
                    login_id: "admin",
                    password: "hashed_password",
                    role: "admin",
                    phone: "010-9876-5432",
                    refresh_token: "mock-refresh-token",
                    created_at: "2023-01-01T00:00:00Z",
                    updated_at: "2024-07-29T10:00:00Z",
                    deleted_at: null,
                },
            ],
        });
    }),

    // 특정 사용자 조회
    http.get(`/users/:id`, ({ params }) => {
        const { id } = params;
        const userId = Number(id);

        return HttpResponse.json({
            isSuccess: true,
            result: {
                id: userId,
                name: userId === 1 ? "홍길동" : "김철수",
                login_id: userId === 1 ? "2020123456" : "admin",
                password: "hashed_password",
                role: userId === 1 ? "club" : "admin",
                phone: userId === 1 ? "010-1234-5678" : "010-9876-5432",
                refresh_token: "mock-refresh-token",
                created_at: "2023-01-01T00:00:00Z",
                updated_at: "2024-07-29T10:00:00Z",
                deleted_at: null,
                club:
                    userId === 1
                        ? {
                              id: 1,
                              name: "D-Maker",
                          }
                        : undefined,
            },
        });
    }),

    // 사용자 생성
    http.post(`/users`, async ({ request }) => {
        const body = (await request.json()) as {
            name: string;
            login_id: string;
            password: string;
            role: string;
            phone: string;
        };

        const newUser = {
            id: Math.floor(Math.random() * 1000) + 100,
            name: body.name,
            login_id: body.login_id,
            password: "hashed_password",
            role: body.role,
            phone: body.phone,
            refresh_token: "mock-refresh-token",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            deleted_at: null,
        };

        return HttpResponse.json(
            {
                isSuccess: true,
                result: newUser,
            },
            { status: 201 }
        );
    }),

    // 사용자 수정
    http.patch(`/users/:id`, async ({ request, params }) => {
        const { id } = params;
        const body = (await request.json()) as {
            name?: string;
            login_id?: string;
            password?: string;
            role?: string;
            phone?: string;
            refresh_token?: string;
        };

        const updatedUser = {
            id: Number(id),
            name: body.name || "홍길동",
            login_id: body.login_id || "2020123456",
            password: body.password ? "hashed_" + body.password : "hashed_password",
            role: body.role || "club",
            phone: body.phone || "010-1234-5678",
            refresh_token: body.refresh_token || "mock-refresh-token",
            created_at: "2023-01-01T00:00:00Z",
            updated_at: new Date().toISOString(),
            deleted_at: null,
            club: {
                id: 1,
                name: "D-Maker",
            },
        };

        return HttpResponse.json(
            {
                isSuccess: true,
                result: updatedUser,
            },
            { status: 200 }
        );
    }),

    // 사용자 삭제
    http.delete(`/users/:id`, ({ params }) => {
        const { id } = params;
        console.log(`사용자 ${id} 삭제 요청`);
        return HttpResponse.json(
            {
                isSuccess: true,
                result: null,
            },
            { status: 200 }
        );
    }),
];

export default userHandlers;
