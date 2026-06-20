import {
    ClubCreateResponse,
    ClubListResponse,
    ClubResponse,
    ClubUpdateResponse,
    ClubDeleteResponse,
    UpdateClubRequest,
    CreateClubRequest,
    ClubIconImageResponse,
} from "@dongle/types/club/club.response";
import FetchInstance from "@dongle/api/instance";
import BrowserInstance from "@dongle/api/browser-instance";
import { Response } from "@dongle/types/response";
import type { FetchOptions } from "@dongle/api/fetch-types";
import { clubTagGroups, CLUB_REVALIDATE_SECONDS } from "../cache-tags";

const instance = FetchInstance.getInstance();
const browserInstance = BrowserInstance.getInstance();

export type ServiceFetchPolicy = "public" | "admin";

function getFetchOptions(tags: string[], policy: ServiceFetchPolicy = "public"): FetchOptions {
    if (policy === "admin") {
        return {
            cache: "no-store",
        };
    }

    return {
        cache: "force-cache",
        next: {
            tags,
            revalidate: CLUB_REVALIDATE_SECONDS,
        },
    };
}

export const getClubListService = async (policy: ServiceFetchPolicy = "public"): Promise<ClubListResponse> => {
    return instance.get<ClubListResponse>(`/clubs`, getFetchOptions(clubTagGroups.list(), policy));
};

export const getClubService = async (id: number, policy: ServiceFetchPolicy = "public"): Promise<ClubResponse> => {
    return instance.get<ClubResponse>(`/clubs/${id}`, getFetchOptions(clubTagGroups.detail(id), policy));
};

export const createClubService = async (club: CreateClubRequest): Promise<ClubCreateResponse> => {
    return instance.post<ClubCreateResponse>(`/clubs`, club);
};

export const updateClubService = async (id: number, club: UpdateClubRequest): Promise<ClubUpdateResponse> => {
    return instance.put<ClubUpdateResponse>(`/clubs/${id}`, club);
};

export const deleteClubService = async (id: number): Promise<ClubDeleteResponse> => {
    return instance.delete<ClubDeleteResponse>(`/clubs/${id}`);
};

export const issueClubRegisterUrlService = async (): Promise<Response<string>> => {
    // Next.js API Route를 통해 요청 (same-origin, 쿠키 자동 전송)
    return browserInstance.post<Response<string>>("/api/clubs/registration-urls");
};

export const uploadClubIconService = async (id: number, icon: File): Promise<ClubIconImageResponse> => {
    const formData = new FormData();
    formData.append("file", icon);

    return instance.post<ClubIconImageResponse>(`/clubs/${id}/icons`, formData);
};
