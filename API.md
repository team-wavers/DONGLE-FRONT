# DONGLE API 엔드포인트 문서

## 기본 정보

-   **Base URL**: `/v1` (v1 API)
-   **인증 방식**: JWT Bearer Token
-   **Content-Type**: `application/json`

---

## 1. 루트 엔드포인트

### GET /

기본 헬로 월드 엔드포인트

**인증**: 불필요

**응답**:

```json
"Hello World!"
```

---

## 2. Health Check

### GET /v1/healthCheck

서버 상태 확인

**인증**: 불필요

**응답**:

```json
{
    "status": "ok"
}
```

---

## 3. 인증 (Auth)

### POST /v1/auth/login

사용자 로그인

**인증**: 불필요

**요청 바디**:

```json
{
    "login_id": "string",
    "password": "string"
}
```

**응답**:

```json
{
    "accessToken": "string",
    "refreshToken": "string",
    "tokenType": "Bearer",
    "expiresIn": 900000
}
```

---

### POST /v1/auth/refresh

액세스 토큰 재발급

**인증**: 불필요

**요청 바디**:

```json
{
    "refreshToken": "string"
}
```

**응답**:

```json
{
    "accessToken": "string",
    "refreshToken": "string",
    "tokenType": "Bearer",
    "expiresIn": 900000
}
```

---

### POST /v1/auth/logout

사용자 로그아웃

**인증**: 필요 (JWT)

**헤더**:

```
Authorization: Bearer {accessToken}
```

**응답**:

```json
{
    "message": "로그아웃되었습니다."
}
```

---

### POST /v1/auth/verify

토큰 유효성 검증

**인증**: 불필요

**요청 바디**:

```json
{
    "token": "string"
}
```

**응답**:

```json
{
    "userId": 1,
    "login_id": "string",
    "name": "string",
    "role": "string",
    "club_id": 1
}
```

**에러 응답**:

-   `401 Unauthorized`: 토큰이 만료되었습니다.
-   `400 Bad Request`: 유효하지 않은 토큰입니다.

---

## 4. 사용자 (Users)

### POST /v1/users

사용자 생성

**인증**: 불필요

**요청 바디**:

```json
{
    "name": "string",
    "login_id": "string",
    "password": "string",
    "role": "string",
    "phone": "string",
    "refresh_token": "string" // 선택
}
```

**응답**: 생성된 사용자 객체

---

### GET /v1/users

모든 사용자 조회

**인증**: 필요 (JWT)
**권한**: ADMIN 또는 PRESIDENT

**헤더**:

```
Authorization: Bearer {accessToken}
```

**응답**: 사용자 배열

---

### GET /v1/users/:id

특정 사용자 조회

**인증**: 필요 (JWT)
**권한**: ADMIN 또는 PRESIDENT

**파라미터**:

-   `id` (number): 사용자 ID

**헤더**:

```
Authorization: Bearer {accessToken}
```

**응답**: 사용자 객체

---

### PATCH /v1/users/:id

사용자 정보 수정

**인증**: 필요 (JWT)

**파라미터**:

-   `id` (number): 사용자 ID

**헤더**:

```
Authorization: Bearer {accessToken}
```

**요청 바디 (모든 필드 선택)**:

```json
{
    "name": "string", // 선택
    "login_id": "string", // 선택
    "password": "string", // 선택
    "role": "string", // 선택
    "phone": "string", // 선택
    "refresh_token": "string" // 선택
}
```

**응답**: 수정된 사용자 객체

---

### DELETE /v1/users/:id

사용자 삭제

**인증**: 필요 (JWT)
**권한**: ADMIN

**파라미터**:

-   `id` (number): 사용자 ID

**헤더**:

```
Authorization: Bearer {accessToken}
```

**응답**: 삭제 결과

---

## 5. 동아리 (Clubs)

### POST /v1/clubs

동아리 생성

**인증**: 불필요 (일회용 키 필요)

**요청 바디**:

```json
{
    "key": "string",
    "name": "string",
    "category": "string",
    "sns": {}, // 선택
    "tags": ["string"], // 선택
    "is_recruiting": false, // 선택
    "location": "string", // 선택
    "recruit_start": "2024-01-01T00:00:00Z", // 선택
    "recruit_end": "2024-01-01T00:00:00Z", // 선택
    "description": "string", // 선택
    "main_activities": "string", // 선택
    "president_id": 1 // 선택
}
```

**응답**: 생성된 동아리 객체

---

### GET /v1/clubs

모든 동아리 조회

**인증**: 불필요

**응답**: 동아리 배열

---

### GET /v1/clubs/:id

특정 동아리 조회

**인증**: 불필요

**파라미터**:

-   `id` (number): 동아리 ID

**응답**: 동아리 객체

---

### PUT /v1/clubs/:id

동아리 정보 수정

**인증**: 필요 (JWT)
**권한**: ADMIN 또는 PRESIDENT

**파라미터**:

-   `id` (number): 동아리 ID

**헤더**:

```
Authorization: Bearer {accessToken}
```

**요청 바디 (모든 필드 선택)**:

```json
{
    "key": "string", // 선택
    "name": "string", // 선택
    "category": "string", // 선택
    "sns": {}, // 선택
    "tags": ["string"], // 선택
    "is_recruiting": false, // 선택
    "location": "string", // 선택
    "recruit_start": "2024-01-01T00:00:00Z", // 선택
    "recruit_end": "2024-01-01T00:00:00Z", // 선택
    "description": "string", // 선택
    "main_activities": "string", // 선택
    "president_id": 1 // 선택
}
```

**응답**: 수정된 동아리 객체

---

### DELETE /v1/clubs/:id

동아리 삭제

**인증**: 필요 (JWT)
**권한**: ADMIN

**파라미터**:

-   `id` (number): 동아리 ID

**헤더**:

```
Authorization: Bearer {accessToken}
```

**응답**: 삭제 결과

---

### POST /v1/clubs/registration-urls

동아리 등록 URL 생성

**인증**: 필요 (JWT)
**권한**: ADMIN 또는 PRESIDENT

**헤더**:

```
Authorization: Bearer {accessToken}
```

**응답**:

```json
{
    "url": "string"
}
```

---

### GET /v1/clubs/reports

모든 동아리 리포트 조회

**인증**: 필요 (JWT)
**권한**: ADMIN

**헤더**:

```
Authorization: Bearer {accessToken}
```

**응답**: 리포트 배열

---

### POST /v1/clubs/:id/icons

동아리 아이콘 이미지 업로드

**인증**: 필요 (JWT)
**권한**: PRESIDENT

**Content-Type**: `multipart/form-data`

**파라미터**:

-   `id` (number): 동아리 ID

**헤더**:

```
Authorization: Bearer {accessToken}
```

**요청 바디**:

-   `file` (File): 이미지 파일

**제한**:

-   허용 MIME 타입: `image/jpeg`, `image/png`, `image/webp`
-   최대 파일 크기: 10MB

**응답**:

```json
"https://s3.ap-northeast-2.amazonaws.com/bucket-name/club-icons/{uuid}"
```

---

### POST /v1/clubs/:id/report-images

동아리 리포트 이미지 업로드

**인증**: 필요 (JWT)
**권한**: PRESIDENT

**Content-Type**: `multipart/form-data`

**파라미터**:

-   `id` (number): 동아리 ID

**헤더**:

```
Authorization: Bearer {accessToken}
```

**요청 바디**:

-   `file` (File): 이미지 파일

**제한**:

-   허용 MIME 타입: `image/jpeg`, `image/png`, `image/webp`
-   최대 파일 크기: 10MB

**응답**:

```json
"https://s3.ap-northeast-2.amazonaws.com/bucket-name/club-reports/{uuid}"
```

---

### GET /v1/clubs/:id/reports

특정 동아리의 리포트 조회

**인증**: 불필요

**파라미터**:

-   `id` (number): 동아리 ID

**응답**: 리포트 배열

---

### GET /v1/clubs/:id/reports/:reportId

특정 동아리의 리포트 단건 조회

**인증**: 불필요

**파라미터**:

-   `id` (number): 동아리 ID
-   `reportId` (number): 리포트 ID

**응답**: 리포트 객체

**에러 응답**:

-   `404 Not Found`: 해당 활동보고서가 존재하지 않습니다.

---

### POST /v1/clubs/:id/reports

동아리 리포트 생성

**인증**: 필요 (JWT)
**권한**: PRESIDENT

**파라미터**:

-   `id` (number): 동아리 ID

**헤더**:

```
Authorization: Bearer {accessToken}
```

**요청 바디**:

```json
{
    "title": "string",
    "content": "string",
    "image_urls": ["string"]
}
```

**응답**: 생성된 리포트 객체

---

### PUT /v1/clubs/:id/reports/:reportId

동아리 리포트 수정

**인증**: 필요 (JWT)
**권한**: PRESIDENT

**파라미터**:

-   `id` (number): 동아리 ID
-   `reportId` (number): 리포트 ID

**헤더**:

```
Authorization: Bearer {accessToken}
```

**요청 바디**:

```json
{
    "title": "string", // 선택
    "content": "string", // 선택
    "image_urls": ["string"] // 선택
}
```

**응답**: 수정된 리포트 객체

---

### DELETE /v1/clubs/:id/reports/:reportId

동아리 리포트 삭제

**인증**: 필요 (JWT)
**권한**: PRESIDENT

**파라미터**:

-   `id` (number): 동아리 ID
-   `reportId` (number): 리포트 ID

**헤더**:

```
Authorization: Bearer {accessToken}
```

**응답**: 삭제 결과

---

## 6. 메인 배너 (Main Banners)

### 공통 응답 스키마

#### MainBanner

```json
{
    "id": 1,
    "image_url": "https://cdn.example.com/banner.png",
    "link_url": "https://example.com",
    "publish_start_at": "2026-05-01T00:00:00.000Z",
    "publish_end_at": "2026-05-31T23:59:59.000Z",
    "is_active": true,
    "created_at": "2026-05-01T00:00:00.000Z",
    "updated_at": "2026-05-01T00:00:00.000Z",
    "deleted_at": null
}
```

**비고**:

-   `link_url`, `deleted_at`은 `null`일 수 있습니다.
-   공개/관리자 목록은 삭제되지 않은 배너만 반환합니다.
-   공개 목록은 `is_active`가 `true`이고 현재 시간이 `publish_start_at`과 `publish_end_at` 사이인 배너만 반환합니다.

---

### GET /v1/main-banners

사용자용 활성 메인 배너 목록 조회

**인증**: 불필요

**응답**: `MainBanner[]`

---

### GET /v1/main-banners/admin

관리자용 메인 배너 목록 조회

**인증**: 필요 (JWT)
**권한**: ADMIN

**헤더**:

```
Authorization: Bearer {accessToken}
```

**응답**: `MainBanner[]`

---

### GET /v1/main-banners/admin/:id

관리자용 메인 배너 단건 조회

**인증**: 필요 (JWT)
**권한**: ADMIN

**파라미터**:

-   `id` (number): 메인 배너 ID

**헤더**:

```
Authorization: Bearer {accessToken}
```

**응답**: `MainBanner`

**에러 응답**:

-   `404 Not Found`: 해당 배너가 존재하지 않습니다.

---

### POST /v1/main-banners

메인 배너 생성

**인증**: 필요 (JWT)
**권한**: ADMIN

**요청 바디**:

```json
{
    "image_url": "string",
    "link_url": "string",
    "publish_start_at": "2026-05-01 00:00:00",
    "publish_end_at": "2026-05-31 23:59:59",
    "is_active": true
}
```

**비고**:

-   `image_url`, `publish_start_at`, `publish_end_at`, `is_active`는 필수입니다.
-   `link_url`은 선택값이며 공백 또는 누락 시 `null`로 저장됩니다.
-   `link_url`은 최대 2048자입니다.
-   timezone이 없는 날짜/시간은 Seoul 기준으로 해석됩니다.
-   공개 시작일은 종료일보다 이전이어야 합니다.

**응답**: `MainBanner`

---

### PUT /v1/main-banners/:id

메인 배너 수정

**인증**: 필요 (JWT)
**권한**: ADMIN

**파라미터**:

-   `id` (number): 메인 배너 ID

**요청 바디**: 생성 요청 바디와 동일

**응답**: `MainBanner`

**에러 응답**:

-   `400 Bad Request`: 해당 배너가 존재하지 않습니다.

---

### DELETE /v1/main-banners/:id

메인 배너 삭제

**인증**: 필요 (JWT)
**권한**: ADMIN

**파라미터**:

-   `id` (number): 메인 배너 ID

**응답**: 삭제 결과

**에러 응답**:

-   `400 Bad Request`: 해당 배너가 존재하지 않습니다.

---

### POST /v1/main-banners/images

메인 배너 이미지 업로드

**인증**: 필요 (JWT)
**권한**: ADMIN

**Content-Type**: `multipart/form-data`

**요청 바디**:

-   `file` (File): 이미지 파일

**제한**:

-   허용 MIME 타입: `image/jpeg`, `image/png`, `image/webp`
-   최대 파일 크기: 10MB

**응답**:

```json
{
    "image_url": "https://s3.ap-northeast-2.amazonaws.com/bucket-name/main-banners/{uuid}"
}
```

---

## 7. 일정 (Club Schedules)

### 공통 응답 스키마

#### ClubSchedule

사용자/회장용 일정 응답 객체입니다.

```json
{
    "id": 1,
    "club_id": 1,
    "title": "정기 모임",
    "type": "regular_meeting",
    "start_at": "2026-05-20T10:00:00.000Z",
    "end_at": "2026-05-20T12:00:00.000Z",
    "is_public": true,
    "location": "학생회관",
    "description": "5월 정기 모임",
    "external_url": "https://forms.example.com/schedule",
    "created_at": "2026-05-01T00:00:00.000Z",
    "updated_at": "2026-05-01T00:00:00.000Z",
    "deleted_at": null
}
```

#### AdminClubSchedule

관리자용 일정 응답 객체입니다. `ClubSchedule`에 `club` 정보가 포함됩니다.

```json
{
    "id": 1,
    "club_id": 1,
    "title": "정기 모임",
    "type": "regular_meeting",
    "start_at": "2026-05-20T10:00:00.000Z",
    "end_at": "2026-05-20T12:00:00.000Z",
    "is_public": true,
    "location": "학생회관",
    "description": "5월 정기 모임",
    "external_url": "https://forms.example.com/schedule",
    "club": {
        "id": 1,
        "name": "UCDC",
        "category": "학술"
    },
    "created_at": "2026-05-01T00:00:00.000Z",
    "updated_at": "2026-05-01T00:00:00.000Z",
    "deleted_at": null
}
```

**비고**:

-   `type`: `recruitment`, `event`, `regular_meeting`
-   `club_id`: 일정이 속한 동아리 ID입니다. 사용자/회장용 응답에는 `club` 객체 없이 `club_id`만 포함됩니다.
-   관리자용 응답은 `club_id`와 함께 `club.id`, `club.name`, `club.category`를 포함합니다.
-   `location`, `description`, `external_url`, `deleted_at`은 `null`일 수 있습니다.
-   삭제되지 않은 일정 응답의 `deleted_at`은 `null`입니다.

---

### GET /v1/clubs/:id/public-schedules

동아리 상세 사용자용 공개 일정 조회

**인증**: 불필요

**파라미터**:

-   `id` (number): 동아리 ID

**응답**: `ClubSchedule[]`

---

### GET /v1/clubs/:id/schedules

회장용 동아리 일정 목록 조회

**인증**: 필요 (JWT)
**권한**: PRESIDENT

**쿼리**:

-   `status` (선택): `all`, `public`, `private`, `upcoming`, `past`

**응답**: `ClubSchedule[]`

---

### POST /v1/clubs/:id/schedules

회장용 동아리 일정 생성

**인증**: 필요 (JWT)
**권한**: PRESIDENT

**요청 바디**:

```json
{
    "title": "string",
    "type": "regular_meeting",
    "start_at": "2026-05-20 19:00:00",
    "end_at": "2026-05-20 21:00:00",
    "is_public": true,
    "location": "string",
    "description": "string",
    "external_url": "string"
}
```

**비고**:

-   `type`: `recruitment`, `event`, `regular_meeting`
-   선택값은 `location`, `description`, `external_url`만 지원합니다.
-   첨부 이미지와 신청 링크 별도 필드는 지원하지 않습니다.
-   `title`, `location`은 최대 100자입니다.
-   `external_url`은 최대 2048자이며 공백 또는 누락 시 `null`로 저장됩니다.
-   timezone이 없는 날짜/시간은 Seoul 기준으로 해석됩니다.
-   시작일시는 종료일시보다 이전이어야 합니다.

**응답**: `ClubSchedule`

---

### PATCH /v1/clubs/:id/schedules/:scheduleId

회장용 동아리 일정 수정

**인증**: 필요 (JWT)
**권한**: PRESIDENT

**요청 바디**: 생성 요청 바디의 부분 집합

**응답**: `ClubSchedule`

---

### DELETE /v1/clubs/:id/schedules/:scheduleId

회장용 동아리 일정 삭제

**인증**: 필요 (JWT)
**권한**: PRESIDENT

**응답**: 삭제 결과

---

### GET /v1/club-schedules

관리자용 전체 일정 목록 조회

**인증**: 필요 (JWT)
**권한**: ADMIN

**쿼리**:

-   `clubName` (선택): 동아리명 검색
-   `category` (선택): 분과
-   `type` (선택): 일정 유형
-   `isPublic` (선택): `true`, `false`
-   `from`, `to` (선택): 조회 기간

**응답**: `AdminClubSchedule[]`

---

### GET /v1/club-schedules/calendar

관리자용 월간 캘린더 일정 조회

**인증**: 필요 (JWT)
**권한**: ADMIN

**쿼리**:

-   `from` (필수): 조회 시작일시
-   `to` (필수): 조회 종료일시

**응답**: `AdminClubSchedule[]`

---

### GET /v1/club-schedules/:scheduleId

관리자용 일정 상세 조회

**인증**: 필요 (JWT)
**권한**: ADMIN

**응답**: `AdminClubSchedule`

---

### PATCH /v1/club-schedules/:scheduleId/admin-status

관리자용 일정 공개 상태 변경

**인증**: 필요 (JWT)
**권한**: ADMIN

**요청 바디**:

```json
{
    "is_public": false
}
```

**응답**: `AdminClubSchedule`

---

### DELETE /v1/club-schedules/:scheduleId

관리자용 일정 삭제

**인증**: 필요 (JWT)
**권한**: ADMIN

**응답**: 삭제 결과

---

## 권한 (Roles)

-   **ADMIN**: 관리자
-   **PRESIDENT**: 동아리 회장
-   **USER**: 일반 사용자

---

## 인증 헤더 형식

```
Authorization: Bearer {accessToken}
```

JWT 토큰은 로그인(`/v1/auth/login`) 또는 토큰 재발급(`/v1/auth/refresh`) 엔드포인트를 통해 획득할 수 있습니다.
