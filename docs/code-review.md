# DONGLE-FRONT 코드리뷰

작성일: 2026-06-17
브랜치 기준: `fix/log` (리뷰 시점)
대상: `DONGLE-ADMIN`, `DONGLE-CLIENT`, 공유 패키지(`@dongle/api`, `@dongle/service`, `@dongle/types`, `@dongle/ui`, `@dongle/utils`)
리뷰 축: **런타임 에러 · API 계약 위험 · 캐시/상태 회귀**

---

## 1. 마스터 체크리스트

| ID | 항목 | 카테고리 | 심각도 | 상태 |
|---|---|---|---|---|
| RT-1 | `parseJsonStringArray` JSON.parse try-catch 없음 | 런타임 | Critical | pending |
| RT-2 | `club.sns?.instagram` optional chaining 누락 | 런타임 | High | pending |
| RT-3 | `report.image_urls.some()` null guard 없음 | 런타임 | High | pending |
| RT-4 | `response.error?.detail` 미검증 | 런타임 | High | pending |
| RT-5 | logout startTransition 에러 미처리 | 런타임 | Medium | pending |
| API-1 | `schedule.isPublic` — 실제 타입은 `is_public` | API 계약 | Critical | pending |
| API-2 | 삭제 Action `.success` vs `.ok` 혼용 | API 계약 | Critical | pending |
| API-3 | service layer throw vs return 불일치 | API 계약 | High | pending |
| CACHE-1 | 클럽/배너 삭제 후 list 캐시 태그 누락 | 캐시/상태 | High | pending |
| CACHE-2 | 월간 이동 시 로컬 상태 전체 교체 | 캐시/상태 | Medium | pending |
| CACHE-3 | schedule 삭제 후 list 태그 범위 누락 | 캐시/상태 | Medium | pending |

---

## 2. 런타임 에러

### RT-1. `parseJsonStringArray` — JSON.parse try-catch 없음

| | |
|---|---|
| **심각도** | Critical |
| **상태** | pending |
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
| **상태** | pending |
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
| **상태** | pending |
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
| **상태** | pending |
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
| **상태** | pending |
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

### API-1. `schedule.isPublic` — 실제 타입은 `is_public` (snake_case)

| | |
|---|---|
| **심각도** | Critical |
| **상태** | pending |
| **파일** | `apps/DONGLE-ADMIN/src/feature/schedule/form/schedule-form.schema.ts` L175 |

**문제**

```typescript
export function createClubScheduleDefaultValues(schedule?: ClubSchedule | null) {
    return {
        isPublic: schedule.isPublic, // 항상 undefined — 타입 정의는 is_public
    };
}
```

`packages/types/src/club/club.schedule.d.ts`에 `is_public: boolean`으로 정의돼 있으나 코드는 camelCase로 접근한다. 폼 기본값이 항상 `undefined`가 되어 공개/비공개 설정이 초기화된다.

**수정**

```typescript
isPublic: schedule?.is_public,
```

매핑 레이어(`schedule.utils.ts`)에서 이미 변환하는지 확인 후, 변환된 값이 전달되는 경로인지 원본 API 데이터가 전달되는 경로인지 명확히 분리할 것.

---

### API-2. 삭제 Action 반환 타입 혼용 — `.success` vs `.ok`

| | |
|---|---|
| **심각도** | Critical |
| **상태** | pending |

**문제**

| 액션 | 반환 형태 | 호출부 확인 키 |
|---|---|---|
| `deleteClubAction` | `{ success: boolean; error?: string }` | `.success` |
| `deleteUserAction` | `{ success: boolean; error?: string }` | `.success` |
| `deleteReportAction` | `{ success: boolean; error?: string }` | `.success` |
| `deleteMainBannerAction` | `ActionResult<string, null>` | `.ok` |

`main-banner-delete-button.tsx` L29에서 `result.ok`를 쓰는 반면 다른 삭제 버튼은 `result.success`를 사용한다. 타입이 혼용되면 잘못된 키를 참조해 에러 처리가 무력화된다.

**수정**

신규 삭제 액션은 `ActionResult<void, null>`로 통일한다. 기존 액션은 점진 마이그레이션.

```typescript
// 통일 패턴
export async function deleteXxxAction(id: number): Promise<ActionResult<void, null>> {
    ...
    if (!result.isSuccess) return actionFailure(null);
    revalidateTags(...);
    return actionSuccess(undefined);
}
```

---

### API-3. service layer — throw vs `{ isSuccess: false }` 반환 불일치

| | |
|---|---|
| **심각도** | High |
| **상태** | pending |
| **파일** | `packages/service/src/club/club.schedule.service.ts`, `packages/service/src/club/club.report.service.ts`, `packages/service/src/club/club.service.ts` |

**문제**

| 서비스 | 실패 시 동작 |
|---|---|
| `club.schedule.service` | `getResponseResult()` → throw |
| `club.report.service` | catch → synthetic `ErrorResponse` 반환 |
| `club.service`, `user.service` | `{ isSuccess: false }` 반환 (throw 없음) |

호출부가 패턴을 혼용하면 throw를 기대하는 쪽이 `isSuccess: false`를 성공으로 오인하거나, `{ isSuccess: false }`를 기대하는 쪽이 예외를 catch하지 못한다.

**수정 방향**

service layer에서 `getResponseResult()` 래퍼로 unwrap 패턴을 통일한다. 최소한 같은 도메인 내부에서는 동일한 패턴을 사용해야 한다.

---

## 4. 캐시/상태 회귀

### CACHE-1. 클럽/배너 삭제 후 list 캐시 태그 누락

| | |
|---|---|
| **심각도** | High |
| **상태** | pending |
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
| **상태** | pending |
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
| **상태** | pending |
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

### 즉시 수정 — 기능 오류 / 데이터 크래시

1. **RT-1** `parseJsonStringArray` try-catch
2. **API-1** `schedule.isPublic` → `is_public` 접근 경로 확인 후 수정
3. **RT-2** `club.sns?.instagram` optional chaining
4. **RT-3** `report.image_urls` null guard
5. **RT-4** `response.error?.detail`
6. **CACHE-1** 클럽/배너 삭제 list 태그 추가

### 단기 수정 — 계약 불일치 / 상태 회귀

7. **API-2** 삭제 Action 반환 타입 `ActionResult` 통일
8. **CACHE-3** 일정 삭제 list 태그 추가
9. **RT-5** logout startTransition 에러 처리
10. **CACHE-2** 월간 이동 로컬 상태 동기화

### 중기 — 아키텍처 일관성

11. **API-3** service layer unwrap 패턴 통일

---

## 6. 검증

```bash
pnpm verify:fast
```

각 수정 후 관련 Vitest 테스트(schedule.schema.test, make-request.test 등) 통과 여부 확인.
