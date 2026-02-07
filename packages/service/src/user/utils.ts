import { User } from "@dongle/types/user/user.d";

/**
 * 사용자 목록 필터링 함수
 * @param users - 필터링할 사용자 배열
 * @param excludeLoginIds - 제외할 login_id 배열
 * @returns 필터링된 사용자 배열
 */
export function filterUsers(users: User[], excludeLoginIds?: string[]): User[] {
    if (!excludeLoginIds || excludeLoginIds.length === 0) {
        return users;
    }

    // Set을 사용하여 O(1) 조회 성능 최적화
    const excludeSet = new Set(excludeLoginIds);
    return users.filter((user) => !excludeSet.has(user.login_id));
}
