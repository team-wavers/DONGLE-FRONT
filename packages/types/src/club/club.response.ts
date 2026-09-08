import { Club } from "./club";
import { ClubSns } from "./club";
import { Response } from "../response";

// 공개 등록 플로우에서 회장 계정을 함께 생성할 때 쓰는 페이로드.
// 이 값을 실으면 백엔드가 User+Club 생성을 하나의 트랜잭션으로 처리한다.
export interface NewClubPresidentRequest {
    name: string;
    login_id: string;
    password: string;
    phone: string;
}

// 동아리 생성 요청 타입
export interface CreateClubRequest {
    key: string;
    name: string;
    tags: string[];
    category: string;
    location: string;
    description: string;
    main_activities: string;
    is_recruiting?: boolean;
    recruit_start?: string | null; // ISO 8601 날짜 문자열
    recruit_end?: string | null; // ISO 8601 날짜 문자열
    apply_url?: string | null;
    sns: ClubSns;
    // 기존 유저를 회장으로 지정하거나(president_id), 회장 계정을 새로 함께
    // 생성하거나(newPresident) 둘 중 하나를 넣는다.
    president_id?: number;
    newPresident?: NewClubPresidentRequest;
}
export interface UpdateClubRequest {
    name?: string;
    tags?: string[];
    category?: string;
    description?: string;
    main_activities?: string;
    icon_url?: string | null;
    is_recruiting?: boolean;
    recruit_start?: string | null; // ISO 8601 날짜 문자열
    recruit_end?: string | null; // ISO 8601 날짜 문자열
    apply_url?: string | null;
    sns?: ClubSns;
    president_id?: number;
    location?: string;
}

export type ClubResponse = Response<Club>;

export type ClubListResponse = Response<Club[]>;

export type ClubCreateResponse = Response<Club>;

export type ClubUpdateResponse = Response<Club>;

export type ClubDeleteResponse = Response<null>;

export type ClubIconImageResponse = Response<
    | string
    | {
          icon_url: string;
      }
>;

//request
export type ClubCreateRequest = CreateClubRequest;
