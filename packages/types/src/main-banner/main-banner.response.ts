import { MainBanner } from "./main-banner";
import { Response } from "../response";

export interface CreateMainBannerRequest {
    image_url: string;
    publish_start_at: string;
    publish_end_at: string;
    is_active: boolean;
}

export interface UpdateMainBannerRequest {
    image_url: string;
    publish_start_at: string;
    publish_end_at: string;
    is_active: boolean;
}

export type MainBannerListResponse = Response<MainBanner[]>;

export type MainBannerResponse = Response<MainBanner>;

export type MainBannerCreateResponse = Response<MainBanner>;

export type MainBannerUpdateResponse = Response<MainBanner>;

export type MainBannerDeleteResponse = Response<null>;

export type MainBannerImageUploadResponse = Response<{
    image_url: string;
}>;
