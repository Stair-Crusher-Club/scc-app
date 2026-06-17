# SCC App (React Native) Development Guide

## Project Context

- React Native + TypeScript. ESLint + styled-components. 이벤트 로깅용 SccXxx 커스텀 컴포넌트 + 전역 로깅 registry 사용.
- New Architecture: `isNewArchEnabled = true` + `bridgelessEnabled = YES` (네이티브 모듈 작성 시 `/scc-app-native` 참조)

## 작업 후 검증 (MANDATORY)

- 코드 변경 후 `yarn lint` + `yarn tsc --noEmit` 둘 다 0 error가 될 때까지 수정. 통과 전엔 작업 미완료.
- `ios/`·`android/` 네이티브 파일을 변경했다면 push 전 **Release 빌드 검증 필수** — 절차는 `/scc-app-native` (Debug/JS 검사는 네이티브 컴파일 에러를 못 잡는다).

## 배포

- OTA 배포(main 푸시 자동) / 웹 배포(로컬 수동): 반드시 `/scc-app-release` 절차를 따른다. `ota-deploy` 수동 실행 금지, 태그 없이 main 푸시 금지.

## Component Guidelines

코드 예제(BottomSheet, 로깅 패턴, SccRemoteImage 등)는 `/scc-app-add-screen` 참조.

- **터치 가능한 컴포넌트는 SccXxx**(SccPressable, SccTouchableOpacity 등) + `elementName` prop 필수 (선택: `logParams`, `disableLogging`)
- **원격 URL 이미지는 `SccRemoteImage`** — `<Image source={{uri}}>` 직접 사용 금지
- **`Logger.logElementView/Click` 직접 호출 금지** → `useLogger()` hook. `useCallback`/`useEffect` 안에서는 `loggerRef.current` 패턴
- **섹션 공통 로깅 파라미터는 `LogParamsProvider`** — 개별 logParams에 `displaySectionName`을 직접 넣지 않는다
- **컴포넌트 구조**: 컴포넌트당 1파일(컴포넌트명 = 파일명), styled-components는 파일 하단에 (별도 스타일 파일 금지), 메인 컴포넌트만 export, prop 타입은 함수에 인라인
- 로직은 hook으로, UI 컴포넌트는 최대한 stateless로
- **동일한 UI 껍데기는 shell 컴포넌트로 추출**: 배지/칩/버튼처럼 모양(높이·padding·radius·폰트·레이아웃)이 같은 요소는 치수를 한 컴포넌트(예: `BadgeShell`)에 두고 색·텍스트·동작·아이콘만 props로 받는다. **스타일 값을 컴포넌트마다 수동 복제 금지** — 드리프트의 원인(저장리스트 태그↔접근레벨 배지 사례)

## Hook 설계 원칙

- **도메인 hook은 도메인만 책임**: `useSavePlaceList` 같은 도메인 mutation hook에 튜토리얼 진행·이벤트 로깅 같은 cross-cutting concern을 넣지 않는다. hook 이름이 도메인 액션이면 그 도메인 외 행위 금지. (PR #159)
- **외부 계산값을 주입받지 않는다**: 호출처는 의도만 전달 (`{missionType: 'SAVE_PLACE_LIST'}`), 계산은 hook 내부에서. (PR #159)

## API Guidelines

- API 타입은 `src/generated-sources/openapi/`의 생성 타입 사용 (수동 수정은 hook이 차단 — codegen만)
- 데이터 fetching은 React Query (`useQuery`/`useMutation`), POST는 custom `usePost` hook
- loading/error/success 상태를 UI에서 모두 처리. API 에러는 무시하지 말고 보통 toast로 피드백
- API 로직은 hook/유틸에 두고 UI 컴포넌트에 넣지 않는다. async/await 선호
- **refetch 깜빡임 금지**: queryKey 변경/refetch 동안 화면을 빈 상태로 리셋하지 말 것. `placeholderData: keepPreviousData`(react-query v5)로 이전 결과를 유지하다 새 응답으로 override한다 — 칩/리스트/지도 오버레이처럼 위치 변화로 자주 refetch되는 UI에서 특히. (반복 지적)

## Screen Structure

새 화면 추가 절차(디렉토리, Navigation 등록, 템플릿)는 `/scc-app-add-screen` 참조.

- 화면은 `src/screens/<ScreenName>/`에, 루트는 `ScreenLayout` (navigation 설정과 일치하는 `isHeaderVisible`, 텍스트 입력 화면은 `isKeyboardAvoidingView`)
- 모달/확인/오버레이는 `BottomSheet` 컴포넌트
- **전환 중 flash/flicker는 배경색이 아니라 타이밍을 고친다**: 연속 dispatch를 `popTo`/`reset` 단일 액션으로 합친다 (상세: `/scc-app-add-screen`)

## TypeScript Guidelines

- props/state/함수 시그니처에 명시적 타입. object shape은 `interface` 선호. 타입 전용 import는 `import type`
- `any` 금지 → `unknown` 또는 정확한 타입. 고정 값 집합은 enum/union
- **고유명사 유지**: 약어화하지 않는다 (`BbucleRoad`를 `Bbucle`로 줄이지 않음)
- **공통 로직 추출**: 여러 화면에서 반복되는 로직(WebView URL 핸들링 등)은 `utils/`로

## Figma 디자인 구현

- 구현 + 스크린샷 1:1 비교 루프 (Layout → Precision, 반복 실수 방지 포함): `/figma-to-app`
- 이미지 에셋 추출 (3x PNG REST export, SVG 검증, crop): `/scc-figma-assets` — 프로그래밍으로 이미지 생성 절대 금지
- 에뮬레이터 E2E (adb 탭/한국어 입력/CDP/검증 깊이): `.claude/skills/android-e2e-test.md`
- 로컬 환경/env 트러블슈팅: `/scc-local-env`

---

이 파일은 fact만 담는다. 절차는 skill, 강제 규칙은 workspace `.claude/hooks/` + `/scc-self-review`(D행) 참조. 줄수 상한 120.
