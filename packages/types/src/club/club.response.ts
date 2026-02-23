import { Club } from "./club";
import { ClubSns } from "./club";
import { Response } from "../response";

// 동아리 생성 요청 타입
export interface CreateClubRequest {
    key: string;
    name: string;
    tags: string[];
    category: string;
    location: string;
    description: string;
    main_activities: string;
    is_recruiting: boolean;
    recruit_start: string; // ISO 8601 날짜 문자열
    recruit_end: string; // ISO 8601 날짜 문자열
    sns: ClubSns;
    president_id: number;
}
export interface UpdateClubRequest {
    name?: string;
    tags?: string[];
    category?: string;
    description?: string;
    main_activities?: string;
    icon_url?: string | null;
    is_recruiting?: boolean;
    recruit_start?: string; // ISO 8601 날짜 문자열
    recruit_end?: string; // ISO 8601 날짜 문자열
    sns?: ClubSns;
    president_id?: number;
    location?: string;
}

export type ClubResponse = Response<Club>;

export type ClubListResponse = Response<Club[]>;

export type ClubCreateResponse = Response<Club>;

export type ClubUpdateResponse = Response<Club>;

export type ClubDeleteResponse = Response<null>;

export type ClubIconImageResponse = Response<string>;

//request
export type ClubCreateRequest = CreateClubRequest;
