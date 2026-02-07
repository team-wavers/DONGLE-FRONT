# API 엔드포인트 규격 검사 결과

검사 일자: 2024년
검사 대상: `src/feature` 폴더의 모든 기능

---

## 검사 방법

API.md 문서의 엔드포인트 규격과 현재 구현된 코드를 비교하여:

-   ✅ 구현됨: 엔드포인트가 정확히 구현됨
-   ⚠️ 부분 구현: 구현되었으나 규격과 차이가 있음
-   ❌ 미구현: 엔드포인트가 구현되지 않음

---

## 1. 인증 (Auth) 기능 검사

### ✅ POST /v1/auth/login

-   **파일**: `src/feature/auth/service/auth.service.ts`
-   **상태**: 구현됨
-   **문제점**:
    -   `LoginResponse` 타입에 `tokenType`, `expiresIn` 필드가 없음
    -   API 문서: `{ accessToken, refreshToken, tokenType, expiresIn }`
    -   현재 구현: `{ accessToken, refreshToken }` (auth.response.ts)

### ✅ POST /v1/auth/refresh

-   **파일**: `src/feature/auth/service/auth.service.ts`
-   **상태**: 구현됨
-   **비고**: `RefreshTokenResponse`에는 `tokenType`, `expiresIn` 포함되어 있음

### ✅ POST /v1/auth/logout

-   **파일**: `src/feature/auth/service/auth.service.ts`, `src/feature/auth/action/logout-form.action.ts`
-   **상태**: 구현됨

### ❌ POST /v1/auth/verify

-   **상태**: 미구현
-   **API 문서 규격**:
    -   요청: `{ token: string }`
    -   응답: `{ userId, login_id, name, role, club_id }`
-   **권장사항**: 토큰 유효성 검증을 위한 서비스 함수 추가 필요

### ⚠️ 비밀번호 변경 (change-password)

-   **파일**: `src/feature/auth/action/change-password-form.action.ts`
-   **상태**: API 문서에 별도 엔드포인트 없음 (PATCH /v1/users/:id 사용)
-   **비고**: 올바른 방식으로 구현됨

---

## 2. 사용자 (User) 기능 검사

### ✅ POST /v1/users

-   **파일**: `src/feature/user/service/user.service.ts`
-   **상태**: 구현됨
-   **비고**: 요청 바디 필드 일치

### ✅ GET /v1/users

-   **파일**: `src/feature/user/service/user.service.ts`
-   **상태**: 구현됨

### ✅ GET /v1/users/:id

-   **파일**: `src/feature/user/service/user.service.ts`
-   **상태**: 구현됨

### ✅ PATCH /v1/users/:id

-   **파일**: `src/feature/user/service/user.service.ts`
-   **상태**: 구현됨

### ✅ DELETE /v1/users/:id

-   **파일**: `src/feature/user/service/user.service.ts`, `src/feature/user/action/user-form.action.ts`
-   **상태**: 구현됨

---

## 3. 동아리 (Club) 기능 검사

### ✅ POST /v1/clubs

-   **파일**: `src/feature/club/service/club.service.ts`
-   **상태**: 구현됨

### ✅ GET /v1/clubs

-   **파일**: `src/feature/club/service/club.service.ts`
-   **상태**: 구현됨

### ✅ GET /v1/clubs/:id

-   **파일**: `src/feature/club/service/club.service.ts`
-   **상태**: 구현됨

### ✅ PUT /v1/clubs/:id

-   **파일**: `src/feature/club/service/club.service.ts`
-   **상태**: 구현됨

### ✅ DELETE /v1/clubs/:id

-   **파일**: `src/feature/club/service/club.service.ts`
-   **상태**: 구현됨

### ✅ POST /v1/clubs/registration-urls

-   **파일**: `src/feature/club/service/club.service.ts`
-   **상태**: 구현됨
-   **함수명**: `issueClubRegisterUrlService`

### ❌ GET /v1/clubs/reports

-   **상태**: 미구현
-   **API 문서 규격**:
    -   인증: 필요 (JWT)
    -   권한: ADMIN
    -   응답: 리포트 배열
-   **권장사항**: 모든 동아리 리포트를 조회하는 서비스 함수 추가 필요

### ❌ POST /v1/clubs/:id/icons

-   **상태**: 미구현
-   **API 문서 규격**:
    -   인증: 필요 (JWT)
    -   권한: PRESIDENT
    -   Content-Type: multipart/form-data
    -   요청 바디: `file` (File)
    -   응답: 이미지 URL (string)
-   **권장사항**: 동아리 아이콘 업로드 서비스 함수 추가 필요

### ⚠️ POST /v1/clubs/:id/report-images

-   **파일**: `src/feature/club/service/club.report.service.ts`
-   **상태**: 부분 구현
-   **문제점**:
    -   API 문서: `multipart/form-data` 형식으로 파일 업로드
    -   현재 구현: `instance.post()`를 사용하는데, `FetchInstance`의 `post` 메서드는 기본적으로 `Content-Type: application/json`으로 설정됨
    -   `uploadClubReportImageService`에서 `{ file: image }`를 JSON으로 보내고 있음
-   **권장사항**: `FormData`를 사용하여 `multipart/form-data` 형식으로 변경 필요

### ✅ GET /v1/clubs/:id/reports

-   **파일**: `src/feature/club/service/club.report.service.ts`
-   **상태**: 구현됨
-   **함수명**: `getClubReportListService`

### ✅ POST /v1/clubs/:id/reports

-   **파일**: `src/feature/club/service/club.report.service.ts`
-   **상태**: 구현됨
-   **함수명**: `createClubReportService`

### ✅ PUT /v1/clubs/:id/reports/:reportId

-   **파일**: `src/feature/club/service/club.report.service.ts`
-   **상태**: 구현됨
-   **함수명**: `updateClubReportService`

### ✅ DELETE /v1/clubs/:id/reports/:reportId

-   **파일**: `src/feature/club/service/club.report.service.ts`
-   **상태**: 구현됨
-   **함수명**: `deleteClubReportService`

### ⚠️ GET /v1/clubs/:id/reports/:reportId (비공식)

-   **파일**: `src/feature/club/service/club.report.service.ts`
-   **상태**: API 문서에 없는 엔드포인트
-   **비고**: `getClubReportService` 함수가 있으나, API 문서에는 해당 엔드포인트가 명시되어 있지 않음. 실제로는 `getClubReportFromListService`를 사용하여 목록에서 찾는 방식으로 구현됨

---

## 4. 리포트 (Report) 기능 검사

Report 기능은 Club 기능에 포함되어 있어 위의 Club 기능 검사에 포함됨.

---

## 전체 요약

### 구현 통계

-   ✅ 완전 구현: 21개
-   ⚠️ 부분 구현: 3개
-   ❌ 미구현: 3개

### 우선순위별 수정 필요 항목

#### 높은 우선순위

1. **POST /v1/clubs/:id/report-images** - multipart/form-data 형식으로 변경
2. **LoginResponse 타입** - tokenType, expiresIn 필드 추가

#### 중간 우선순위

3. **POST /v1/auth/verify** - 토큰 검증 엔드포인트 구현
4. **POST /v1/clubs/:id/icons** - 동아리 아이콘 업로드 구현

#### 낮은 우선순위

5. **GET /v1/clubs/reports** - 모든 동아리 리포트 조회 (ADMIN 전용)

---

## 상세 문제점 및 수정 방안

### 1. LoginResponse 타입 수정 필요

**파일**: `src/feature/auth/types/auth.response.ts`

**현재**:

```typescript
export type LoginResponse = Response<{
    accessToken: string;
    refreshToken: string;
}>;
```

**수정안**:

```typescript
export type LoginResponse = Response<{
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
}>;
```

### 2. 이미지 업로드 multipart/form-data 형식 변경

**파일**: `src/feature/club/service/club.report.service.ts`

**현재**:

```typescript
export const uploadClubReportImageService = async (club_id: number, image: File): Promise<ClubReportImageResponse> => {
    const response = await instance.post(`/clubs/${club_id}/report-images`, {
        file: image,
    });
    return response as ClubReportImageResponse;
};
```

**수정안**:

-   `FetchInstance`에 파일 업로드용 메서드 추가 또는
-   `FormData`를 직접 사용하여 `multipart/form-data` 형식으로 전송

### 3. POST /v1/auth/verify 구현 필요

**권장 파일 위치**: `src/feature/auth/service/auth.service.ts`

**예시**:

```typescript
export const verifyTokenService = async (
    token: string
): Promise<
    Response<{
        userId: number;
        login_id: string;
        name: string;
        role: string;
        club_id: number;
    }>
> => {
    const response = await instance.post("/auth/verify", { token });
    return response as VerifyTokenResponse;
};
```

### 4. POST /v1/clubs/:id/icons 구현 필요

**권장 파일 위치**: `src/feature/club/service/club.service.ts`

**예시**:

```typescript
export const uploadClubIconService = async (id: number, icon: File): Promise<Response<string>> => {
    // FormData를 사용하여 multipart/form-data 형식으로 전송
    const formData = new FormData();
    formData.append("file", icon);

    const response = await instance.post(`/clubs/${id}/icons`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return response as Response<string>;
};
```

### 5. GET /v1/clubs/reports 구현 필요

**권장 파일 위치**: `src/feature/club/service/club.report.service.ts`

**예시**:

```typescript
export const getAllClubReportsService = async (): Promise<ClubReportListResponse> => {
    const response = await instance.get("/clubs/reports", {
        next: {
            tags: ["report", "all-reports"],
        },
    });
    return response as ClubReportListResponse;
};
```
