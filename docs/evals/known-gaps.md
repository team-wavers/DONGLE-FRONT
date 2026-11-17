# Known Gaps

현재 테스트 체계에서 아직 충분히 옮기지 못한 영역을 정리한다.

## 이 문서에 적는 것

- 이미 필요성을 인지했지만 아직 `test`로 옮기지 못한 공백
- 바로 E2E로 만들지 않고 보류 중인 항목
- 테스트 불가 사유가 남아 있는 영역

## 이 문서에 적지 않는 것

- 이미 완료한 작업
- 현재 기본 명령이나 환경 설정 자체의 설명
- 장기 구조 개편 단계

## 우선순위 높은 공백

- ADMIN viewport pinch zoom 차단 금지, CLIENT `loading.tsx` 라우트 파일 존재, 배너 내부=같은 탭/외부=새 탭은 테스트가 없다 (06-test-ci P2-8)
- `main` 대상 PR CI는 일반 빌드 후 MSW를 켠 CLIENT를 별도로 빌드해 스모크를 실행한다. 배포된 ADMIN의 로그인·세션 쿠키·실제 API 연결은 [개발 E2E 로드맵](roadmap.md#개발-배포-후-e2e)에서 다룬다.
- 브라우저나 러너가 강제 종료되면 E2E의 `afterEach`가 실행되지 않을 수 있다. 공유 dev 환경에서 쓰기 테스트를 자동화하려면 실행 중단 이후의 데이터 정리가 필요하다.
- rich text의 실제 DOMPurify 테스트는 Node에서 소스 함수를 검증한다. Next.js 서버 번들·Vercel 배포의 의존성 및 파일 포함 여부는 검증하지 않으므로 배포에서만 본문이 비는 문제는 남는다. 이번 범위는 실제 sanitizer 테스트만이며, 로컬 테스트 통과 후에도 배포 문제가 지속되면 서버 빌드 결과 검증을 재검토한다.

## 이미 닫힌 항목 (인벤토리로 이동)

- admin auth 입력 검증과 로그인 후 redirect 판단 (`login-form-policy.test.ts`, `resolve-post-login-path.test.ts`)
- `loginFormAction`의 서비스 실패/JWT decode 실패/쿠키 설정 (`login-form.action.test.ts`)
- 동아리 공개 등록은 백엔드 트랜잭션으로 키 소모·회장 계정·동아리 생성을 묶는다. 프런트는 등록 실패 응답과 캐시 미갱신을 검증한다 (`club-register.action.test.ts`).
- 회장 수정 서비스 실패 시 캐시 미갱신 (`club-president.action.test.ts`)
- client 메인 empty-state 분기 (`club-search-empty-state.test.ts`, `club-list-section.test.tsx`)
- form/action 문자열 정규화와 payload mapping (club/user/report/schedule 스키마·payload 테스트)
- 배너 timezone-less 게시 기간과 `/\` 오픈리다이렉트 (`get-display-banner-image-urls.test.ts`, `page.test.ts`)
- `makeRequest` 401 → refresh → 1회 재시도 루프 (`make-request.test.ts`)
- 활동보고서 상세 404 vs 5xx 분기 (`reports/[reportId]/page.test.ts`)

## 의도적으로 남긴 E2E

- 실제 로그인 연결 검증
- 실제 제출 후 목록/상세 반영 확인
- 실제 라우팅 연결 확인

## 프론트 BFF로 닫히지 않는 잔여 리스크

- 미들웨어 JWT 서명 검증은 `JWT_SECRET`이 ADMIN 런타임에 백엔드와 같게 설정되어야 한다. 시크릿 부재 시 fail-closed라 유효 세션도 로그인으로 보낸다.
- 업로드 매직바이트는 앞 12바이트만 보며, 백엔드/CDN이 SVG를 다른 확장자로 서빙하면 XSS 여부는 스토리지 Content-Type에 남는다.
- `delete-report-form.action.ts` / `delete-main-banner.action.ts`는 이번 범위 밖이라 role/club 가드가 토큰 존재 검사만 한다.

## 지금 하지 않는 것

- stateful mock 인프라 확대
- `isolated` 모드 추가
- `@dongle/content` / `@dongle/types` Vitest project 등록 (해당 패키지에 테스트 파일이 생기기 전까지 실해가 없다)

## 재검토 조건

- 기본 테스트만으로 회귀를 잡기 어렵다는 사례가 반복될 때
- CI에서 연결 검증 누락이 잦아질 때
- 실제 사용자 플로우 문제를 `test`만으로 재현하기 어려운 영역이 늘어날 때
- `@dongle/content` 또는 `@dongle/types`에 테스트가 추가될 때 Vitest project 등록을 다시 본다

## 기록 규칙

- `test`로 옮길 수 없는 이유가 있으면 이 문서에 남긴다.
- “나중에 보자” 수준의 막연한 메모는 남기지 않는다.
- 왜 `test`로 안 되는지, 무엇이 E2E 후보인지, 재검토 조건이 무엇인지 같이 적는다.
