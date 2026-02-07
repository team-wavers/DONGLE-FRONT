import { Response } from "../response";
import { User } from "./user";

// API 응답 타입들
export type UserResponse = Response<User>;
export type UserListResponse = Response<User[]>;
export type LoginUserResponse = Response<User>;
