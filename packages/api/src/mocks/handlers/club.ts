import { http, HttpResponse } from "msw";
import type { Club } from "@dongle/types/club/club";
import type {
    ClubCreateResponse,
    ClubDeleteResponse,
    ClubListResponse,
    ClubResponse,
    ClubUpdateResponse,
    CreateClubRequest,
    UpdateClubRequest,
} from "@dongle/types/club/club.response";
import type { Response } from "@dongle/types/response";
import type { SuccessResponse } from "@dongle/types/response";
import { apiPath } from "../api-path";
import { findMockClub, mockClubs } from "../fixtures";

function success<T>(result: T): SuccessResponse<T> {
    return { isSuccess: true, result };
}

const clubHandlers = [
    http.get(apiPath(`/clubs`), () => {
        const body: ClubListResponse = success([...mockClubs]);
        return HttpResponse.json(body);
    }),

    http.get(apiPath(`/clubs/:id`), ({ params }) => {
        const body: ClubResponse = success(findMockClub(Number(params.id)));
        return HttpResponse.json(body);
    }),

    http.post(apiPath(`/clubs`), async ({ request }) => {
        const body = (await request.json()) as CreateClubRequest;

        const newClub: Club = {
            id: Math.floor(Math.random() * 1000) + 100,
            name: body.name,
            icon_url: null,
            is_recruiting: body.is_recruiting ?? false,
            category: body.category,
            sns: body.sns,
            tags: body.tags,
            recruit_start: body.recruit_start ?? "",
            recruit_end: body.recruit_end ?? "",
            description: body.description,
            main_activities: body.main_activities,
            apply_url: body.apply_url ?? null,
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

        const response: ClubCreateResponse = success(newClub);
        return HttpResponse.json(response, { status: 201 });
    }),

    http.put(apiPath(`/clubs/:id`), async ({ request, params }) => {
        const current = findMockClub(Number(params.id));
        const body = (await request.json()) as UpdateClubRequest;

        const updatedClub: Club = {
            ...current,
            name: body.name ?? current.name,
            icon_url: body.icon_url === undefined ? current.icon_url : body.icon_url,
            is_recruiting: body.is_recruiting ?? current.is_recruiting,
            category: body.category ?? current.category,
            sns: body.sns ?? current.sns,
            tags: body.tags ?? current.tags,
            recruit_start: body.recruit_start ?? current.recruit_start,
            recruit_end: body.recruit_end ?? current.recruit_end,
            description: body.description ?? current.description,
            main_activities: body.main_activities ?? current.main_activities,
            apply_url: body.apply_url === undefined ? current.apply_url : body.apply_url,
            location: body.location ?? current.location,
            updated_at: new Date().toISOString(),
            president: {
                ...current.president,
                id: body.president_id ?? current.president.id,
            },
        };

        const response: ClubUpdateResponse = success(updatedClub);
        return HttpResponse.json(response);
    }),

    http.delete(apiPath(`/clubs/:id`), () => {
        const body: ClubDeleteResponse = success(null);
        return HttpResponse.json(body);
    }),

    http.post(apiPath(`/clubs/registration-urls`), () => {
        const body: Response<string> = success("http://localhost:3000/club-register/1");
        return HttpResponse.json(body);
    }),
];

export default clubHandlers;
