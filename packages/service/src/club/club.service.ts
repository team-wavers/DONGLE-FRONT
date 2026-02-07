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
import { Response } from "@dongle/types/response";

const instance = FetchInstance.getInstance();

export const getClubListService = async (): Promise<ClubListResponse> => {
    const response = await instance.get(`/clubs`, {
        next: {
            tags: ["club"],
        },
    });
    return response as ClubListResponse;
};

export const getClubService = async (id: number): Promise<ClubResponse> => {
    const response = await instance.get(`/clubs/${id}`, {
        next: {
            tags: ["club", `club-${id}`],
        },
    });
    console.log(response);
    return response as ClubResponse;
};

export const createClubService = async (club: CreateClubRequest): Promise<ClubCreateResponse> => {
    const response = await instance.post(`/clubs`, club, {
        next: {
            tags: ["club"],
        },
    });
    return response as ClubCreateResponse;
};

export const updateClubService = async (id: number, club: UpdateClubRequest): Promise<ClubUpdateResponse> => {
    const response = await instance.put(`/clubs/${id}`, club, {
        next: {
            tags: ["club", `club-${id}`],
        },
    });
    console.log("동아리 정보 수정", response);
    return response as ClubUpdateResponse;
};

export const deleteClubService = async (id: number): Promise<ClubDeleteResponse> => {
    const response = await instance.delete(`/clubs/${id}`, {
        next: {
            tags: ["club", `club-${id}`],
        },
    });
    return response as ClubDeleteResponse;
};

export const issueClubRegisterUrlService = async (): Promise<Response<string>> => {
    // Next.js API Route를 통해 요청 (same-origin, 쿠키 자동 전송)
    const response = await fetch("/api/clubs/registration-urls", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
    });

    const data = await response.json();
    return data as Response<string>;
};

export const uploadClubIconService = async (id: number, icon: File): Promise<ClubIconImageResponse> => {
    const formData = new FormData();
    formData.append("file", icon);

    const response = await instance.post(`/clubs/${id}/icons`, formData);
    return response as ClubIconImageResponse;
};
