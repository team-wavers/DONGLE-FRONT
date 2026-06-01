import FetchInstance from "@dongle/api/instance";
import type { FetchOptions } from "@dongle/api/fetch-types";
import {
    type CreateMainBannerRequest,
    type MainBannerCreateResponse,
    type MainBannerDeleteResponse,
    type MainBannerImageUploadResponse,
    type MainBannerListResponse,
    type MainBannerResponse,
    type MainBannerUpdateResponse,
    type UpdateMainBannerRequest,
} from "@dongle/types/main-banner/main-banner.response";
import { mainBannerTagGroups, PUBLIC_REVALIDATE_SECONDS } from "../cache-tags";
export { getDisplayMainBannerItems, normalizeDisplayBannerLinkUrl } from "./get-display-banner-image-urls";

const instance = FetchInstance.getInstance();

const MAIN_BANNER_PATH = "/main-banners";
const PUBLIC_MAIN_BANNER_PATH = MAIN_BANNER_PATH;
const ADMIN_MAIN_BANNER_PATH = `${MAIN_BANNER_PATH}/admin`;
const MAIN_BANNER_IMAGE_PATH = `${MAIN_BANNER_PATH}/images`;

function getMainBannerPath(id: number) {
    return `${MAIN_BANNER_PATH}/${id}`;
}

function getAdminMainBannerPath(id: number) {
    return `${ADMIN_MAIN_BANNER_PATH}/${id}`;
}

function getMainBannerTags(id?: number) {
    return id ? mainBannerTagGroups.detail(id) : mainBannerTagGroups.list();
}

function getPublicMainBannerFetchOptions(isCache: boolean): FetchOptions {
    if (!isCache) {
        return {
            cache: "no-store",
        };
    }

    return {
        cache: "force-cache",
        next: {
            tags: getMainBannerTags(),
            revalidate: PUBLIC_REVALIDATE_SECONDS,
        },
    };
}

function getAdminMainBannerFetchOptions(): FetchOptions {
    return {
        cache: "no-store",
    };
}

function createAdminMainBannerFailureResponse(id: number, error: unknown): MainBannerResponse {
    const message = error instanceof Error && error.message.trim() ? error.message : "배너 정보를 불러오지 못했습니다.";

    return {
        isSuccess: false,
        error: {
            message,
            detail: `banner_id: ${id}`,
        },
    };
}

export async function getPublicMainBannerListService(isCache = true): Promise<MainBannerListResponse> {
    return instance.get<MainBannerListResponse>(PUBLIC_MAIN_BANNER_PATH, getPublicMainBannerFetchOptions(isCache));
}

export async function getAdminMainBannerListService(): Promise<MainBannerListResponse> {
    return instance.get<MainBannerListResponse>(ADMIN_MAIN_BANNER_PATH, getAdminMainBannerFetchOptions());
}

export async function getAdminMainBannerService(id: number): Promise<MainBannerResponse> {
    try {
        return await instance.get<MainBannerResponse>(getAdminMainBannerPath(id), getAdminMainBannerFetchOptions());
    } catch (error) {
        return createAdminMainBannerFailureResponse(id, error);
    }
}

export async function uploadMainBannerImageService(file: File): Promise<MainBannerImageUploadResponse> {
    const formData = new FormData();
    formData.append("file", file);

    return instance.post<MainBannerImageUploadResponse>(MAIN_BANNER_IMAGE_PATH, formData);
}

export async function createMainBannerService(payload: CreateMainBannerRequest): Promise<MainBannerCreateResponse> {
    return instance.post<MainBannerCreateResponse>(MAIN_BANNER_PATH, payload);
}

export async function updateMainBannerService(
    id: number,
    payload: UpdateMainBannerRequest
): Promise<MainBannerUpdateResponse> {
    return instance.put<MainBannerUpdateResponse>(getMainBannerPath(id), payload);
}

export async function deleteMainBannerService(id: number): Promise<MainBannerDeleteResponse> {
    return instance.delete<MainBannerDeleteResponse>(getMainBannerPath(id));
}
