"use server";

import { patchUserService } from "@dongle/service/user/user.service";
import { UpdateUserRequest } from "@dongle/types/user/user.d";
import { revalidateTag } from "next/cache";

export interface UserEditActionState {
    success?: boolean;
    error?: string;
    fieldErrors?: {
        name?: string;
        login_id?: string;
        password?: string;
        role?: string;
        phone?: string;
    };
}

// 휴대폰 번호 검증 함수
function isValidPhoneNumber(phoneNumber: string): boolean {
    // 공백 제거
    const cleaned = phoneNumber.replace(/\s/g, "");

    // 한국 휴대폰 번호 패턴 (010, 011, 016, 017, 018, 019)
    const phoneRegex = /^01[0-9]-?\d{3,4}-?\d{4}$/;

    return phoneRegex.test(cleaned);
}

export async function userEditFormAction(
    prevState: UserEditActionState,
    formData: FormData
): Promise<UserEditActionState> {
    const userId = formData.get("userId") as string;
    const name = formData.get("name") as string;
    const login_id = formData.get("login_id") as string;
    const password = formData.get("password") as string;
    const role = formData.get("role") as string;
    const phone = formData.get("phone") as string;
    const originalName = formData.get("originalName") as string;
    const originalLoginId = formData.get("originalLoginId") as string;
    const originalRole = formData.get("originalRole") as string;
    const originalPhone = formData.get("originalPhone") as string;

    if (!userId) {
        return {
            success: false,
            error: "사용자 정보를 찾을 수 없습니다.",
        };
    }

    // 필드 검증
    const fieldErrors: UserEditActionState["fieldErrors"] = {};

    if (!name || name.trim() === "") {
        fieldErrors.name = "이름을 입력해주세요";
    }

    if (!login_id || login_id.trim() === "") {
        fieldErrors.login_id = "로그인 ID를 입력해주세요";
    }

    if (!role || (role !== "admin" && role !== "president")) {
        fieldErrors.role = "역할을 선택해주세요";
    }

    if (!phone || phone.trim() === "") {
        fieldErrors.phone = "전화번호를 입력해주세요";
    } else if (!isValidPhoneNumber(phone)) {
        fieldErrors.phone = "올바른 휴대폰 번호 형식이 아닙니다 (예: 010-1234-5678)";
    }

    if (Object.keys(fieldErrors).length > 0) {
        return {
            fieldErrors,
        };
    }

    try {
        // 변경된 필드만 포함하는 업데이트 데이터 구성
        const updateData: UpdateUserRequest = {};

        // 이름이 변경된 경우만 추가
        if (name !== originalName) {
            updateData.name = name;
        }

        // 로그인 ID가 변경된 경우만 추가
        if (login_id !== originalLoginId) {
            updateData.login_id = login_id;
        }

        // 역할이 변경된 경우만 추가
        if (role !== originalRole) {
            updateData.role = role as "admin" | "president";
        }

        // 전화번호가 변경된 경우만 추가
        if (phone !== originalPhone) {
            updateData.phone = phone;
        }

        // 비밀번호가 입력된 경우에만 추가
        if (password && password.trim() !== "") {
            updateData.password = password;
        }

        // 변경된 값이 없으면 에러 반환
        if (Object.keys(updateData).length === 0) {
            return {
                success: false,
                error: "변경된 정보가 없습니다.",
            };
        }

        const { isSuccess } = await patchUserService(Number(userId), updateData);

        if (!isSuccess) {
            return {
                success: false,
                error: "사용자 정보 수정에 실패했습니다. 다시 시도해주세요.",
            };
        }

        // 사용자 정보 캐시 초기화
        revalidateTag("user");
        revalidateTag(`user-${userId}`);

        return {
            success: true,
        };
    } catch (error) {
        console.error("사용자 정보 수정 중 오류 발생:", error);
        return {
            success: false,
            error: "사용자 정보 수정에 실패했습니다. 다시 시도해주세요.",
        };
    }
}
