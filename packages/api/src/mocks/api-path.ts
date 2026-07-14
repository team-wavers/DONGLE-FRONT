/**
 * API_URL이 `.../v1` 일 때 MSW가 매칭할 path 패턴.
 * 호스트는 와일드카드로 두고 pathname만 `/v1/...`에 맞춘다.
 */
export function apiPath(path: `/${string}`): `*/v1${string}` {
    return `*/v1${path}`;
}
