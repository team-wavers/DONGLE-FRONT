// club.d.ts

// SNS 정보 타입
export interface ClubSns {
  youtube?: string;
  instagram?: string;
}

// 동아리 기본 정보 타입
export interface Club {
  id: number;
  name: string;
  icon_url: string | null;
  is_recruiting: boolean;
  category: string;
  sns: ClubSns;
  tags: string[];
  recruit_start: string; // ISO 8601 날짜 문자열
  recruit_end: string; // ISO 8601 날짜 문자열
  description: string;
  main_activities: string;
  created_at: string; // ISO 8601 날짜 문자열
  updated_at: string; // ISO 8601 날짜 문자열
  deleted_at: string | null;
  president: {
    id: number;
    name: string;
    phone: string;
  };
  location: string;
}

export type ClubCategory =
  | "문예분과"
  | "음악분과"
  | "체육분과"
  | "학술분과"
  | "봉사분과"
  | "종교분과";
