export const API_ERROR_CODE = {
    LOGIN_ID_DUPLICATED: "LOGIN_ID_DUPLICATED",
    PHONE_DUPLICATED: "PHONE_DUPLICATED",
} as const;

export type ApiErrorCode = (typeof API_ERROR_CODE)[keyof typeof API_ERROR_CODE];
