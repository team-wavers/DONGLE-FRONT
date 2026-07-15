/**
 * Next는 `process.env.NEXT_PUBLIC_*` 직접 참조를 빌드 시 인라인한다.
 * bracket 접근으로 runtime `.env.local` 값을 읽는다.
 */
export function isMswEnabled(): boolean {
    return process.env["NEXT_PUBLIC_USE_MSW"] === "1";
}
