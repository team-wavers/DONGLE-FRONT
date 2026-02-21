import FetchInstance from "@dongle/api/instance";
import {
    CreateMainBannerRequest,
    MainBannerCreateResponse,
    MainBannerDeleteResponse,
    MainBannerImageUploadResponse,
    MainBannerResponse,
    MainBannerListResponse,
    MainBannerUpdateResponse,
    UpdateMainBannerRequest,
} from "@dongle/types/main-banner/main-banner.response";

const instance = FetchInstance.getInstance();

const BASE_PATH = "/main-banners";

/**
 * 활성화된 메인 배너 목록 조회
 * @returns 메인 배너 목록
 */
export const getActiveMainBannerListService = async (isCache = true): Promise<MainBannerListResponse> => {
    const response = await instance.get(`${BASE_PATH}`, {
        cache: isCache ? "force-cache" : "no-store",
        next: {
            tags: ["main-banner"],
            revalidate: 60,
        },
    });
    return response as MainBannerListResponse;
};

/**
 * 활성화된 메인 배너 목록에서 특정 배너 조회
 * @param id 조회할 배너 ID
 * @returns 조회된 배너 정보
 */
export const getMainBannerFromListService = async (id: number): Promise<MainBannerResponse> => {
    const { result: bannerList, isSuccess } = await getActiveMainBannerListService();

    if (!isSuccess || !bannerList) {
        return {
            isSuccess: false,
            error: {
                message: "배너 목록을 불러오는데 실패했습니다.",
                detail: "목록 API 호출 실패",
            },
        };
    }

    const banner = bannerList.find((item) => item.id === id);

    if (!banner) {
        return {
            isSuccess: false,
            error: {
                message: "해당 배너를 찾을 수 없습니다.",
                detail: `banner_id: ${id}`,
            },
        };
    }

    return {
        isSuccess: true,
        result: banner,
    };
};

/**
 * 메인 배너 이미지 업로드
 * @param file 업로드할 이미지 파일
 * @returns 업로드된 이미지 정보
 */
export const uploadMainBannerImageService = async (file: File): Promise<MainBannerImageUploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await instance.post(`${BASE_PATH}/images`, formData);
    return response as MainBannerImageUploadResponse;
};

/**
 * 메인 배너 생성
 * @param payload 메인 배너 생성 요청 데이터
 * @returns 생성된 메인 배너 정보
 */
export const createMainBannerService = async (payload: CreateMainBannerRequest): Promise<MainBannerCreateResponse> => {
    const response = await instance.post(`${BASE_PATH}`, payload, {
        next: {
            tags: ["main-banner"],
        },
    });
    return response as MainBannerCreateResponse;
};

/**
 * 메인 배너 수정
 * @param id 수정할 메인 배너 ID
 * @param payload 메인 배너 수정 요청 데이터
 * @returns 수정된 메인 배너 정보
 */
export const updateMainBannerService = async (
    id: number,
    payload: UpdateMainBannerRequest
): Promise<MainBannerUpdateResponse> => {
    const response = await instance.put(`${BASE_PATH}/${id}`, payload, {
        next: {
            tags: ["main-banner", `main-banner-${id}`],
        },
    });
    return response as MainBannerUpdateResponse;
};

export const deleteMainBannerService = async (id: number): Promise<MainBannerDeleteResponse> => {
    const response = await instance.delete(`${BASE_PATH}/${id}`, {
        next: {
            tags: ["main-banner", `main-banner-${id}`],
        },
    });
    return response as MainBannerDeleteResponse;
};
