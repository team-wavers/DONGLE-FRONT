# DONGLE-FRONT 코드리뷰 (2026-06-18)

작성일: 2026-06-18
리뷰 범위: `git diff origin/fix/code-review...HEAD` (7개 커밋, 26개 파일)
리뷰 방식: 8개 파인더 앵글(정확성 3 · 정리 3 · altitude 1 · CLAUDE.md 컨벤션 1) → 후보 수집 → 코드/타입 직접 대조 검증
참고: 이 리뷰는 [docs/code-review.md](./code-review.md)(2026-06-17 작성) 이후 추가된 변경분(로그아웃 리팩터, 삭제 액션 `ActionResult` 통일, 일정 캐시 수정, `@dongle/api` 아키텍처 정리 등)을 대상으로 한다.

---

## 1. 마스터 체크리스트

| ID | 항목 | 카테고리 | 심각도 | 상태 |
|---|---|---|---|---|
| RV-1 | 이미지 업로드 try/catch/finally 제거로 진짜 throw 시 UI가 로딩 상태에 멈춤 | 런타임 | Critical | **closed (2026-06-18 수정)** |
| RV-2 | 일정 토글/삭제 후 재조회가 클로저에 캡처된 stale `visibleMonth`를 사용 | 캐시/상태 | High | **closed (2026-06-18 수정)** |
| RV-3 | 삭제 버튼 3종에서 액션 호출 자체의 throw를 잡던 catch 제거 | 런타임 | Medium | **closed (2026-06-18 수정)** |
| RV-4 | `getActionErrorMessage` 로직이 액션 파일마다 중복 | 정리(Reuse) | Low | **closed (2026-06-18, delete-club만 공유 헬퍼로 교체 — delete-user는 동작 범위가 더 넓어 별도 유지)** |
| RV-5 | `delete-report-form.action.ts`만 `redirectTo`를 안 채워 액션 간 컨벤션 불일치 | 정리(Altitude) | Low | **closed (2026-06-18 수정)** |

---

## 2. 상세 항목

### RV-1. 이미지 업로드 — try/catch/finally 제거로 진짜 throw 시 UI 로딩 상태 고착

| | |
|---|---|
| **심각도** | Critical |
| **상태** | **closed (2026-06-18 수정)** |
| **파일** | `apps/DONGLE-ADMIN/src/shared/ui/form/rich-text-editor/rich-text-editor.tsx` L158-186 |

**문제**

기존 코드는 업로드 전체를 `try/catch/finally`로 감싸 `setIsUploadingImage(false)`와 `event.target.value = ""`를 **항상** 실행했다. 이번 diff에서 `fetch` 직접 호출을 `browserInstance.post()`로 교체하면서 이 try/catch/finally를 제거했다.

`packages/api/src/browser-instance.ts`의 `request()`는 `fetch()` 호출을 try/catch 없이 그대로 둔다 (`layers.md`가 명시한 "남는 throw" 그대로 전파). 즉 `browserInstance.post()`는 HTTP 4xx/5xx는 throw하지 않지만, **네트워크/런타임 진짜 throw는 그대로 던진다.**

```ts
const data = await browserInstance.post<Response<string>>(`/api/clubs/${clubId}/report-images`, formData);

if (!data.isSuccess) {
    console.error("리치텍스트 이미지 업로드 실패:", data.error.detail);
    toast.error(data.error.detail || "이미지 업로드에 실패했습니다.");
} else {
    editor.chain().focus().setImage({ src: data.result }).run();
    toast.success("이미지를 본문에 추가했습니다.");
}

setIsUploadingImage(false);
event.target.value = "";
```

`browserInstance.post()`가 throw하면 `setIsUploadingImage(false)`와 `event.target.value = ""`는 실행되지 않는다.

**실패 시나리오**

오프라인 상태이거나 요청이 타임아웃되는 등 `fetch` 자체가 reject되면 `handleImageChange`가 예외를 던지며 중단된다. `isUploadingImage`가 `true`로 영구히 남아 업로드 버튼이 계속 로딩 상태로 멈추고, 같은 파일을 다시 선택해도 input의 `value`가 초기화되지 않아 `onChange`가 다시 트리거되지 않는다 (사용자는 새로고침 전까지 이미지 업로드를 재시도할 수 없음).

참고로 `packages/api/src/browser-instance.test.ts`에는 이 "진짜 throw" 시나리오에 대한 테스트가 없다.

**권장 조치**

`browserInstance.post()` 호출을 `try/finally`로 감싸 `setIsUploadingImage(false)` / `event.target.value = ""`를 finally에서 보장하거나, `browserInstance` 자체에 진짜 throw를 구조화된 실패로 정규화하는 옵션을 추가한다.

---

### RV-2. 일정 토글/삭제 후 재조회 — 클로저에 캡처된 stale `visibleMonth` 사용

| | |
|---|---|
| **심각도** | High |
| **상태** | **closed (2026-06-18 수정)** |
| **파일** | `apps/DONGLE-ADMIN/src/feature/schedule/components/admin-schedule-dashboard.tsx` L210-237 |

**문제**

```ts
const toggleScheduleVisibility = async (schedule: ClubSchedule) => {
    setPendingScheduleId(schedule.id);
    const result = await updateAdminClubScheduleStatusAction(schedule.id, !schedule.isPublic);
    setPendingScheduleId(null);

    if (!result.ok) { ... return; }

    // 로컬 상태를 직접 갱신하지 않고 현재 보이는 월을 서버 기준으로 재조회한다.
    // (월 이동 중 loadMonthSchedules의 전체 교체와 경쟁해 변경 사항이 덮어써지는 것을 방지)
    await loadMonthSchedules(visibleMonth);
};
```

`visibleMonth`는 이 함수가 생성된 렌더 시점의 클로저 값이다. `updateAdminClubScheduleStatusAction`(또는 삭제의 `deleteAdminClubScheduleAction`)을 기다리는 동안 사용자가 월을 이동하면(`moveMonth` → `setVisibleMonth` + `loadMonthSchedules(nextMonth)`), 토글/삭제 쪽 코드는 await가 끝난 뒤에도 **클로저에 캡처된 옛 `visibleMonth`** 값으로 `loadMonthSchedules`를 호출한다.

**실패 시나리오**

1. 6월 화면에서 일정 공개 상태를 토글 → `updateAdminClubScheduleStatusAction` 응답 대기 시작 (클로저는 `visibleMonth = 6월`)
2. 응답 대기 중 사용자가 "다음 달" 클릭 → `setVisibleMonth(7월)`, `loadMonthSchedules(7월)` 시작
3. 7월 조회가 먼저 끝나 `schedules`를 7월 데이터로 채움
4. 토글의 await가 끝나며 `loadMonthSchedules(6월)`(stale 클로저 값)을 재호출 → 화면은 7월을 보고 있는데 6월 데이터로 다시 덮어써짐

이 코드가 막으려던 "월 이동 중 전체 교체 경쟁"이 토글/삭제 vs 월이동 조합으로 재발한다.

**권장 조치**

요청 시점의 month-key를 캡처해 재조회 후 **현재** `visibleMonth`와 비교해서 다르면 덮어쓰지 않거나, `loadMonthSchedules`를 인자 없이 "항상 최신 visibleMonth 기준"으로 호출하도록(예: `ref`나 함수형 업데이트) 바꾼다.

---

### RV-3. 삭제 버튼 3종 — 액션 호출 자체의 throw를 잡던 catch 제거

| | |
|---|---|
| **심각도** | Medium |
| **상태** | **closed (2026-06-18 수정)** |
| **파일** | `apps/DONGLE-ADMIN/src/feature/club/components/club-delete-button.tsx` L26-40, `apps/DONGLE-ADMIN/src/feature/report/components/delete-report-button.tsx` L38-51, `apps/DONGLE-ADMIN/src/feature/user/components/user-card.tsx` L40-52 |

**문제**

ActionResult 통일 작업에서 세 컴포넌트 모두 다음과 같이 바뀌었다 (club-delete-button.tsx 예시):

```diff
- try {
-     const result = await deleteClubAction(clubId);
-     if (!result.success) { ... return; }
-     ...
- } catch {
-     toast.error("동아리 삭제 중 오류가 발생했습니다.");
- }
+ const result = await deleteClubAction(clubId);
+ if (!result.ok) { ... return; }
+ ...
```

세 액션(`deleteClubAction`/`deleteReportAction`/`deleteUserAction`) 내부는 자체 try/catch로 실패를 `actionFailure`로 정규화하므로 보통은 throw하지 않는다. 하지만 **액션 호출 자체**(Next.js Server Action RPC)가 전송 단계에서 실패하면(네트워크 단절, 배포 스큐 등) 여전히 throw할 수 있고, 지금은 이를 잡는 코드가 없다.

**실패 시나리오**

서버 액션 RPC 도중 네트워크가 끊기거나 배포 스큐로 액션 호출 자체가 throw되면, 이전에는 catch에서 "OO 삭제 중 오류가 발생했습니다" 토스트를 띄웠지만 지금은 아무 토스트도 뜨지 않고 unhandled rejection만 콘솔에 남는다. 삭제 모달은 열린 채로 멈추고 사용자는 무슨 일이 일어났는지 알 수 없다.

**권장 조치**

세 컴포넌트 모두 액션 호출을 다시 `try/catch`로 감싸 전송 레벨 실패에 대한 폴백 토스트를 유지한다.

---

### RV-4. `getActionErrorMessage` 로직 중복

| | |
|---|---|
| **심각도** | Low |
| **상태** | **closed (2026-06-18 수정)** |
| **파일** | `apps/DONGLE-ADMIN/src/feature/club/action/delete-club.action.ts` L9-11, `apps/DONGLE-ADMIN/src/feature/user/action/delete-user.action.ts` L45-53 |

**문제**

`error instanceof Error && error.message ? error.message : fallback` 패턴이 `delete-club.action.ts`에는 named 함수로, `delete-user.action.ts`에는 인라인으로 중복돼 있다. 이번 diff에서 새로 만든 중복은 아니지만, `ActionResult` 통일 작업을 하면서 `apps/DONGLE-ADMIN/src/shared/action/`으로 추출할 좋은 기회였다.

**실패 시나리오**

에러 메시지 추출 정책(예: `Error` 서브클래스 처리, 코드 매핑)이 바뀌면 두 곳을 따로 고쳐야 하고, 한쪽만 고치면 club과 user 삭제의 에러 메시지 동작이 갈라진다.

**권장 조치**

`apps/DONGLE-ADMIN/src/shared/action/get-action-error-message.ts`로 추출해 `index.ts`에서 export하고 두 액션이 공유하게 한다.

**적용 결과**

`get-action-error-message.test.ts`를 먼저 작성하고 헬퍼를 추출했다. `delete-club.action.ts`는 동작이 기존 로컬 함수와 100% 동일해 헬퍼로 교체했다. `delete-user.action.ts`의 인라인 로직은 `Error`가 아닌 일반 객체의 `message` 속성까지 처리하는 **더 넓은** 범위라, 그대로 교체하면 동작이 좁아지는 회귀가 생긴다고 판단해 의도적으로 그대로 두었다.

---

### RV-5. `delete-report-form.action.ts`만 `redirectTo` 미포함

| | |
|---|---|
| **심각도** | Low |
| **상태** | **closed (2026-06-18 수정)** |
| **파일** | `apps/DONGLE-ADMIN/src/feature/report/action/delete-report-form.action.ts` L22, `apps/DONGLE-ADMIN/src/feature/club/action/delete-club.action.ts` L28-32 |

**문제**

`delete-club.action.ts`는 `actionSuccess({ ..., redirectTo: "/admin/club" })`로 리다이렉트를 액션이 결정하는데, `delete-report-form.action.ts`는 `redirectTo`를 채우지 않고 `delete-report-button.tsx`가 별도 prop(`redirectHref`)으로 직접 라우팅을 결정한다. `ActionResult`의 `redirectTo`는 optional이라 타입 에러는 없지만, 같은 규약을 쓰면서 두 가지 패턴이 공존한다.

**실패 시나리오**

새로 삭제 액션을 추가하는 개발자가 어느 쪽이 표준인지(액션이 `redirectTo`를 정하는지, 컴포넌트가 prop으로 정하는지) 헷갈리기 쉽고, 리뷰어가 리뷰에서 의도된 차이를 누락으로 오인하기 쉽다.

**권장 조치**

둘 중 한 패턴으로 통일한다 (액션이 `redirectTo`를 항상 채우는 쪽을 권장 — 컴포넌트가 라우팅 대상을 몰라도 되게 함).
