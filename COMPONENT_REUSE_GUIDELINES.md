# Component Reuse Guidelines

## 핵심 원칙

- **재사용 가능한 컴포넌트는 무조건 재사용**
- **로직이나 디자인이 분명하게 다른 코드는 따로 작성 가능**

## 재사용해야 하는 컴포넌트들

### 기능성 컴포넌트 (무조건 재사용)
- `SearchListView` - 검색 결과 리스트 표시 기능
- `PlaceDetailScreen` - 장소 상세 정보 표시 기능
- `SearchItemCard` - 개별 검색 결과 아이템
- 기타 비즈니스 로직이 포함된 컴포넌트들

### 플랫폼별로 다를 수 있는 부분
- Screen wrapper 컴포넌트 (모바일 vs 웹 레이아웃)
- 플랫폼 특화 UI 컴포넌트
- Navigation 로직 (React Navigation vs 웹 state 관리)

## 구현 방법

### 1. 기존 컴포넌트에 확장성 추가
```typescript
// 기존 컴포넌트에 optional props 추가하여 웹에서 customization 가능하도록
interface SearchListViewProps {
  // 기존 props
  searchResults: PlaceListItem[];
  isLoading: boolean;
  isVisible: boolean;

  // 웹용 customization props (optional)
  onPlaceSelect?: (item: PlaceListItem) => void;
}
```

### 2. Platform API를 통한 플랫폼별 분기 처리
```typescript
import { Platform } from 'react-native';

// 플랫폼별 로직 분기
const handleItemPress = (item: PlaceListItem) => {
  if (Platform.OS === 'web' && onPlaceSelect) {
    // 웹: 상태 업데이트
    onPlaceSelect(item);
  } else {
    // 모바일: 네비게이션
    navigation.navigate('PlaceDetail', { placeInfo: { placeId: item.place.id } });
  }
};
```

### 3. 플랫폼별 파일 확장자 활용 (필요시)
```
ComponentName.tsx      // 공통 컴포넌트
ComponentName.web.tsx  // 웹 전용 구현
ComponentName.native.tsx // 모바일 전용 구현
```

### 웹에서 기존 컴포넌트 import
```typescript
// 복사본 만들지 말고 기존 것 그대로 사용
import SearchListView from '@/screens/SearchScreen/components/SearchListView';
import PlaceDetailScreen from '@/screens/PlaceDetailScreen/PlaceDetailScreen';
```

## 금지 사항

❌ 기능성 컴포넌트 복사해서 `ComponentNameWeb` 만들기
❌ 비즈니스 로직 중복 구현
❌ 동일한 기능을 하는 컴포넌트 두 벌 유지

## 허용 사항

✅ 플랫폼별 Screen wrapper 컴포넌트
✅ 플랫폼 특화 레이아웃 컴포넌트
✅ 기존 컴포넌트에 optional props 추가하여 확장