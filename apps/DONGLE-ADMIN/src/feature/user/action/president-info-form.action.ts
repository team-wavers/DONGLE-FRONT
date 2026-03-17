"use server";

import { patchUserService } from "@dongle/service/user/user.service";
import { getAccessTokenFromServerCookie } from "@dongle/api/utils/cookie/server-cookie.util";
import { UpdateUserRequest } from "@dongle/types/user/user";
import { decodeJwtToken, getUserClubIdFromToken } from "@dongle/api/utils/jwt.util";
import { revalidateTag } from "next/cache";

export interface PresidentInfoActionState {
  fieldErrors?: {
    presidentName?: string;
    presidentContact?: string;
    username?: string;
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  };
  success?: boolean;
  error?: string;
}

export async function presidentInfoFormAction(
  prevState: PresidentInfoActionState,
  formData: FormData
): Promise<PresidentInfoActionState> {
  const presidentName = formData.get("presidentName") as string;
  const presidentContact = formData.get("presidentContact") as string;
  const username = formData.get("username") as string;
  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  // 클라이언트 사이드 검증
  const fieldErrors: {
    presidentName?: string;
    presidentContact?: string;
    username?: string;
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  } = {};

  // 회장 이름 검증
  if (!presidentName) {
    fieldErrors.presidentName = "회장 이름을 입력해주세요";
  } else if (presidentName.length < 2) {
    fieldErrors.presidentName = "회장 이름은 최소 2자 이상이어야 합니다";
  } else if (presidentName.length > 20) {
    fieldErrors.presidentName = "회장 이름은 최대 20자 이하여야 합니다";
  }

  // 회장 연락처 검증
  if (!presidentContact) {
    fieldErrors.presidentContact = "회장 연락처를 입력해주세요";
  } else if (!/^010-\d{4}-\d{4}$/.test(presidentContact)) {
    fieldErrors.presidentContact =
      "올바른 연락처 형식을 입력해주세요 (010-0000-0000)";
  }

  // 비밀번호 변경 관련 검증 (비밀번호가 입력된 경우에만)
  if (currentPassword || newPassword || confirmPassword) {
    if (!currentPassword) {
      fieldErrors.currentPassword = "현재 비밀번호를 입력해주세요";
    }

    if (!newPassword) {
      fieldErrors.newPassword = "새 비밀번호를 입력해주세요";
    }

    if (!confirmPassword) {
      fieldErrors.confirmPassword = "비밀번호 확인을 입력해주세요";
    } else if (newPassword && newPassword !== confirmPassword) {
      fieldErrors.confirmPassword = "비밀번호가 일치하지 않습니다";
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      fieldErrors,
    };
  }

  try {
    // 쿠키에서 사용자 ID 추출
    const accessToken = await getAccessTokenFromServerCookie();
    if (!accessToken) {
      return {
        success: false,
        error: "사용자 정보를 가져올 수 없습니다.",
      };
    }
    const payload = decodeJwtToken(accessToken);
    const userId = payload?.user_id;
    if (!payload || !userId) {
      return {
        success: false,
        error: "사용자 정보를 가져올 수 없습니다.",
      };
    }

    // 업데이트할 데이터 구성
    const updateData: UpdateUserRequest = {
      name: presidentName,
      phone: presidentContact,
    };

    // 아이디가 입력된 경우에만 추가
    if (username) {
      updateData.name = username;
    }

    // 비밀번호가 입력된 경우에만 추가
    if (newPassword) {
      updateData.password = newPassword;
      // TODO: 현재 비밀번호 검증 로직 추가 필요
    }

    await patchUserService(Number(userId), updateData);

    // 사용자 정보 캐시 초기화
    revalidateTag("user");
    revalidateTag(`user-${userId}`);

    // 회장 정보 변경 시 해당 동아리 정보 캐시 초기화
    const clubId = getUserClubIdFromToken(accessToken);
    if (clubId) {
      revalidateTag("club");
      revalidateTag(`club-${clubId}`);
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("회장 정보 수정 중 오류 발생:", error);
    return {
      success: false,
      error: "회장 정보 수정에 실패했습니다. 다시 시도해주세요.",
    };
  }
}
