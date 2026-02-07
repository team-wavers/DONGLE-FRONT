// 동아리 보고서 타입 정의
import { Response } from "../response";

// 동아리 보고서 기본 정보
export interface ClubReport {
  id: number;
  content: string;
  image_urls: string[];
  title: string;
  createdAt: string; // ISO 8601 날짜 문자열
  updatedAt: string; // ISO 8601 날짜 문자열
  deletedAt: string | null;
  club_id: number; // 동아리 ID
}

export interface CreateClubReportRequest {
  title: string;
  content: string;
  image_urls?: string[];
}

export interface UpdateClubReportRequest {
  title?: string;
  content?: string;
  image_urls?: string[];
}

export type ClubReportListResponse = Response<ClubReport[]>;
export type ClubReportResponse = Response<ClubReport>;
export type ClubReportCreateResponse = Response<ClubReport>;
export type ClubReportDeleteResponse = Response<null>;
export type ClubReportImageResponse = Response<string>;
export type ClubReportUpdateResponse = Response<ClubReport>;
