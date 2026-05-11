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
export { getDisplayMainBannerItems, normalizeDisplayBannerLinkUrl } from "./get-display-banner-image-urls";

const instance = FetchInstance.getInstance();

const MAIN_BANNER_PATH = "/main-banners";
const PUBLIC_MAIN_BANNER_PATH = MAIN_BANNER_PATH;
const ADMIN_MAIN_BANNER_PATH = `${MAIN_BANNER_PATH}/admin`;
const MAIN_BANNER_IMAGE_PATH = `${MAIN_BANNER_PATH}/images`;
const MAIN_BANNER_TAG = "main-banner";
const PUBLIC_MAIN_BANNER_REVALIDATE_SECONDS = 60;

function getMainBannerPath(id: number) {
    return `${MAIN_BANNER_PATH}/${id}`;
}

function getAdminMainBannerPath(id: number) {
    return `${ADMIN_MAIN_BANNER_PATH}/${id}`;
}

function getMainBannerTags(id?: number) {
    return id ? [MAIN_BANNER_TAG, `${MAIN_BANNER_TAG}-${id}`] : [MAIN_BANNER_TAG];
}

function getPublicMainBannerFetchOptions(isCache: boolean): FetchOptions {
    if (!isCache) {
        return {
            cache: "no-store",
            next: {
                tags: getMainBannerTags(),
            },
        };
    }

    return {
        cache: "force-cache",
        next: {
            tags: getMainBannerTags(),
            revalidate: PUBLIC_MAIN_BANNER_REVALIDATE_SECONDS,
        },
    };
}

function getAdminMainBannerFetchOptions(): FetchOptions {
    return {
        cache: "no-store",
    };
}

export async function getPublicMainBannerListService(isCache = true): Promise<MainBannerListResponse> {
    const response = await instance.get(PUBLIC_MAIN_BANNER_PATH, getPublicMainBannerFetchOptions(isCache));
    return response as MainBannerListResponse;
}

export async function getAdminMainBannerListService(): Promise<MainBannerListResponse> {
    const response = await instance.get(ADMIN_MAIN_BANNER_PATH, getAdminMainBannerFetchOptions());
    return response as MainBannerListResponse;
}

export async function getAdminMainBannerService(id: number): Promise<MainBannerResponse> {
    const response = await instance.get(getAdminMainBannerPath(id), getAdminMainBannerFetchOptions());
    return response as MainBannerResponse;
}

export async function uploadMainBannerImageService(file: File): Promise<MainBannerImageUploadResponse> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await instance.post(MAIN_BANNER_IMAGE_PATH, formData);
    return response as MainBannerImageUploadResponse;
}

export async function createMainBannerService(payload: CreateMainBannerRequest): Promise<MainBannerCreateResponse> {
    const response = await instance.post(MAIN_BANNER_PATH, payload, {
        next: {
            tags: getMainBannerTags(),
        },
    });
    return response as MainBannerCreateResponse;
}

export async function updateMainBannerService(
    id: number,
    payload: UpdateMainBannerRequest
): Promise<MainBannerUpdateResponse> {
    const response = await instance.put(getMainBannerPath(id), payload, {
        next: {
            tags: getMainBannerTags(id),
        },
    });
    return response as MainBannerUpdateResponse;
}

export async function deleteMainBannerService(id: number): Promise<MainBannerDeleteResponse> {
    const response = await instance.delete(getMainBannerPath(id), {
        next: {
            tags: getMainBannerTags(id),
        },
    });
    return response as MainBannerDeleteResponse;
}
