/**
 * 동아리 관련 상수
 */

// 모집 상태 값 (폼에서 사용하는 값)
export const RECRUITMENT_STATUS = {
    RECRUITING: "recruiting",
    CLOSED: "closed",
} as const;

// 모집 상태 라벨 (화면에 표시되는 텍스트)
export const RECRUITMENT_STATUS_LABEL = {
    RECRUITING: "모집중",
    CLOSED: "모집마감",
} as const;

// 모집 상태 타입
export type RecruitmentStatus = (typeof RECRUITMENT_STATUS)[keyof typeof RECRUITMENT_STATUS];
