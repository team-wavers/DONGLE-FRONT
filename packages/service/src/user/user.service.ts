import {
    CreateUserRequest,
    UpdateUserRequest,
    GetUserResponse,
    CreateUserResponse,
    GetUserListResponse,
    UpdateUserResponse,
} from "@dongle/types/user/user.d";
import { Response } from "@dongle/types/response";
import FetchInstance from "@dongle/api/instance";
import { filterUsers } from "./utils";

const instance = FetchInstance.getInstance();

export const getUserService = async (id: number): Promise<GetUserResponse> => {
    return instance.get<GetUserResponse>(`/users/${id}`, {
        cache: "no-store",
    });
};

export const createUserService = async (user: CreateUserRequest): Promise<CreateUserResponse> => {
    return instance.post<CreateUserResponse>("/users", user);
};

export const getUserListService = async (): Promise<GetUserListResponse> => {
    return instance.get<GetUserListResponse>("/users", {
        cache: "no-store",
    });
};

export const patchUserService = async (id: number, user: UpdateUserRequest): Promise<UpdateUserResponse> => {
    return instance.patch<UpdateUserResponse>(`/users/${id}`, user);
};

export const deleteUserService = async (id: number): Promise<Response<null>> => {
    return instance.delete<Response<null>>(`/users/${id}`);
};
