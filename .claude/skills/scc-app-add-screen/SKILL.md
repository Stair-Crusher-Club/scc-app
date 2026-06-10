---
name: scc-app-add-screen
description: React Native 앱에 새 화면을 추가합니다. ScreenLayout, Navigation 등록, SccXxx 컴포넌트 사용을 포함합니다.
---

# SCC App - 새 화면 추가

## 입력 정보

1. **화면 이름** - PascalCase (예: MyNewScreen)
2. **화면 설명** - 화면의 목적과 기능
3. **Figma URL** (선택) - 디자인 명세
4. **API 엔드포인트** (선택) - 사용할 API

---

## Step 1: 화면 디렉토리 생성

```
src/screens/
└── {ScreenName}/
    ├── index.ts              # Export
    ├── {ScreenName}.tsx      # 메인 컴포넌트
    └── sections/             # (선택) 섹션 컴포넌트
```

---

## Step 2: 화면 컴포넌트 구현

### 기본 템플릿

```typescript
import React, { useCallback } from 'react';
import { ScrollView } from 'react-native';
import styled from 'styled-components/native';

import { ScreenProps } from '@/navigation/Navigation.screens';
import { ScreenLayout } from '@/components/ScreenLayout';
import { SccButton, SccPressable } from '@/components/atoms';

export interface {ScreenName}Params {
  // route params 정의
}

export default function {ScreenName}({
  route,
  navigation
}: ScreenProps<'{ScreenName}'>) {
  return (
    <ScreenLayout isHeaderVisible={true}>
      <ScrollView>
        <Container>
          {/* 컨텐츠 구현 */}
        </Container>
      </ScrollView>
    </ScreenLayout>
  );
}

// Styled components
const Container = styled.View`
  padding: 16px;
`;
```

---

## Step 3: Navigation 등록

`src/navigation/Navigation.screens.ts`:

```typescript
// 1. Import 추가
import {ScreenName}, { {ScreenName}Params } from '@/screens/{ScreenName}';

// 2. ScreenParams 타입에 추가
export type ScreenParams = {
  {ScreenName}: {ScreenName}Params;
  // ... 기존 화면들
};

// 3. MainNavigationScreens 배열에 추가
export const MainNavigationScreens = [
  {
    name: '{ScreenName}',
    component: {ScreenName},
    options: {
      headerShown: true,
      headerTitle: '화면 제목',
      // presentation: 'modal', // 모달인 경우
    },
  },
  // ... 기존 화면들
];
```

---

## Step 4: index.ts 작성

```typescript
export { default } from './{ScreenName}';
export type { {ScreenName}Params } from './{ScreenName}';
```

---

## 모달/오버레이: BottomSheet 패턴

모달, 확인 다이얼로그, 오버레이는 `BottomSheet` 컴포넌트 사용:

```typescript
// 확인 모달
<BottomSheet isVisible={isVisible} onPressBackground={handleClose}>
  <ContentsContainer>
    <Title>Confirm Action</Title>
    <BottomSheetButtonGroup
      layout={BottomSheetButtonGroupLayout.HORIZONTAL_1X2}
      positiveButton={{text: 'Confirm', onPressed: handleConfirm}}
      negativeButton={{text: 'Cancel', onPressed: handleCancel}}
    />
  </ContentsContainer>
</BottomSheet>

// 옵션 선택
<BottomSheet isVisible={isVisible}>
  <OptionSelector>
    {options.map(option => (
      <SccButton
        key={option.id}
        text={option.text}
        onPress={() => handleSelect(option)}
        elementName={`option-${option.id}`}
      />
    ))}
  </OptionSelector>
</BottomSheet>
```

---

## 로깅 패턴

### useLogger() Hook

`Logger.logElementView`/`logElementClick` 직접 호출 금지 (TS 에러 + ESLint warn, `src/logging/*`·`useSccEventLogging.ts`만 예외). 컴포넌트에서는 반드시 `useLogger()` hook 사용:

```typescript
import {useLogger} from '@/logging/useLogger';

const logger = useLogger();
logger.logElementView('event_name', {custom_param: 'value'});
// → globalLogParams + route.name 자동 주입

// useCallback/useEffect 안에서 사용 시 — loggerRef 패턴
// useLogger()는 매 렌더마다 새 객체를 반환하므로 deps에 넣으면 매번 재생성 → 자식 리렌더 유발.
// ref로 감싸서 "항상 최신값이지만 deps를 트리거하지 않는" 안정 참조를 만든다.
const logger = useLogger();
const loggerRef = useRef(logger);
loggerRef.current = logger;  // 매 렌더마다 최신 logger로 갱신

const handleScroll = useCallback(() => {
  loggerRef.current.logElementView('section', {id: sectionId});
}, [sectionId]);  // logger가 deps에 없어도 항상 최신값
```

### LogParamsProvider 패턴

섹션/화면 단위로 공통 로깅 파라미터(예: `displaySectionName`)를 하위 컴포넌트에 자동 전파할 때 사용. 개별 logParams에 직접 넣지 말 것:

```typescript
import {LogParamsProvider, useLogParams} from '@/logging/LogParamsProvider';

// 섹션 컴포넌트에서 Provider로 감싸기
export default function MySection() {
  return (
    <LogParamsProvider params={{displaySectionName: '섹션명'}}>
      {/* 하위 SccPressable, SccButton 등에 자동 적용됨 */}
      <SccPressable elementName="my-button" logParams={{buttonId: 1}} />
    </LogParamsProvider>
  );
}

// 직접 Logger 호출 시 useLogParams()로 전역 params 병합
const globalLogParams = useLogParams();
Logger.logElementClick({
  name: 'custom-event',
  currScreenName: 'MyScreen',
  extraParams: {...globalLogParams, customParam: 'value'},
});
```

- 중첩된 Provider에서 자식 params가 부모 params를 override
- `element_view`는 마운트 시, `element_click`은 press 시 자동 로깅. 전역 registry가 같은 elementName+params 중복을 감지

### SccRemoteImage (원격 이미지 필수)

원격 URL 이미지는 `<Image source={{uri}}>` 직접 사용 금지 — `SccRemoteImage` 사용 (`Image.getSize` + 메모리 캐시 + 비율 자동 계산 내장):

```typescript
import SccRemoteImage from '@/components/SccRemoteImage';

// width 지정 → height 원본 비율로 자동 계산
<SccRemoteImage imageUrl={imageUrl} style={{width: 300}} resizeMode="cover" />

// height 고정 모드 (width 자동 계산)
<SccRemoteImage imageUrl={imageUrl} fixedHeight={200} resizeMode="cover" />
```

- `wrapperBackgroundColor`로 로딩 중 배경색 제어 (null이면 투명)

---

## 네비게이션 전환 flash/flicker 문제

전환 사이에 중간 프레임(다른 색 화면)이 잠깐 보이면 **배경색이 아니라 타이밍을 고친다**:

- 배경색 수정(`contentStyle` 등)은 증상만 가리는 defensive fix — 원인은 비원자적 네비게이션 dispatch
- 여러 액션 연속 dispatch(`pop() + pop() + navigate()`)를 **단일 액션으로 합친다**: `navigation.popTo(name, params)` (v7 native-stack), `CommonActions.reset`, `StackActions.pop(n)` + params merge
- 예외: splash → navigator 전환처럼 원래 다른 색이 보이는 게 자연스러운 컨텍스트는 배경색 유지

---

## 필수 체크리스트

### SccXxx 컴포넌트
- [ ] 모든 터치 가능한 요소에 `SccButton`, `SccPressable` 등 사용
- [ ] `elementName` prop 필수 - 고유하고 의미있는 이름
- [ ] 필요시 `logParams`로 추가 로깅 데이터

### ScreenLayout
- [ ] 루트에 `ScreenLayout` 컴포넌트 사용
- [ ] `isHeaderVisible` 설정 (Navigation options와 일치)
- [ ] 텍스트 입력 화면: `isKeyboardAvoidingView={true}`

### API 연동
- [ ] `@/generated-sources/openapi`의 타입 사용
- [ ] React Query (`useQuery`, `useMutation`) 사용
- [ ] 로딩/에러 상태 UI 처리

### Figma 디자인 (있는 경우)
- [ ] `get_design_context`로 디자인 분석
- [ ] 색상, 간격, 폰트 정확히 매칭
- [ ] CLAUDE.md의 Figma 가이드라인 참조

---

## 검증

```bash
yarn lint          # ESLint 통과
yarn tsc --noEmit  # TypeScript 통과
```

---

## 참조

- `CLAUDE.md` - 전체 개발 가이드라인
- 기존 화면들 참고: `src/screens/` 디렉토리
