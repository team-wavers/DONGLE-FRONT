import { Response } from "../response";
// user.d.ts

// 사용자 역할 타입
export type UserRole = "admin" | "president";

export interface UserClub {
  id: number;
  name: string;
}

// 사용자 기본 정보 타입
export interface User {
  id: number;
  name: string;
  login_id: string;
  password: string; // 해시된 비밀번호
  role: UserRole;
  phone: string;
  refresh_token: string;
  created_at: string; // ISO 8601 날짜 문자열
  updated_at: string; // ISO 8601 날짜 문자열
  deleted_at: string | null;
  club?: UserClub; // 동아리 정보 (선택적)
}

// 사용자 생성 요청 타입
export interface CreateUserRequest {
  name: string;
  login_id: string;
  password: string;
  role: UserRole;
  phone: string;
  refresh_token?: string;
}
export type UpdateUserRequest = Partial<CreateUserRequest>;
export type UpdateUserResponse = Response<User>;
export type GetUserResponse = Response<User>;
export type GetUserListResponse = Response<User[]>;
export type CreateUserResponse = Response<User>;
