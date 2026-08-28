# T1 도메인 데이터 정합성 완료 보고

`pnpm verify:fast` 통과 (docs + vitest-alias + type, Vitest 99 files / 442 tests).

## 항목 상태

| # | 상태 | 메모 |
| --- | --- | --- |
| 1 | 완료 | `isInPublishPeriod`를 `getDateTimeTimestamp(Asia/Seoul)`로, `/\` 오픈리다이렉트는 URL 파서 + origin 검사 |
| 2 | 완료 | 일정·배너 폼 default values에 `{ timeZone: "Asia/Seoul" }` |
| 3 | 완료 | 격자/포함 로직을 `@dongle/utils`의 `getCalendarGridDates`/`isDateKeyWithinRange`로 공유, 칸 라벨은 Seoul date key |
| 4 | 완료 | `startDate >= endDate` |
| 5 | 완료 | 제목/내용 trim 후 공백-only 거부 |
| 6 | 완료 | 생성 비밀번호도 trim (수정과 통일) |
| 7 | 완료 | `getResponseResult` 제거, `Response<T>` 반환. throw 정규화는 schedule page 2곳 + action. CLIENT 일정 조회도 `isSuccess` 분기 |
| 8 | 완료 | `handleErrorResponse` export 제거, 파일은 `parse-json` 내부 전용 |
| 9 | 완료 | 2xx+빈바디 → `{ isSuccess:true, result:null }` |
| 10 | 완료 | 서비스 try/catch 제거, 편집 페이지에서 정규화 |
| 11 | 완료 | mock fetch로 401→refresh→1회 재시도, skipAuthRefresh, refresh 실패, token 없는 갱신 |
| 12 | 완료 | `summarizeRequestPayload`로 password/login_id 등 제거 |
| 13 | 완료 | `loginFormAction` Vitest (성공/실패/decode실패) |
| 14 | 완료 | 보고서 상세 404 vs 5xx 페이지 테스트 |
| 15 | 완료 | identity mock 제거, `now` 주입으로 Seoul 경계 assertion |
| 16 | 완료 | known-gaps를 실제 공백으로 교체, 인벤토리·infra-assumptions 갱신 |
| 17 | 부분 | env는 `vi.stubEnv`, turbo `.next/cache` 제외. `@dongle/content` Vitest project는 테스트 파일 없어 스킵. `search.spec.ts` @smoke 제거는 E2E/워크플로 범위라 스킵 |

## 남은 리스크

- Admin/회장 일정 RSC는 구조화 실패 시 여전히 throw → `error.tsx` (실패 vs 빈 목록 UI는 ClubScheduleManager가 T1 허용 범위 밖)
- `@dongle/service`가 `@dongle/utils`를 import한다. package.json 의존성은 추가하지 않았고 service Vitest alias로만 해석한다
- 동아리 등록 롤백, 회장 수정 action 캐시 테스트, PR/배포 게이트는 T2/T4 공백으로 남김
