import { http, HttpResponse } from "msw";
import { AUTH_ROLE } from "@dongle/types/auth/auth-role";
import type {
    CreateUserRequest,
    CreateUserResponse,
    GetUserListResponse,
    GetUserResponse,
    UpdateUserRequest,
    UpdateUserResponse,
    User,
} from "@dongle/types/user/user";
import type { SuccessResponse } from "@dongle/types/response";
import { apiPath } from "../api-path";
import { findMockUser, mockUsers } from "../fixtures";

function success<T>(result: T): SuccessResponse<T> {
    return { isSuccess: true, result };
}

const userHandlers = [
    http.get(apiPath(`/users`), () => {
        const body: GetUserListResponse = success([...mockUsers]);
        return HttpResponse.json(body);
    }),

    http.get(apiPath(`/users/:id`), ({ params }) => {
        const body: GetUserResponse = success(findMockUser(Number(params.id)));
        return HttpResponse.json(body);
    }),

    http.post(apiPath(`/users`), async ({ request }) => {
        const body = (await request.json()) as CreateUserRequest;

        const newUser: User = {
            id: Math.floor(Math.random() * 1000) + 100,
            name: body.name,
            login_id: body.login_id,
            password: "hashed_password",
            role: body.role,
            phone: body.phone,
            refresh_token: body.refresh_token ?? "mock-refresh-token",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            deleted_at: null,
        };

        const response: CreateUserResponse = success(newUser);
        return HttpResponse.json(response, { status: 201 });
    }),

    http.patch(apiPath(`/users/:id`), async ({ request, params }) => {
        const current = findMockUser(Number(params.id));
        const body = (await request.json()) as UpdateUserRequest;

        const updatedUser: User = {
            ...current,
            name: body.name ?? current.name,
            login_id: body.login_id ?? current.login_id,
            password: body.password ? `hashed_${body.password}` : current.password,
            role: body.role ?? current.role,
            phone: body.phone ?? current.phone,
            refresh_token: body.refresh_token ?? current.refresh_token,
            updated_at: new Date().toISOString(),
            club: current.club ?? {
                id: 1,
                name: "D-Maker",
            },
        };

        // 관리자 mock은 club이 없을 수 있음
        if (updatedUser.role === AUTH_ROLE.ADMIN) {
            delete updatedUser.club;
        }

        const response: UpdateUserResponse = success(updatedUser);
        return HttpResponse.json(response);
    }),

    http.delete(apiPath(`/users/:id`), () => {
        const body: SuccessResponse<null> = success(null);
        return HttpResponse.json(body);
    }),
];

export default userHandlers;
