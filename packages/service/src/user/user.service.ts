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
    const response = await instance.get(`/users/${id}`, {
        next: {
            tags: ["user", `${id}`],
        },
    });
    return response as GetUserResponse;
};

export const createUserService = async (user: CreateUserRequest): Promise<CreateUserResponse> => {
    const response = await instance.post("/users", user, {
        next: {
            tags: ["user"],
        },
    });
    return response as CreateUserResponse;
};

export const getUserListService = async (): Promise<GetUserListResponse> => {
    const response = await instance.get("/users", {
        next: {
            tags: ["user"],
        },
    });

    return response as GetUserListResponse;
};

export const patchUserService = async (id: number, user: UpdateUserRequest): Promise<UpdateUserResponse> => {
    const response = await instance.patch(`/users/${id}`, user, {
        next: {
            tags: ["user", `${id}`],
        },
    });
    return response as UpdateUserResponse;
};

export const deleteUserService = async (id: number): Promise<Response<null>> => {
    const response = await instance.delete(`/users/${id}`, {
        next: {
            tags: ["user", `${id}`],
        },
    });
    return response as Response<null>;
};
