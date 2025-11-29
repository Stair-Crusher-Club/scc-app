# BbucleRoad Edit Mode 구현 계획

## 개요
서버 개발 없이 웹에서 직접 뿌클로드 데이터를 생성/수정할 수 있는 Edit Mode 구현.
- 하드코딩된 config로 데이터 관리 (API spec과 동일한 형태)
- `?editMode=true` queryParam으로 편집 모드 활성화
- View mode + Edit 컴포넌트로 편집 UI 구현

---

## 1. 핵심 아키텍처

### 1.1 데이터 흐름
```
[하드코딩 Config] → [editMode 감지] → [View/Edit Mode 분기]
                                              ↓
                              [편집 완료] → [JSON 복사 버튼]
```

### 1.2 파일 구조
```
web/screens/BbucleRoadScreen/
├── index.tsx                          # editMode 감지, 데이터 로드
├── config/
│   └── bbucleRoadData.ts              # 하드코딩된 ID-Data config
├── context/
│   └── EditModeContext.tsx            # Edit state 관리 (React Context)
├── sections/
│   └── RouteSection.tsx               # 기존 + edit mode 지원
├── components/
│   ├── InteractiveImage.tsx           # 기존 + polygon 편집 지원
│   ├── RegionDetailModal.tsx          # 기존
│   ├── PolygonEditor.tsx              # NEW: 점 찍기로 polygon 생성
│   └── ImageUploader.tsx              # NEW: 이미지 업로드 컴포넌트
├── edit/
│   ├── EditSidebar.tsx                # NEW: 우측 사이드바 (JSON import/export)
│   ├── RouteEditor.tsx                # NEW: 탭 추가/수정 UI
│   └── EditToolbar.tsx                # NEW: 인라인 편집 버튼들
```

---

## 2. 구현 상세

### 2.1 Config 파일 (`config/bbucleRoadData.ts`)
```typescript
import type { GetBbucleRoadPageResponseDto } from '@/generated-sources/openapi';

// ID별 하드코딩 데이터
export const BBUCLE_ROAD_DATA: Record<string, GetBbucleRoadPageResponseDto> = {
  'gocheok-skydome': {
    id: 'gocheok-skydome',
    title: '고척스카이돔',
    titleImageUrl: '...',
    summaryItems: [...],
    sections: [...],
    routeSection: {
      title: '동선정보',
      routes: [...]
    }
  },
  // 추가 ID...
};

// 빈 데이터 템플릿 (새 페이지 생성용)
export const EMPTY_BBUCLE_ROAD_DATA: GetBbucleRoadPageResponseDto = {
  id: '',
  title: '',
  titleImageUrl: '',
  summaryItems: [],
  sections: [],
  routeSection: null,
};
```

### 2.2 EditMode 감지 (`index.tsx`)
```typescript
// URL에서 editMode 감지
const searchParams = new URLSearchParams(window.location.search);
const isEditMode = searchParams.get('editMode') === 'true';

// 데이터 로드 로직
const configData = BBUCLE_ROAD_DATA[bbucleRoadId];
if (!configData && !isEditMode) {
  return <NotFoundPage />;  // 404
}
const initialData = configData || EMPTY_BBUCLE_ROAD_DATA;
```

### 2.3 Edit State 관리 (`EditModeContext.tsx`)
```typescript
interface EditModeContextValue {
  isEditMode: boolean;
  data: GetBbucleRoadPageResponseDto;
  updateData: (updater: (prev) => prev) => void;
  undoStack: any[];  // Cmd+Z 지원용
  undo: () => void;
}
```

### 2.4 Polygon 편집 (`PolygonEditor.tsx`)
- **클릭으로 점 찍기**: 이미지 위 클릭 시 점 추가
- **Cmd+Z**: 마지막 점 취소 (undoStack 활용)
- **완료 버튼**: polygon 저장
- **좌표 변환**: pixel → relative (0-1)

```typescript
const handleImageClick = (e: MouseEvent) => {
  const rect = imageRef.current.getBoundingClientRect();
  const relativeX = (e.clientX - rect.left) / rect.width;
  const relativeY = (e.clientY - rect.top) / rect.height;

  setCurrentPoints(prev => [...prev, { x: relativeX, y: relativeY }]);
  pushToUndoStack({ type: 'ADD_POINT' });
};

useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
      e.preventDefault();
      undo();  // 마지막 점 제거
    }
  };
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

### 2.5 이미지 업로드 (`ImageUploader.tsx`)
```typescript
// Web용 file input
<input type="file" accept="image/*" onChange={handleFileSelect} />

const handleFileSelect = async (e) => {
  const file = e.target.files[0];
  const blobUrl = URL.createObjectURL(file);

  // Presigned URL 획득 및 업로드
  const [presignedUrl] = await api.getImageUploadUrlsPost({
    count: 1,
    filenameExtension: 'jpeg',
  }).then(res => res.data.map(d => d.url));

  const { url } = await ImageFileUtils.uploadImage(presignedUrl, blobUrl);
  onUploadComplete(url);
};
```

### 2.6 Edit UI

#### 인라인 버튼 (간단한 조작)
- 탭 옆 **X 버튼**: 탭(동선) 삭제
- 탭 끝 **+ 버튼**: 새 탭 추가
- Polygon 위 **X 버튼**: clickable region 삭제
- 이미지 위 **편집 아이콘**: 이미지 교체

#### 사이드바 (복잡한 조작)
- **JSON Import**: textarea에 붙여넣기 → 파싱 → 데이터 로드
- **JSON Export**: 현재 데이터 JSON 복사 버튼
- **현재 편집 상태**: 선택된 탭, polygon 개수 등 표시

---

## 3. 구현 순서

### Phase 1: 기반 구조 (필수)
1. `config/bbucleRoadData.ts` 생성 - 하드코딩 데이터 구조
2. `context/EditModeContext.tsx` 생성 - edit state 관리
3. `index.tsx` 수정 - editMode 감지, config 데이터 로드, 404 처리

### Phase 2: Edit UI 기본
4. `edit/EditSidebar.tsx` 생성 - JSON import/export
5. `edit/EditToolbar.tsx` 생성 - 인라인 버튼 컴포넌트들
6. `sections/RouteSection.tsx` 수정 - editMode prop 받아서 편집 UI 표시

### Phase 3: 이미지 업로드
7. `components/ImageUploader.tsx` 생성 - web file input + presigned URL 업로드
8. RouteSection에 이미지 업로드 연동 (description, interactive)

### Phase 4: Polygon 편집
9. `components/PolygonEditor.tsx` 생성 - 점 찍기 UI, Cmd+Z 지원
10. `components/InteractiveImage.tsx` 수정 - editMode에서 PolygonEditor 렌더링
11. Clickable region 추가/삭제 기능

### Phase 5: 완성
12. 전체 통합 테스트
13. 빈 데이터로 새 페이지 생성 테스트

---

## 4. 수정할 파일 목록

| 파일 | 작업 |
|------|------|
| `web/screens/BbucleRoadScreen/index.tsx` | editMode 감지, config 로드, Context Provider 래핑 |
| `web/screens/BbucleRoadScreen/sections/RouteSection.tsx` | editMode prop 추가, 인라인 편집 버튼 |
| `web/screens/BbucleRoadScreen/components/InteractiveImage.tsx` | editMode에서 PolygonEditor 사용 |

| 파일 | 작업 |
|------|------|
| `web/screens/BbucleRoadScreen/config/bbucleRoadData.ts` | **신규** - 하드코딩 데이터 |
| `web/screens/BbucleRoadScreen/context/EditModeContext.tsx` | **신규** - Edit state Context |
| `web/screens/BbucleRoadScreen/edit/EditSidebar.tsx` | **신규** - 우측 사이드바 |
| `web/screens/BbucleRoadScreen/edit/EditToolbar.tsx` | **신규** - 인라인 버튼들 |
| `web/screens/BbucleRoadScreen/components/ImageUploader.tsx` | **신규** - 이미지 업로드 |
| `web/screens/BbucleRoadScreen/components/PolygonEditor.tsx` | **신규** - Polygon 점 찍기 |

---

## 5. 결정 사항 요약

| 항목 | 결정 |
|------|------|
| 데이터 저장 | JSON 복사 버튼 (클립보드) |
| Polygon 그리기 | 클릭으로 점 찍기 + Cmd+Z 취소 |
| Edit UI | 혼합 (인라인 + 사이드바) |
| 이미지 업로드 | presigned URL via `api.getImageUploadUrlsPost()` |
| 상태 관리 | React Context (EditModeContext) |
