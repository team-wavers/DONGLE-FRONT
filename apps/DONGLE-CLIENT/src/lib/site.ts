export const SITE_URL = "https://dongle.wavers.kr";
export const SITE_TITLE = "동글";
/** 브라우저 탭이 아닌 OG·Twitter 등 공유/검색용 긴 제목 */
export const SITE_HOME_TITLE = "동글 | 순천대 동아리 활동 정보";
export const SITE_DESCRIPTION =
    "순천대학교 동아리 모집 현황, 활동보고서, 공개 일정을 한곳에서 확인하는 동아리 정보 플랫폼입니다.";
export const DEFAULT_OG_IMAGE_PATH = "/logo/logo-og.png";

export const SCHEDULES_PAGE_TITLE = "전체 일정";
export const SCHEDULES_PAGE_DESCRIPTION =
    "순천대 동아리와 총동아리연합회의 공개 일정을 월별 캘린더에서 확인하세요. 모집, 행사, 정기 모임 일정을 한눈에 볼 수 있습니다.";

export const PRIVACY_PAGE_TITLE = "개인정보처리방침";
export const PRIVACY_PAGE_DESCRIPTION = "동글 서비스의 개인정보 수집·이용·보관·파기 방침과 이용자 권리를 안내합니다.";

export function getAbsoluteSiteUrl(path = "") {
    return new URL(path, SITE_URL).toString();
}
