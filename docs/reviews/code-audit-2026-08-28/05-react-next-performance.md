# React·Next.js 성능 리뷰

작성일: 2026-08-28
대상: `DONGLE-CLIENT`, `DONGLE-ADMIN`, 공유 패키지(`@dongle/ui`, `@dongle/rich-text`, `@dongle/service`, `@dongle/api`)
리뷰 축: Vercel React Best Practices 우선순위 (waterfall → bundle → RSC/server → client fetch → re-render/hydration)
방식: 읽기 전용 정적 분석. 프로덕션 번들·RUM 측정 없음.
코드/문서 수정: 이 보고서 파일만 추가. 소스와 다른 문서는 변경하지 않음.

---

## 범위

점검한 항목:

- async waterfall / 병렬 fetch / Suspense
- bundle / barrel / dynamic import
- third-party 지연 로드
- RSC 직렬화 / server-client 경계
- 중복 fetch / `React.cache`
- 불필요한 client component
- re-render / effect / state
- 긴 목록과 hydration

우선순위 규칙:

- CRITICAL/HIGH 영향 후보를 앞에 둔다.
- 측정 없는 미세 최적화(`useMemo`, 루프, lucide 직접 import 등)는 과장하지 않고 P3로 내린다.

이미 잘 되어 있는 점:

- 홈 `Promise.allSettled`, 보고서 상세 `Promise.all`, 대부분 `React.cache()`
- 동아리 상세 일정/보고서 탭 `Suspense` 분리 (`docs/evals/success-criteria.md` Client Club Schedule / Club Loading UX 계약과 일치)
- `optimizePackageImports: lucide-react, date-fns, @radix-ui/*` (CLIENT/ADMIN `next.config.ts`)
- 홈 클럽 payload를 표시 필드로 축소 (`home-page-data.ts`)
- MSW 브라우저 worker는 dynamic import
- 동아리/보고서 `loading.tsx` 존재

---

## P0 — 공개 클라이언트 초기 JS (bundle / third-party)

### 1. Sentry Replay + PostHog가 모든 CLIENT 페이지 시작 경로에 동기 로드

| | |
|---|---|
| **우선순위** | P0 |
| **규칙** | `bundle-defer-third-party` (CRITICAL/HIGH) |
| **파일** | `apps/DONGLE-CLIENT/instrumentation-client.ts:11-32` |
| **발생 경로** | CLIENT 모든 라우트 (`/`, `/clubs/:id`, `/schedules`, `/clubs/:id/reports/:id`) |

**영향 / 시나리오**

`Sentry.init`에서 `Sentry.replayIntegration()`을 동기 등록한다. `replaysSessionSampleRate: 0.1`은 전송량만 줄일 뿐, 다운로드되는 Replay SDK JS는 그대로다. 같은 파일에서 `posthog.init()`도 모듈 로드 시점에 실행된다. 분석/리플레이는 첫 상호작용을 막지 않아도 되므로, 공개 CLIENT의 TTI/INP에 가장 큰 영향을 줄 후보다.

**최소 수정안**

- Replay integration을 지연 로드하거나 에러 시에만 붙인다.
- PostHog는 `requestIdleCallback` 또는 `load` 이후 init.
- Replay가 제품상 불필요하면 integration 자체를 제거하는 편이 더 크다.

**테스트·검증 제안**

- `@next/bundle-analyzer`로 CLIENT client 엔트리에서 `@sentry/replay`, `posthog-js` 크기 확인.
- Lighthouse TBT/INP, DevTools Coverage.
- `NEXT_PUBLIC_SENTRY_DSN` / `NEXT_PUBLIC_POSTHOG_TOKEN`이 있는 프로덕션 빌드 기준.

---

## P1 — CRITICAL/HIGH, 공개 경로 체감

### 2. 리치텍스트가 SSR되지 않아 소개/본문이 JS 이후에야 나타남

| | |
|---|---|
| **우선순위** | P1 |
| **규칙** | `bundle-dynamic-imports`, `async-suspense-boundaries`, LCP/content |
| **파일** | `apps/DONGLE-CLIENT/src/components/rich-text/client-rich-text-viewer.tsx:11-39` |
| **연쇄** | `packages/rich-text/src/rich-text-viewer.tsx:6-7, 20-22, 52-74` |
| **발생 경로** | `/clubs/:id` 기본 탭(소개), `/clubs/:id/reports/:id` 본문 |

**영향 / 시나리오**

`dynamic(..., { ssr: false })`와 `isReady` effect로 하이드레이션 전후 본문이 비어 있다. viewer가 뜬 뒤에도 TipTap `generateJSON`/`generateHTML`과 `isomorphic-dompurify`를 또 effect에서 돌린다. `isomorphic-dompurify`는 클라이언트 청크에 jsdom이 섞일 위험이 큰 패키지다. 소개 탭에서 sanitizing 중 스켈레톤을 쓰지 않는 것은 제품 계약이지만, 서버에서 sanitize된 HTML을 내려주면 빈 구간 자체를 없앨 수 있다.

**최소 수정안**

1. `isReady` 게이트 제거. `next/dynamic` fallback만 사용.
2. 가능하면 서버에서 sanitize한 HTML을 넘기고 viewer는 `dangerouslySetInnerHTML`만 담당.
3. 브라우저에서는 `dompurify`, 서버에서는 가벼운 sanitizer로 분리해 `isomorphic-dompurify`를 클라이언트에서 제거.

**테스트·검증 제안**

- `/clubs/:id` 첫 HTML에 intro 본문이 있는지 확인.
- LCP/요소 타이밍.
- analyzer에서 `@tiptap/*`, `isomorphic-dompurify`, `jsdom`이 client chunk에 있는지 확인.
- 기존 rich-text sanitizer/viewer 테스트 (`packages/rich-text/src/sanitize-rich-text-html.test.ts`, `packages/rich-text/src/rich-text-viewer.test.ts`)와 소개 탭 스켈레톤 계약 (`club-intro-tab-content.test.tsx`)을 회귀 확인.

### 3. 홈 히어로 배너가 LCP인데 `priority`가 없음

| | |
|---|---|
| **우선순위** | P1 |
| **규칙** | LCP / `next/image` |
| **파일** | `apps/DONGLE-CLIENT/src/components/main/club-main-hero-banner-carousel.tsx:74-81` |
| **대비** | `apps/DONGLE-CLIENT/src/app/layout.tsx:67` 헤더 로고만 `priority` |
| **발생 경로** | `/` (배너가 있을 때) |

**영향 / 시나리오**

첫 슬라이드는 `loading="eager"`만 있고 `priority`가 없다. 헤더 로고만 preload되면 브라우저가 작은 로고를 LCP로 잡을 수 있다. 실제 LCP 후보는 1440×480 배너 이미지다.

**최소 수정안**

`index === 0`에 `priority`(또는 `fetchPriority="high"`)를 준다. `eager`와 중복되면 `priority`만 남겨도 된다.

**테스트·검증 제안**

- 배너가 있는 홈에서 Lighthouse LCP 요소가 배너인지 확인.
- document에 해당 이미지 `link rel=preload`가 생기는지 확인.

### 4. 홈이 클럽+배너를 묶어서 기다림

| | |
|---|---|
| **우선순위** | P1 |
| **규칙** | `async-suspense-boundaries`, `server-parallel-fetching` |
| **파일** | `apps/DONGLE-CLIENT/src/app/page.tsx:6-9, 26-31` |
| **데이터** | `apps/DONGLE-CLIENT/src/app/home-page-data.ts:8-11` (`Promise.allSettled` — fetch 자체는 병렬) |
| **발생 경로** | `/` |

**영향 / 시나리오**

네트워크는 병렬이지만, 둘 다 끝나야 `ClubMainClient`가 렌더된다. 배너가 느리면 목록도, 목록이 느리면 배너도 같이 막힌다. 홈 루트에 `loading.tsx`는 없고 페이지 내부 단일 `Suspense`만 있다.

**최소 수정안**

배너/마감임박과 검색+목록을 각각 `Suspense`로 쪼갠다. fetch는 페이지에서 promise로 시작해 자식에서 `use()`/`await`한다. 중복 요청은 기존 `React.cache`로 막는다.

**테스트·검증 제안**

- 배너 또는 클럽 API를 각각 지연시켜 문서 스트리밍/페인트가 독립인지 확인.
- TTFB vs LCP 비교.
- 홈 데이터 정규화 테스트 (`apps/DONGLE-CLIENT/src/app/page.test.ts`)는 유지.

### 5. `trackDongleEvent`가 `posthog-js`를 정적 import

| | |
|---|---|
| **우선순위** | P1 |
| **규칙** | `bundle-defer-third-party` |
| **파일** | `apps/DONGLE-CLIENT/src/lib/analytics.ts:1, 109-117` |
| **호출** | `club-list-section.tsx:6,58`, `club-detail-tabs.tsx:7,40`, `club-apply-button.tsx:4`, 배너/일정 CTA 등 |
| **발생 경로** | `/`, `/clubs/:id`, `/schedules` 등 클릭 트래킹이 있는 공개 UI |

**영향 / 시나리오**

instrumentation과 모듈 인스턴스는 중복되지 않지만, 클릭 트래킹 컴포넌트가 모두 `posthog-js`에 동기 의존한다. 탭/리스트를 client component로 만드는 원인이기도 하다.

**최소 수정안**

`trackDongleEvent` 안에서 `import("posthog-js")` 하거나 이미 init된 글로벌만 사용한다. 탭/지원 버튼은 서버 마크업 + 작은 tracker wrapper로 분리한다.

**테스트·검증 제안**

- club-detail / home client chunk에서 `posthog-js` 포함 여부.
- 트래킹만 뺀 실험 빌드와 TBT 비교.
- 기존 analytics 계약 테스트 (`apps/DONGLE-CLIENT/src/lib/analytics.test.ts`) 유지.

### 6. Admin 리치텍스트 에디터가 폼 페이지에 정적 포함

| | |
|---|---|
| **우선순위** | P1 |
| **규칙** | `bundle-dynamic-imports` (해당 페이지 TTI에 CRITICAL) |
| **파일** | `apps/DONGLE-ADMIN/src/shared/form/rhf-rich-text-editor.tsx:4` |
| **사용** | `apps/DONGLE-ADMIN/src/feature/club/components/club-form/club-form.tsx:19`, `apps/DONGLE-ADMIN/src/feature/report/components/activity-report-form/activity-report-form.tsx:12`, 등록 폼 |
| **발생 경로** | `/{clubId}/club-form`, 보고서 작성/수정 |

**영향 / 시나리오**

`@tiptap/react` + starter-kit + 이미지/링크가 해당 페이지 초기 번들에 들어간다. 공개 앱보다 트래픽은 적지만 회장 폼 TTI에는 직접 영향이다.

**최소 수정안**

`next/dynamic`으로 `RHFRichTextEditor`/`RichTextEditor`를 로드한다. 폼 나머지 필드는 먼저 그리고 에디터만 스켈레톤.

**테스트·검증 제안**

- admin club-form client chunk에서 `@tiptap/*` 크기.
- dynamic 전후 TTI.
- 클럽/보고서 폼 스키마·action 테스트는 로직 계약이므로 그대로 유지.

---

## P2 — 구조는 맞지만 범위·확신이 낮음

### 7. 홈이 하나의 큰 client island

| | |
|---|---|
| **우선순위** | P2 |
| **규칙** | server-client 경계, `bundle-dynamic-imports` |
| **파일** | `apps/DONGLE-CLIENT/src/components/main/club-main-client.tsx:1-9, 28-70` |
| **발생 경로** | `/` |

**영향 / 시나리오**

필터 URL 동기화(`useSearchParams`) 때문에 검색+목록은 client가 맞다. 다만 배너 캐러셀(embla)과 마감임박 섹션까지 같은 모듈에 정적 import되어, 배너가 없어도 embla가 홈 JS에 남을 수 있다.

**최소 수정안**

배너 캐러셀을 `dynamic()` 또는 서버 형제 트리로 분리한다. `ClubMainClient`는 검색+목록만 담당한다.

**테스트·검증 제안**

- 배너 0건 빌드에서 `embla-carousel-react`가 home chunk에 있는지 확인.

### 8. `@dongle/ui` barrel에서 `SearchInput`만 import

| | |
|---|---|
| **우선순위** | P2 |
| **규칙** | `bundle-barrel-imports` |
| **파일** | `apps/DONGLE-CLIENT/src/components/main/club-search-section.tsx:6`, `apps/DONGLE-ADMIN/src/feature/club/components/filterable-club-list/filterable-club-list.tsx:8`, `apps/DONGLE-ADMIN/src/feature/user/components/filterable-user-list.tsx:7`, `apps/DONGLE-ADMIN/src/feature/report/components/filterable-report-list/filterable-report-list.tsx:9`, `apps/DONGLE-ADMIN/src/feature/schedule/components/admin-schedule-dashboard.tsx:5` |
| **barrel** | `packages/ui/src/index.ts` |
| **발생 경로** | 홈 검색, admin 동아리/사용자/보고서/일정 목록 |

**영향 / 시나리오**

barrel이 calendar(`react-day-picker`), carousel, sidebar, toaster 등을 re-export한다. 서브패스 `@dongle/ui/search-input`은 이미 있다. 자체 barrel(~30 export)이라 lucide급은 아니고, 트리셰이킹 실패 시에만 크다. 측정 없이 CRITICAL로 보지 않는다.

**최소 수정안**

`import { SearchInput } from "@dongle/ui/search-input"`. `optimizePackageImports`에 `@dongle/ui` 추가를 검토한다.

**테스트·검증 제안**

- barrel vs 서브패스 빌드의 client chunk 비교.

### 9. `getClubReportService`만 `React.cache` 미적용 + `no-store`

| | |
|---|---|
| **우선순위** | P2 |
| **규칙** | `server-cache-react` |
| **파일** | `apps/DONGLE-CLIENT/src/lib/server/cached-services.ts:19` |
| **호출** | `apps/DONGLE-CLIENT/src/app/clubs/[clubId]/reports/[reportId]/page.tsx:40-42` (`generateMetadata`), `80-83` (page) |
| **서비스** | `packages/service/src/club/club.report.service.ts:60-63` (`cache: "no-store"`) |
| **발생 경로** | `/clubs/:id/reports/:id` |

**영향 / 시나리오**

Next `fetch` 요청 메모이제이션이 GET을 한 번으로 줄일 수는 있다. 다만 `makeRequest`의 MSW/쿠키 준비는 fetch 앞에서 매 호출마다 돌 수 있고, 다른 서비스와 계약이 어긋난다.

**최소 수정안**

`cache(getClubReportService)`로 감싼다. 목록은 이미 cache되어 있다.

**테스트·검증 제안**

- 보고서 상세에서 동일 URL GET이 1회인지 서버 로그/프록시로 확인.
- `packages/service/src/club/club.report.service.test.ts`의 no-store 계약은 유지.

### 10. Admin 일정 페이지가 데이터를 기다린 뒤에야 헤더를 그림

| | |
|---|---|
| **우선순위** | P2 |
| **규칙** | `async-suspense-boundaries` |
| **파일** | `apps/DONGLE-ADMIN/src/app/(대시보드)/(총동연)/admin/(메뉴)/(일정관리)/schedule/page.tsx:7-22` |
| **발생 경로** | `/admin/schedule` |

**영향 / 시나리오**

`await getAdminClubScheduleCalendarService` 이후에 헤더+대시보드를 렌더한다. 안쪽 `Suspense`는 이미 끝난 데이터라 스트리밍에 도움이 안 된다. Admin 전용이라 공개 LCP보다는 낮다.

**최소 수정안**

헤더는 즉시, 대시보드만 async+Suspense. `loading.tsx`가 있으면 보완되지만 헤더 고정에는 컴포지션이 낫다.

**테스트·검증 제안**

- 일정 API 지연 시 헤더가 먼저 나오는지 확인.

### 11. 분석 클릭 때문에 서버로 둘 수 있는 UI가 client

| | |
|---|---|
| **우선순위** | P2 |
| **규칙** | 불필요한 client component, RSC 직렬화 |
| **파일** | `apps/DONGLE-CLIENT/src/components/club-detail/club-detail-tabs.tsx:1-7, 36-45`, `apps/DONGLE-CLIENT/src/components/club-detail/club-reports-tab-content.tsx:1-7, 50-56`, `apps/DONGLE-CLIENT/src/components/club-detail/club-apply-button.tsx:1-20`, `apps/DONGLE-CLIENT/src/components/club-detail/club-detail-social-info-link.tsx:1-6` |
| **발생 경로** | `/clubs/:id` |

**영향 / 시나리오**

탭 패널 children은 서버에서 잘 스트리밍된다. 껍데기만 client인 이유는 `onValueChange`/`onClick` 트래킹이다. 번들 이득은 측정 전에는 중간이다.

**최소 수정안**

서버 Tabs + 작은 client tracker. 리스트 `Link`는 서버, 클릭만 wrapper.

**테스트·검증 제안**

- club-detail client chunk 크기 전후 비교.
- 탭/보고서 클릭 analytics 이벤트 계약은 `analytics.test.ts`로 유지.

### 12. Admin 동아리 폼이 클럽 전체 객체를 client로 넘김

| | |
|---|---|
| **우선순위** | P2 |
| **규칙** | `server-serialization` |
| **파일** | `apps/DONGLE-ADMIN/src/app/(대시보드)/(동아리)/(메뉴)/[clubId]/(동아리 정보 관리)/club-form/page.tsx:21-23`, `apps/DONGLE-ADMIN/src/feature/club/components/club-form/club-form.tsx:23-26, 37-40` |
| **발생 경로** | `/{clubId}/club-form` |

**영향 / 시나리오**

에디터에 `description`/`main_activities` HTML이 필요하므로 완전 제거는 어렵다. 회장 정보 등 폼이 안 쓰는 필드는 잘라 RSC payload를 줄일 수 있다.

**최소 수정안**

폼이 실제로 쓰는 필드만 client로 넘긴다.

**테스트·검증 제안**

- 클럽 수정 페이지 RSC payload 크기 (Next debug / Network).

### 13. Admin 사이드바가 Suspense 없이 쿠키를 await

| | |
|---|---|
| **우선순위** | P2 |
| **규칙** | `server-parallel-fetching`, `async-suspense-boundaries` |
| **파일** | `apps/DONGLE-ADMIN/src/shared/layout/sidebar/admin-sidebar.tsx:10-11`, `apps/DONGLE-ADMIN/src/app/(대시보드)/(총동연)/admin/layout.tsx:5-8` |
| **대비** | 회장 `apps/DONGLE-ADMIN/src/app/(대시보드)/(동아리)/(메뉴)/[clubId]/layout.tsx:58-60`는 사이드바를 Suspense로 감쌈 |
| **발생 경로** | `/admin/*` |

**영향 / 시나리오**

쿠키 읽기는 보통 빠르다. 레이아웃 블록 위험은 회장 레이아웃보다 크다.

**최소 수정안**

`AdminSidebar`를 `Suspense`로 감싸 페이지 데이터와 병렬 스트리밍한다.

**테스트·검증 제안**

- admin 홈에서 사이드바 스켈레톤과 본문 스트리밍이 겹치는지 확인.

---

## P3 — 과장하지 말 것 (측정 후에만)

| 항목 | 파일 | 영향 / 시나리오 | 최소 수정안 | 검증 |
|---|---|---|---|---|
| 긴 목록 `content-visibility` | 홈 클럽 리스트, 일정 월간 | 캠퍼스 동아리 규모면 이득이 작음 | 목록 N이 수백~수천일 때만 CSS `content-visibility: auto` | 목록 규모 측정 후 판단 |
| `useCurrentTime` 60초마다 대시보드 리렌더 | `apps/DONGLE-ADMIN/src/hooks/use-current-time.ts:5-16`, `apps/DONGLE-ADMIN/src/feature/schedule/components/admin-schedule-dashboard.tsx:123` | 1분 간격이라 INP 이슈 가능성 낮음 | 상태 표시만 자식으로 분리 | React Profiler |
| `ensureServerMsw`가 서버 fetch마다 dynamic import | `packages/api/src/make-request.ts:26-38, 52` | 프로덕션은 바로 return. 콜드스타트 한 번 수준 | MSW off 경로에서 import 자체를 건너뜀 | 서버 콜드스타트 프로파일 |
| `HeaderScheduleLink`의 `usePathname` | `apps/DONGLE-CLIENT/src/components/navigation/header-schedule-link.tsx:5-12` | 작은 client. 체감은 작음 | 활성 스타일을 CSS/`aria-current`로 대체 가능 | client chunk 비교 |
| lucide barrel | 다수 파일 | `optimizePackageImports` 이미 적용 | 추가 직접 import는 불필요 | 해당 없음 |
| 홈 클럽 N건 클라이언트 필터 | `club-main-client.tsx` | 필드 축소됨 | 가상화는 N이 수백~수천일 때만 | 목록 규모 측정 후 판단 |

---

## 우선 손볼 순서

1. CLIENT `instrumentation-client`에서 Replay 지연/제거, PostHog idle init
2. 홈 배너 `priority` (한 줄, LCP)
3. 리치텍스트 `isReady` 제거 → 이어서 서버 sanitize
4. 홈 배너/목록 Suspense 분리
5. Admin TipTap dynamic import

---

## 테스트·검증 제안 (공통)

- 공개 경로: `/`, `/clubs/:id`, `/clubs/:id/reports/:id`
- `pnpm --filter DONGLE-CLIENT build` + bundle analyzer
- Lighthouse (mobile), Web Vitals (LCP/INP/TTFB)
- DevTools Network: document vs 지연 JS, 배너 preload
- 리치텍스트: 첫 HTML에 소개/본문 존재 여부
- 구현 착수 시 기본 검증 경로는 `pnpm verify:fast` (`docs/evals/README.md`)
- 이 리뷰 자체는 코드 미수정이라 `pnpm verify:fast`를 실행하지 않았고, TDD 대상도 아니다.

---

## 잔여 리스크

- 위 순위는 프로덕션 번들·RUM 없이 정적 분석 기준이다. P0/P1만 analyzer와 Lighthouse로 확인해야 확정 효과가 나온다.
- `getClubReportService` 중복 호출은 Next fetch 요청 메모이제이션이 이미 막고 있을 수 있어, cache wrapping의 체감은 측정 전엔 불확실하다.
- `@dongle/ui` barrel은 트리셰이킹이 되면 무해하다. 실패할 때만 P2가 P1로 올라간다.
- 리치텍스트를 서버 sanitize로 옮기면 jsdom/서버 CPU와 소개 탭 스켈레톤 금지 계약을 함께 봐야 한다.
- Sentry Replay를 제거/지연하면 장애 재현 관측이 줄어든다. 제품 요구와 번들 비용을 같이 결정해야 한다.
