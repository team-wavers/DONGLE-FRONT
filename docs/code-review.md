# DONGLE-FRONT 코드리뷰

작성일: 2026-06-17
브랜치 기준: `fix/log` (리뷰 시점)
대상: `DONGLE-ADMIN`, `DONGLE-CLIENT`, 공유 패키지(`@dongle/api`, `@dongle/service`, `@dongle/types`, `@dongle/ui`, `@dongle/utils`)
리뷰 축: **런타임 에러 · API 계약 위험 · 캐시/상태 회귀**

---

## 1. 마스터 체크리스트

| ID | 항목 | 카테고리 | 심각도 | 상태 |
|---|---|---|---|---|
| RT-1 | `parseJsonStringArray` JSON.parse try-catch 없음 | 런타임 | Critical | **closed** |
| RT-2 | `club.sns?.instagram` optional chaining 누락 | 런타임 | High | **closed** |
| RT-3 | `report.image_urls.some()` null guard 없음 | 런타임 | High | **closed** |
| RT-4 | `response.error?.detail` 미검증 | 런타임 | High | **closed** |
| RT-5 | logout startTransition 에러 미처리 | 런타임 | Medium | **closed** |
| API-1 | ~~`schedule.isPublic` — 실제 타입은 `is_public`~~ | API 계약 | ~~Critical~~ | **closed (오탐)** |
| API-2 | 삭제 Action `.success` vs `.ok` 혼용 (프론트 컨벤션 미준수) | API 계약 | Critical | **closed** |
| API-3 | `instance` throw-on-error로 `isSuccess` 분기 도달 불가능 (서버 스펙 확인됨) | API 계약 | Critical | **closed** |
| CACHE-1 | 클럽/배너 삭제 후 list 캐시 태그 누락 | 캐시/상태 | High | **closed (오탐)** |
| CACHE-2 | 월간 이동 시 로컬 상태 전체 교체 | 캐시/상태 | Medium | **closed (2026-06-17 수정)** |
| CACHE-3 | schedule 삭제 후 list 태그 범위 누락 | 캐시/상태 | Medium | **closed (오탐)** |

---

## 2. 런타임 에러

### RT-1. `parseJsonStringArray` — JSON.parse try-catch 없음

| | |
|---|---|
| **심각도** | Critical |
| **상태** | **closed (2026-06-17 수정)** |
| **파일** | `apps/DONGLE-ADMIN/src/feature/report/validation/report-update-payload.ts` L21 |

**문제**

```typescript
export function parseJsonStringArray(value: string | null | undefined) {
    if (!value) return [] as string[];
    const parsed = JSON.parse(value); // SyntaxError 전파 → 보고서 수정 액션 전체 크래시
    return Array.isArray(parsed) ? parsed.filter(...) : [];
}
```

URL 파라미터나 폼 데이터가 올바른 JSON이 아닐 경우 `SyntaxError`가 상위로 전파돼 보고서 수정 액션 전체가 크래시된다.

**수정**

```typescript
export function parseJsonStringArray(value: string | null | undefined) {
    if (!value) return [] as string[];
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed)
            ? parsed.filter((item): item is string => typeof item === "string")
            : [];
    } catch {
        return [];
    }
}
```

---

### RT-2. `club.sns.instagram` — optional chaining 누락

| | |
|---|---|
| **심각도** | High |
| **상태** | **closed (2026-06-17 수정)** |
| **파일** | `apps/DONGLE-CLIENT/src/app/clubs/[clubId]/page.tsx` L122-123 |

**문제**

```typescript
const instagramUrl = normalizeSocialUrl("instagram", club.sns.instagram); // sns가 null이면 TypeError
const youtubeUrl   = normalizeSocialUrl("youtube",   club.sns.youtube);
```

같은 파일 L128의 `club.president?.phone`은 optional chaining이 있으나 `sns`만 누락됐다. API가 `sns: null`을 반환하는 동아리에서 상세 페이지가 크래시된다.

**수정**

```typescript
const instagramUrl = normalizeSocialUrl("instagram", club.sns?.instagram);
const youtubeUrl   = normalizeSocialUrl("youtube",   club.sns?.youtube);
```

---

### RT-3. `report.image_urls.some()` — null/undefined 미검증

| | |
|---|---|
| **심각도** | High |
| **상태** | **closed (2026-06-17 수정)** |
| **파일** | `apps/DONGLE-CLIENT/src/app/clubs/[clubId]/reports/[reportId]/page.tsx` L113 |

**문제**

```typescript
const hasReportImages = report.image_urls.some((url) => url.trim().length > 0);
// image_urls가 null / undefined면 TypeError
```

L100에서 `!report` 체크는 있지만 `image_urls` 필드 자체의 null 여부는 검증하지 않는다.

**수정**

```typescript
const hasReportImages =
    Array.isArray(report.image_urls) &&
    report.image_urls.some((url) => url.trim().length > 0);
```

---

### RT-4. `response.error.detail` — error 객체 미검증

| | |
|---|---|
| **심각도** | High |
| **상태** | **closed (2026-06-17 수정)** |
| **파일** | `apps/DONGLE-ADMIN/src/hooks/use-url-generator.ts` L49 |

**문제**

```typescript
if (!response.isSuccess) {
    setState({ success: false, error: response.error.detail });
    // response.error 자체가 undefined일 수 있음 → TypeError
```

**수정**

```typescript
setState({ success: false, error: response.error?.detail });
```

---

### RT-5. logout `startTransition` — fetch 실패 시 에러 미처리

| | |
|---|---|
| **심각도** | Medium |
| **상태** | **closed (2026-06-17 수정)** |
| **파일** | `apps/DONGLE-ADMIN/src/app/(대시보드)/(동아리)/(메뉴)/[clubId]/not-found.tsx` L13-17 |

**문제**

```typescript
startTransition(async () => {
    await fetch("/api/auth/logout", { method: "POST" }); // 실패해도 무시
    router.replace("/login");
    router.refresh();
});
```

fetch 실패 시 로그아웃이 안 된 상태로 `/login`으로 이동해 세션이 불일치 상태에 빠질 수 있다.

**수정**

```typescript
startTransition(async () => {
    try {
        const res = await fetch("/api/auth/logout", { method: "POST" });
        if (!res.ok) throw new Error("logout failed");
    } catch {
        // 실패해도 클라이언트 세션은 비워야 함
    } finally {
        router.replace("/login");
        router.refresh();
    }
});
```

---

## 3. API 계약 위험

> 2026-06-17 추가 검증: `../DONGLE-SERVER` 실제 소스(엔티티/DTO/매퍼/전역 인터셉터)를 확인하여 아래 3개 항목을 서버 스펙 기준으로 재작성함.

### API-1. (제거됨 — false positive) `schedule.isPublic` 관련 항목

| | |
|---|---|
| **심각도** | ~~Critical~~ |
| **상태** | **closed (오탐)** |
| **파일** | `apps/DONGLE-ADMIN/src/feature/schedule/form/schedule-form.schema.ts` L175 |

**재검증 결과 (2026-06-17)**

최초 리뷰는 `createClubScheduleDefaultValues`가 `@dongle/types/club/club.schedule`의 `ClubSchedule`(snake_case `is_public`)을 받는다고 가정했으나, 실제로 이 함수가 import하는 `ClubSchedule`은 **로컬 타입** `apps/DONGLE-ADMIN/src/feature/schedule/schedule.types.ts`이며 여기는 `isPublic: boolean`(camelCase)으로 정의돼 있다.

```typescript
// schedule-form.schema.ts L4 — @dongle/types가 아니라 로컬 타입을 import
import type { ClubSchedule, ScheduleType } from "../schedule.types";
```

그리고 raw API 응답(`is_public`)에서 로컬 뷰(`isPublic`)로의 변환은 `schedule.utils.ts` L435, L457에서 이미 이뤄지고 있다.

```typescript
// schedule.utils.ts
isPublic: schedule.is_public, // raw API → 로컬 뷰 변환, 정상 동작
```

호출부(`schedule-form-dialog.tsx`)도 항상 이 변환을 거친 로컬 `ClubSchedule`을 전달하므로 `schedule.isPublic`은 `undefined`가 되지 않는다. 실제 버그가 아니므로 항목을 닫는다.

---

### API-2. 삭제 Action 반환 타입 혼용 — `.success` vs `.ok`

| | |
|---|---|
| **심각도** | Critical |
| **상태** | **closed (2026-06-17 수정)** |

**서버 스펙 확인**

`DONGLE-SERVER`에는 `success`/`ok` 개념이 존재하지 않는다. 전역 인터셉터(`src/common/response.interceptor.ts`)가 모든 응답을 `{ isSuccess, result }` / `{ isSuccess, error }`로만 통일해서 내려준다. 즉 이 항목은 서버 계약 불일치가 아니라 **프론트 내부 컨벤션 미준수**다.

`apps/DONGLE-ADMIN/src/shared/action/action-result.ts`에 정의된 정식 헬퍼(`ActionResult`, `actionSuccess`, `actionFailure`)는 이미 `.ok` 필드로 표준화돼 있다.

| 액션 | 반환 형태 | 호출부 확인 키 | 정식 `ActionResult` 사용 여부 |
|---|---|---|---|
| `deleteClubAction` | `{ success: boolean; error?: string }` | `.success` | ❌ 자체 타입 |
| `deleteUserAction` | `{ success: boolean; error?: string }` | `.success` | ❌ 자체 타입 |
| `deleteReportAction` | `{ success: boolean; error?: string }` | `.success` | ❌ 자체 타입 |
| `deleteMainBannerAction` | `ActionResult<string, null>` | `.ok` | ✅ |

`main-banner-delete-button.tsx`만 정식 `ActionResult`(`.ok`)를 따르고, 나머지 삭제 액션들은 헬퍼를 쓰지 않고 임의로 `{success, error}` 형태를 만들어 사용 중이다.

**수정**

신규/기존 삭제 액션 모두 `apps/DONGLE-ADMIN/src/shared/action/action-result.ts`의 `ActionResult<void, null>` + `actionSuccess`/`actionFailure`로 통일한다.

```typescript
// 통일 패턴
export async function deleteXxxAction(id: number): Promise<ActionResult<string, null>> {
    ...
    if (!result.isSuccess) return actionFailure({ formError: "..." });
    revalidateTags(...);
    return actionSuccess();
}
```

---

### API-3. `instance`의 throw-on-error로 인해 service layer의 `isSuccess` 분기가 도달 불가능

| | |
|---|---|
| **심각도** | Critical (기존 문서의 "High"에서 상향) |
| **상태** | **closed** |
| **파일** | `packages/api/src/instance.ts`, `packages/api/src/handle-error-response.ts`, `packages/service/src/club/club.schedule.service.ts`, `packages/service/src/club/club.service.ts`, `apps/DONGLE-ADMIN/src/feature/club/action/delete-club.action.ts` |

**서버 스펙 확인**

`DONGLE-SERVER/src/common/response.interceptor.ts`(전역 `useGlobalInterceptors`)는 다음을 보장한다.

- 성공: 2xx + `{ isSuccess: true, result: data }`
- 실패: 실제 HTTP 에러 상태코드(400/401/403/404/409/500 등) + `{ isSuccess: false, error: { message, detail, stack? } }`

즉 서버는 **모든 도메인에서 항상 일관되게** `isSuccess` 필드와 함께 응답하며, 실패는 항상 non-2xx 상태코드를 동반한다. 서버 자체는 불일치가 없다.

**실제 문제 — 프론트 `FetchInstance`가 이 계약을 깨고 있음**

`packages/api/src/instance.ts`의 `get/post/put/patch/delete`는 모두 다음 패턴이다.

```typescript
const response = await this.makeRequest({ url, method: "DELETE", options });
if (!response.ok) {
    await this.handleErrorResponse(response, undefined, url, "DELETE"); // 항상 throw
}
return response.json() as Promise<T>;
```

`handleErrorResponse`(`packages/api/src/handle-error-response.ts`)는 서버가 내려준 `{ isSuccess: false, error: { message, detail } }` 바디를 파싱해 메시지만 추출한 뒤 **평범한 `Error`를 throw**하고 끝난다. 구조화된 `error.detail`/`error.message`는 여기서 모두 버려진다.

결과적으로 `response.json()`까지 도달했다는 것 자체가 `response.ok === true`였다는 뜻이므로, 서비스 레이어가 받는 `Response<T>`는 **런타임에 항상 `isSuccess: true`**다. 즉 다음 코드들의 실패 분기는 전부 도달 불가능한 죽은 코드다.

```typescript
// packages/service/src/club/club.schedule.service.ts
function getResponseResult<T>(response: Response<T>): T {
    if (!response.isSuccess) { // never true — 여기 오기 전에 이미 instance가 throw함
        throw new Error(response.error.detail || response.error.message);
    }
    return response.result;
}

// apps/DONGLE-ADMIN/src/feature/club/action/delete-club.action.ts
const result = await deleteClubService(clubId);
if (!result.isSuccess) { // never true — 실패 시 deleteClubService 호출에서 이미 throw됨
    return { success: false, error: result.error?.detail || ... };
}
```

유일하게 `club.report.service.ts`의 `getClubReportService`만 try/catch로 throw된 `Error`를 받아 메시지 문자열을 정규식/포함(includes) 매칭해서 `ErrorResponse`를 수동으로 재구성하는 우회를 쓰고 있는데, 이는 한국어 에러 문구에 의존하는 취약한 방식이다(`isClubReportNotFoundError`, `isClubReportNotFoundResponse` 참고).

**해결 (2026-06-17)**

- `packages/api/src/instance.ts`에서 `!response.ok`여도 **throw하지 않고** 서버가 내려준 JSON 바디를 그대로 반환하도록 변경.
- JSON 파싱이 불가능한 응답(HTML body 등)만 throw 대신 **합성 실패 응답** `{ isSuccess:false, error:{message, detail} }`으로 정규화.
- 이에 따라 `packages/service/src/club/club.report.service.ts`의 “throw 문자열 매칭 우회(not-found 정규화)”는 제거하고, 구조화된 실패 응답을 그대로 사용하도록 정리.

**수정 방향 (잔여 작업)**

서버가 이미 구조화된 `{isSuccess, error:{message, detail}}`를 일관되게 내려주므로, 프론트는 이를 그대로 활용하도록 다음 중 하나로 통일해야 한다.

1. **(권장)** `FetchInstance`가 `!response.ok`일 때도 throw하지 않고 `response.json()`(즉 서버의 `ErrorResponse` 바디)을 그대로 반환하도록 변경. 이렇게 하면 `Response<T>` 유니온 타입과 `isSuccess` 분기가 실제로 의미를 갖게 되고, `club.report.service.ts`의 문자열 매칭 우회도 제거 가능.
2. 위 변경이 부담스럽다면, `handleErrorResponse`가 평범한 `Error` 대신 `error.message`/`error.detail`을 보존하는 커스텀 에러 클래스(예: `ApiError`)를 throw하도록 바꾸고, 모든 service/action이 `try/catch`로 `ApiError`를 받는 패턴으로 통일. 이 경우 `getResponseResult`나 `if (!result.isSuccess)` 같은 도달 불가능한 분기는 전부 제거해야 한다(혼란 방지).

어느 쪽을 택하든 "throw 후 isSuccess 체크"가 같은 호출 경로에 동시에 존재하는 현재 상태(`club.schedule.service.ts`, `delete-club.action.ts` 등)는 제거 대상이다.

---

## 4. 캐시/상태 회귀

### CACHE-1. 클럽/배너 삭제 후 list 캐시 태그 누락

| | |
|---|---|
| **심각도** | High |
| **상태** | **closed (오탐 — cache-tags.ts의 detail() 그룹이 이미 list 태그를 포함)** |
| **파일** | `apps/DONGLE-ADMIN/src/feature/club/action/delete-club.action.ts` L30, `apps/DONGLE-ADMIN/src/feature/main-banner/action/delete-main-banner.action.ts` L28 |

**문제**

```typescript
// delete-club.action.ts
revalidateTags(clubTagGroups.detail(clubId));
// ❌ clubTagGroups.list() 누락 → 삭제된 클럽이 목록에 계속 노출

// delete-main-banner.action.ts
revalidateTags(mainBannerTagGroups.detail(id));
// ❌ mainBannerTagGroups.list() 누락 → 삭제된 배너가 목록에 계속 노출
```

삭제 후 목록 페이지를 방문하면 삭제된 항목이 Next.js 캐시에서 그대로 서빙된다.

**수정**

```typescript
// delete-club.action.ts
revalidateTags(clubTagGroups.detail(clubId));
revalidateTags(clubTagGroups.list()); // 추가

// delete-main-banner.action.ts
revalidateTags(mainBannerTagGroups.detail(id));
revalidateTags(mainBannerTagGroups.list()); // 추가
```

---

### CACHE-2. `admin-schedule-dashboard` — 월간 이동 시 로컬 상태 전체 교체

| | |
|---|---|
| **심각도** | Medium |
| **상태** | **closed (2026-06-17 수정)** |
| **파일** | `apps/DONGLE-ADMIN/src/feature/schedule/components/admin-schedule-dashboard.tsx` L166-184 |

**문제**

```typescript
const loadMonthSchedules = async (monthDate: Date) => {
    const result = await getAdminClubScheduleCalendarAction(...);
    setSchedules(result.data.map(mapAdminClubScheduleToClubSchedule)); // 상태 전체 교체
};
```

같은 컴포넌트에서 `toggleScheduleVisibility`와 `deleteSchedule`이 로컬 상태를 직접 업데이트한다. 월 이동 시 `loadMonthSchedules()`가 상태를 전체 교체하기 때문에 이전 월에서 변경한 사항이 사라지거나, 직전 mutation이 반영되기 전에 이전 데이터가 덮어쓰인다.

**수정 방향**

`toggleScheduleVisibility`와 `deleteSchedule` 이후 `router.refresh()`를 호출해 서버 캐시와 동기화하거나, mutation 후 즉시 `loadMonthSchedules()`를 재호출해 상태를 서버 기준으로 통일한다.

---

### CACHE-3. 일정 삭제 후 전체 list 태그 범위 누락

| | |
|---|---|
| **심각도** | Medium |
| **상태** | **closed (오탐 — revalidateScheduleTags의 모든 분기가 이미 list 태그를 포함)** |
| **파일** | `apps/DONGLE-ADMIN/src/feature/schedule/action/schedule.action.ts` L240, L307 |

**문제**

```typescript
// deleteClubScheduleAction
revalidateScheduleTags(clubId, scheduleId);
// clubScheduleTagGroups.list() 전체 리스트 태그 미포함
```

CLIENT의 `/schedules` 페이지는 전체 일정 리스트 태그를 구독하고 있는데, 일정 삭제 시 이 태그가 무효화되지 않아 삭제된 일정이 공개 페이지에 최대 60초간 노출된다.

**수정**

```typescript
revalidateScheduleTags(clubId, scheduleId);
revalidateTags(clubScheduleTagGroups.list()); // 추가
```

---

## 5. 구현 순서 (권장)

### 즉시 수정 — 기능 오류 / 데이터 크래시 / 계약 핵심 불일치

1. **API-3** `instance` throw-on-error 정책 결정(권장안 1 또는 2) → 적용 후 도달 불가능한 `isSuccess` 분기 전부 제거
   - 영향 범위가 가장 크므로(모든 service/action) 다른 API/캐시 항목보다 먼저 결정해야 후속 수정이 헛수고가 되지 않음
2. **RT-1** `parseJsonStringArray` try-catch
3. **RT-2** `club.sns?.instagram` optional chaining
4. **RT-3** `report.image_urls` null guard
5. **RT-4** `response.error?.detail`
6. **CACHE-1** 클럽/배너 삭제 list 태그 추가

(API-1은 오탐으로 닫혀 작업 대상에서 제외)

### 단기 수정 — 계약 불일치 / 상태 회귀

8. **API-2** 삭제 Action 반환 타입 `ActionResult` 통일 (API-3 적용 이후 진행 — 에러 처리 방식이 바뀌므로 동시 작업 시 충돌)
9. **CACHE-3** 일정 삭제 list 태그 추가
10. **RT-5** logout startTransition 에러 처리
11. **CACHE-2** 월간 이동 로컬 상태 동기화

---

## 6. 검증

```bash
pnpm verify:fast
```

각 수정 후 관련 Vitest 테스트(schedule.schema.test, make-request.test 등) 통과 여부 확인.
