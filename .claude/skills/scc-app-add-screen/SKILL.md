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
