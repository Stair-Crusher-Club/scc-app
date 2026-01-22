---
name: bbucle-road-dev
description: 뿌클로드 페이지 개발. 새 venue 추가, 기존 venue 수정, Figma 디자인 반영 시 사용.
---

# 뿌클로드 개발 가이드

## 사용 시점
- 새 뿌클로드 venue 페이지 추가
- 기존 venue 이미지/데이터 수정
- Figma 디자인 반영
- CSS/레이아웃 디자인 차이 수정

---

## 1. Figma 구조 파악

### 1.1 메타데이터 가져오기
```
mcp__figma-dev-mode-mcp-server__get_metadata로 전체 페이지 구조 확인
```

### 1.2 섹션별 노드 ID 매핑 테이블 작성
| 섹션 | Figma 노드 ID | 설명 |
|------|--------------|------|
| 헤더 배경 | | |
| 타이틀 이미지 | | |
| 한눈에보기 | | |
| 교통정보 탭별 | | |
| 매표정보 | | |
| 시야정보 | | |
| 근처맛집 | | (여러 개일 수 있음) |

---

## 2. 합성 프레임 vs 단순 이미지 판별

### 2.1 각 노드에 대해 get_design_context 호출
```
자식 요소가 있으면 → 합성 프레임 (마커, 경로 등 포함)
자식 요소가 없으면 → 단순 이미지
```

### 2.2 합성 프레임 확인
- 배경 이미지 (bg, image) 있는가?
- 경로 라인 (route) 있는가?
- 번호 마커 (map_number, poi+label) 있는가?

**합성 프레임이면 → 부모 프레임 ID로 export해야 함**

---

## 3. 이미지 데이터 비교

bbucleRoadData.ts의 이미지 URL 필드들과 Figma 노드 비교 테이블 작성.

---

## 4. CSS/레이아웃 스타일 검증

이미지뿐만 아니라 **CSS 스타일 차이**도 확인.

### 4.1 Figma에서 스타일 값 추출

get_design_context로 **Desktop 노드**와 **Mobile 노드** 각각 확인:
- font-size, line-height, font-weight
- padding, margin, gap
- border-radius
- width, height

### 4.2 CSS 비교 테이블 작성

| 항목 | Figma Desktop | Figma Mobile | 현재 코드 | 수정 필요 |
|------|--------------|--------------|-----------|----------|
| (항목별 작성) | | | | |

### 4.3 확인해야 할 컴포넌트

1. **bbucleRoadData.ts의 descriptionHtmls** - HTML 인라인 스타일
2. **섹션 컴포넌트의 styled-components** - 부모 컴포넌트 스타일
3. **HtmlContentWrapper** - CSS 변수 (반응형 스타일용)

---

## 5. 레이아웃 문제 진단

"박스가 width를 안 채움", "간격이 다름" 같은 문제 발생 시:

### 5.1 문제 유형별 진단

| 증상 | 원인 가능성 | 해결 방법 |
|------|-----------|----------|
| 박스가 100% 안 채움 | `flex: 1 0 0` 사용 | `width: 100%`로 변경 |
| 모바일에서 width 안 맞음 | styled-component에 width 미지정 | 명시적 width 추가 |
| 간격(gap) 다름 | gap 값 하드코딩 | Figma 값으로 수정 |

### 5.2 동작하는 섹션과 비교 (IMPORTANT)

문제가 있는 섹션이 있으면 **동작하는 다른 섹션**과 비교:
- 같은 구조의 다른 섹션 찾기
- descriptionHtml 구조 차이 확인
- styled-components 차이 확인

### 5.3 부모 컴포넌트도 확인

HTML 스타일만 수정해도 안 되면 **부모 styled-component** 확인:
- flex-basis만으로는 실제 width 보장 안 됨
- 명시적 width 필요할 수 있음

---

## 6. 이미지 Export & 업로드

### 6.1 이미지 Export
```bash
curl -s -H "X-Figma-Token: $TOKEN" \
  "https://api.figma.com/v1/images/${FILE_KEY}?ids=${NODE_IDS}&format=png&scale=2"
```

### 6.2 S3 업로드
```bash
aws-vault exec swann-scc -- aws s3 cp image.png \
  s3://scc-dev-accessibility-images-2/$(date +%Y%m%d%H%M%S)_filename.png \
  --acl public-read
```

---

## 7. 검증

```bash
yarn web
# http://localhost:3000/bbucle-road/{venue-id}
```

- 모든 섹션 이미지 표시 확인
- 모바일 뷰포트에서 width/gap/font 확인
- descriptionHtml 박스가 제대로 채워지는지 확인

---

## 흔한 실수 방지

### 하지 말 것
1. 개별 배경 이미지(bg)만 export → 마커/경로 누락됨
2. 하나의 mapImageUrl만 있다고 가정 → 여러 지도가 있을 수 있음
3. 데스크탑만 확인 → 모바일용 별도 이미지/스타일 필요할 수 있음
4. CSS 문제를 이미지 문제로 오해 → 레이아웃/스타일 먼저 확인
5. HTML만 수정하고 부모 컴포넌트 무시 → styled-component도 확인
6. `flex: 1 0 0` 사용 → 모바일에서 width 문제 발생 가능

### 해야 할 것
1. 항상 전체 구조 먼저 파악 (get_metadata)
2. 각 노드가 합성인지 확인 (get_design_context)
3. 현재 데이터와 Figma 비교 테이블 작성
4. 합성 프레임은 부모 프레임 ID로 export
5. 데이터 타입이 부족하면 타입부터 수정
6. CSS 비교 테이블 작성 - Desktop/Mobile 값 모두 확인
7. 동작하는 섹션과 비교 - 문제 진단 시 필수
