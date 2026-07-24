/** API/DB에서 tags가 null일 수 있어 표시·폼 기본값에 쓰기 전 배열로 정규화한다. */
export function normalizeClubTags(tags: readonly string[] | null | undefined): string[] {
    return Array.isArray(tags) ? [...tags] : [];
}
