/**
 * 사용자 생성/수정 폼 공통 검증
 */

import { isValidMobilePhoneNumber, trimToEmpty } from "@/feature/shared/normalization/string-normalization";

export interface UserFormFieldErrors {
    name?: string;
    login_id?: string;
    password?: string;
    phone?: string;
}

export const USER_FORM_MESSAGES = {
    nameRequired: "이름을 입력해주세요",
    loginIdRequired: "로그인 ID를 입력해주세요",
    passwordRequired: "비밀번호를 입력해주세요",
    phoneRequired: "전화번호를 입력해주세요",
    phoneInvalid: "올바른 휴대폰 번호 형식이 아닙니다 (예: 010-1234-5678)",
} as const;

export function isValidPhoneNumber(phoneNumber: string): boolean {
    return isValidMobilePhoneNumber(phoneNumber);
}

export function validateUserName(name: string): string | undefined {
    if (!trimToEmpty(name)) return USER_FORM_MESSAGES.nameRequired;
    return undefined;
}

export function validateLoginId(loginId: string): string | undefined {
    const trimmed = trimToEmpty(loginId);
    if (!trimmed) return USER_FORM_MESSAGES.loginIdRequired;
    return undefined;
}

export function validatePassword(password: string, required: boolean): string | undefined {
    const p = trimToEmpty(password);
    if (!p) return required ? USER_FORM_MESSAGES.passwordRequired : undefined;
    return undefined;
}

export function validateUserPhone(phone: string): string | undefined {
    const trimmed = trimToEmpty(phone);
    if (!trimmed) return USER_FORM_MESSAGES.phoneRequired;
    if (!isValidPhoneNumber(trimmed)) return USER_FORM_MESSAGES.phoneInvalid;
    return undefined;
}
