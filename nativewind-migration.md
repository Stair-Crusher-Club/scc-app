# NativeWind Migration

## 1. Motivation (배경 및 목적)

현재 프로젝트에서 사용 중인 `styled-components`는 2025년 3월, 핵심 메인테이너(Evan Jacobs)가 공식적으로 **유지보수 모드(Maintenance Mode)** 전환을 선언했습니다. 신규 기능 개발은 중단되었으며, 간헐적인 버그 수정만 이루어질 예정입니다. ([공식 공지 링크](https://opencollective.com/styled-components/updates/thank-you))

전환 배경으로는 React 생태계가 CSS-in-JS에서 멀어지고 있다는 점, 그리고 Tailwind CSS의 폭발적인 성장이 주요 원인으로 언급되었습니다.

한편, LLM 기반 코드 생성은 텍스트 기반의 클래스명(Tailwind CSS)을 예측하고 생성하는 데 최적화되어 있습니다.

따라서 `NativeWind`로 교체하여 LLM의 코드 생성 능력을 최대한 활용하고, 궁극적으로 프론트엔드 UI 개발 생산성을 대폭 향상시키는 것이 이번 작업의 목적입니다.

---

## 2. Goals & Non-Goals

### Goal

- 앱 전체의 `styled-components` 의존성을 `NativeWind`로 100% 교체.
- 두 스타일링 라이브러리가 공존하는 과도기 동안 빌드 및 런타임 에러가 발생하지 않도록 환경 구성.

### Non-Goal (Out of Scope)

- **공통 컴포넌트(Design System)의 완벽한 설계 및 리팩토링:** 마이그레이션 과정에서 코드 중복이 발생하더라도 이를 허용하며, 화면 마이그레이션 완료를 최우선으로 합니다.
- **UI/UX 디자인 변경:** 기존과 완전히 동일한 UI(Visual Identity)를 유지하는 것을 원칙으로 합니다.

---

## 3. Proposed Approach (작업 진행 방식 및 전략)

마이그레이션은 **화면(Screen) 단위의 점진적 교체**를 원칙으로 합니다.

1. **환경 세팅 (완료):** `NativeWind` 설치 및 `tailwind.config.js` 구성이 완료되었으며, 기존 `styled-components`와 충돌 없이 병행 사용(Co-existence) 가능한 상태입니다.
2. **화면 단위 점진적 마이그레이션:**
   - **Phase 1 (Low Risk):** 사용 빈도가 낮은 화면부터 작업을 진행합니다. 문제가 발생하더라도 사용자 영향이 최소화됩니다.
   - **Phase 2 (High Risk):** 코어 화면을 마이그레이션합니다.
3. **공통 컴포넌트 후순위 작업:** 여러 화면에서 사용되는 공통 컴포넌트는 변경 시 영향 범위가 크므로, 개별 화면 작업이 끝난 후 가장 마지막에 통합 및 전환합니다.

---

## 4. QA 전략

- **실기기 교차 검증:** React Native 특성상 시뮬레이터와 실제 기기의 렌더링이 다를 수 있으므로, iOS와 Android 실기기에서 직접 확인합니다.

---

## 5. Deployment & Rollback 전략

- **배포 전략 (CodePush Iterative Release):** 일부 화면의 마이그레이션이 완료될 때마다 점진적으로 CodePush 배포를 진행합니다.
- **롤백 전략 (CodePush Rollback):** 이번 마이그레이션은 스타일링 레이어만 교체하는 작업이므로, 앱 크래시로 이어질 가능성은 없습니다. 롤백 트리거는 레이아웃 깨짐으로 한정하며, 크리티컬한 UI 오류 발생 시 즉시 CodePush 콘솔에서 이전 릴리스로 롤백합니다.

---

## 6. Future Work (후속 작업)

- 프로젝트 내 `styled-components` 패키지 완전 삭제 및 관련 설정 제거.
- 중복 작성된 NativeWind 클래스들을 묶어 `Flex`, `Box` 등 범용 UI 컴포넌트로 추상화하여 공통 컴포넌트 시스템 구축.

---

## 7. Coding Rules

`styled-components` 코드를 `NativeWind`로 변환합니다. 아래 규칙을 엄격히 준수하여 코드를 생성하세요.

### 7-1. Core Principles (핵심 원칙)

- **No Inline Styles:** `style={...}` 객체는 절대 사용하지 않는다. 모든 스타일은 오직 `className` 속성으로만 작성한다.
  - 단, Shadow는 예외적으로 `style` 객체를 사용한다. (Rule 7-4 참고)
- **Default Properties:** `position: 'relative'` 또는 `display: 'flex'`는 React Native의 기본값이므로, 명시적으로 `relative` 또는 `flex` 클래스를 추가하지 않는다.
- **Gap over Margin:** 요소 간 간격(Spacing)은 부모 컨테이너에 `gap-[px]` 속성을 부여하여 처리하는 것을 최우선으로 한다. (Margin 사용을 지양)
- **Precision Pixel Scaling:** 기본적으로 4px 단위(`p-1`, `m-2` 등)를 지향하되, 디자인 시안과 1:1 일치가 중요하므로 **정확한 픽셀 값(`p-[20px]`, `mb-[4px]`) 사용을 권장**한다.
  - 4px 단위로 떨어지지 않는 경우 반드시 하드코딩된 대괄호 구문(`-[13px]`)을 사용한다.
- **Typography Detail:** `fontSize`와 `lineHeight`는 `className`으로 통합 처리한다. (예: `text-[16px] leading-[24px]`)
- **Shared Component Caution:** 여러 화면에서 공유되는 컴포넌트(예: `UnderlineInput`, `SccButton` 등)는 화면 단위 마이그레이션 시 수정을 지양한다.
  - 아직 마이그레이션되지 않은 공용 컴포넌트에 스타일을 전달해야 할 경우, `style` 객체 사용을 허용한다.
  - 공유 컴포넌트 수정 시 다른 화면에 사이드 이펙트가 발생할 수 있으므로, 모든 화면 마이그레이션이 완료된 후 별도 단계에서 진행한다.

### 7-2. Design Tokens & Fonts (디자인 토큰)

- **Specific Font Weights:** `font-pretendard`만 사용하지 말고, 반드시 Weight를 명시한다.
- **Pretendard Font Family:**
  - `font-pretendard-extralight` (100)
  - `font-pretendard-thin` (200)
  - `font-pretendard-light` (300)
  - `font-pretendard-regular` (400) ⭐ 기본
  - `font-pretendard-medium` (500)
  - `font-pretendard-semibold` (600)
  - `font-pretendard-bold` (700)
  - `font-pretendard-extrabold` (800)
  - `font-gumi-romance` (GumiRomance Font)
- **Color Naming:** `tailwind.config.js`에 정의된 이름을 사용한다. (`text-gray-90`, `bg-brand-50`, `border-blue-40` 등)
- **SVG Colors:** SVG 내의 `fill`, `stroke` 등에는 `className`이 작동하지 않으므로, 반드시 `src/constant/color.ts`에서 `color` 객체를 import하여 사용한다.
  - **⚠️ 주의:** `color.gray[90]` 형식으로 접근 (TypeScript 타입 안정성).
  - 예: `<Path fill={color.gray[90]} />`

### 7-3. Conditional Styling (조건부 스타일)

- **`cn` Utility First:** 조건부 스타일링이나 스타일 결합이 필요한 경우 반드시 `@/utils/cn`에서 제공하는 `cn` 함수를 사용한다.
- **No Style Logic in JSX:** `style={{ color: isActive ? 'red' : 'blue' }}` 대신 `cn`을 통해 클래스 단위로 분기한다.
- **`cn` Patterns:**
  - **단일 조건:** `className={cn('base', condition ? 'true-class' : 'false-class')}`
  - **여러 조건 독립:** `className={cn('base', cond1 && 'c1', cond2 && 'c2', cond3 ? 'ca' : 'cb')}`
  - **복잡한 조건 (변수 분리):**
    ```tsx
    const variantClasses = {
      selected: 'border-blue-40 bg-brand-5 text-brand-50',
      default: 'border-gray-20 bg-white text-gray-80',
    };
    className={cn('base', selected ? variantClasses.selected : variantClasses.default, disabled && 'opacity-30')}
    ```

### 7-4. Native-Specific Constraints (RN 제약 사항)

- **Text Inheritance:** 스타일 상속이 안 되므로 모든 텍스트 스타일은 반드시 `Text` 컴포넌트의 `className`에 직접 작성한다.
- **Unsupported Features:** 아래 기능은 `className`으로 작성하지 않고 별도 처리한다.
  - **Shadow:** `shadow-lg` 대신 `style` 객체의 `boxShadow` 속성으로 처리한다.
    ```tsx
    style={{
      boxShadow: [
        {
          offsetX: 0,
          offsetY: 0,
          blurRadius: 10,
          spreadDistance: 7,
          color: "rgba(0, 0, 255, 0.7)",
        },
      ],
    }}
    ```
  - **Animation:** `transition-all` 대신 `react-native-reanimated` 사용.
  - **Pseudo-selectors:** `:hover`, `:focus` 등 가상 선택자 지원 안 함. (JS 상태값 + `cn` 조합으로 처리)
  - **Backdrop-filter:** `backdrop-blur` 등 지원 안 함.

### 7-5. Workflow (작업 방식)

- **Branch Naming**:
  - 단일 화면: `migration/screen-name`
  - 여러 화면/기능 단위: `migration/feature-name` (예: `feature-auth`, `feature-review`)
  - 공통 요소/범위: `migration/common-scope` (예: `common-modals`, `common-components`)
- **Cleanup:** 마이그레이션이 완료된 컴포넌트의 기존 `.style.ts` 파일은 삭제한다.

### 7-6. Migration Example (Before & After)

#### Before

```tsx
const Title = styled.Text`
  font-size: 16px;
  font-family: ${font.pretendardBold};
  color: ${color.gray90};
  margin-bottom: 4px;
`;
<Title>제목</Title>;
```

#### After

```tsx
<Text className="font-pretendard-bold text-gray-90 mb-[4px] text-[16px]">
  제목
</Text>
```

---

## 8. Migration Tracker

> 상태 범례: `대기` 진행 전 · `진행` 작업 중 · `테썹 배포` CodePush 테스트 배포 완료 · `QA 완료` 실기기 검증 완료 · `실섭 배포` 프로덕션 배포 완료 · `삭제` 해당 파일 제거됨

| 화면 (스크린 컴포넌트)          |   상태    | Phase | 비고                                                                                  |
| :------------------------------ | :-------: | :---: | :------------------------------------------------------------------------------------ |
| 1. **Login**                       | 테썹 배포 |   1   |                                                                                       |
| 2. **Signup**                      | 테썹 배포 |   1   | Signup 하위 컴포넌트 마이그레이션 완료. 공용 폼(UserEmailForm 등) 및 입력 필드는 보류 |
| 3. **Setting**                     |   대기    |   1   |                                                                                       |
| 4. **Review**                      |   대기    |   1   |                                                                                       |
| 5. **Review/History**              |   대기    |   1   |                                                                                       |
| 6. **Review/Upvote**               |   대기    |   1   |                                                                                       |
| 7. **Conquerer**                   |   대기    |   1   |                                                                                       |
| 8. **Conquerer/History**           |   대기    |   1   |                                                                                       |
| 9. **Conquerer/Upvote**            |   대기    |   1   |                                                                                       |
| 10. **UpvoteAnalytics**             |   대기    |   1   |                                                                                       |
| 11. **CrusherActivity**             |   대기    |   1   |                                                                                       |
| 12. **PastSeasonDetail**            |   대기    |   1   |                                                                                       |
| 13. **AddComment**                  |   대기    |   1   |                                                                                       |
| 14. **GuideForFirstVisit**          |   대기    |   1   | FullScreen Modal                                                                      |
| 15. **FavoritePlaces**              |   대기    |   1   |                                                                                       |
| 16. **Main**                        |   대기    |   2   |                                                                                       |
| 17. **Search**                      |   대기    |   2   |                                                                                       |
| 18. **Camera**                      |   대기    |   2   |                                                                                       |
| 19. **PlaceFormV2**                 |   대기    |   2   |                                                                                       |
| 20. **PlaceDetailV2**               |   대기    |   2   |                                                                                       |
| 21. **ExternalAccessibilityDetail** |   대기    |   2   |                                                                                       |
| 22. **BuildingFormV2**              |   대기    |   2   |                                                                                       |
| 23. **ChallengeDetail**             |   대기    |   2   |                                                                                       |
| 24. **ProfileEditor**               |   대기    |   2   |                                                                                       |
| 25. **ProfileEditor/Detail**        |   대기    |   2   |                                                                                       |
| 26. **Conquerer/Monthly**           |   대기    |   2   | Modal                                                                                 |
| 27. **PlacePhotoGuide**             |   대기    |   2   | FullScreen Modal                                                                      |
| 28. **Webview**                     |   대기    |   2   | FullScreen Modal                                                                      |
| 29. **ToiletMap**                   |   대기    |   2   |                                                                                       |
| 30. **SavedPlaceLists**             |   대기    |   2   |                                                                                       |
| 31. **PlaceListDetail**             |   대기    |   2   |                                                                                       |
| 32. **PlaceGroupMap**               |   대기    |   2   |                                                                                       |
| 33. **SearchUnconqueredPlaces**     |   대기    |   2   |                                                                                       |
| 34. **ImageZoomViewer**             |   대기    |   2   | FullScreen Modal                                                                      |
| 35. **RegistrationComplete**        |   대기    |   2   | FullScreen Modal                                                                      |
| 36. **ReviewForm/Place**            |   대기    |   2   |                                                                                       |
| 37. **ReviewForm/Toilet**           |   대기    |   2   |                                                                                       |

---

## 통계

- **상태 요약**
  - 대기: 36개
  - 진행: 0개
  - 테썹 배포: 2개
  - QA 완료: 0개
  - 실섭 배포: 0개
  - 삭제: 0개
- **전체 진척도**: **5%**
