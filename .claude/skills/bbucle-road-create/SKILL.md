---
name: bbucle-road-create
description: 새로운 뿌클로드 페이지를 추가합니다. Figma 디자인 분석, 데이터 추가, 브라우저 렌더링 검증을 포함합니다.
---

# 뿌클로드 새 페이지 추가

## 입력 정보

1. **Figma URL** (필수) - 디자인 명세 (node-id 포함)
2. **페이지 ID** (선택) - kebab-case (예: ticketlink-live-arena)
   - 미입력시 Figma 디자인에서 추론

---

## 워크플로우

### Phase 1: 디자인 분석

1. **Figma MCP로 디자인 분석**
   ```
   - get_screenshot: 전체 페이지 스크린샷
   - get_design_context: 각 섹션별 상세 스타일 (nodeId별로 호출)
   - get_metadata: 구조 파악
   ```

2. **기존 데이터 구조 파악**
   - `web/screens/BbucleRoadScreen/config/bbucleRoadData.ts` 읽기
   - 기존 페이지(KSPO DOME, 고척스카이돔 등) 구조 참고

3. **변경 범위 판단**
   - ✅ 데이터만 변경: `bbucleRoadData.ts` 수정
   - ⚠️ 코드 변경 필요: 새 레이아웃/섹션/컴포넌트 추가 시
     - `BbucleRoadScreen/sections/` 컴포넌트 수정
     - 타입 정의 수정
     - 새 섹션 컴포넌트 생성

---

### Phase 2: 데이터 구조 설계

**필수 섹션:**
- `id`: 페이지 고유 ID (kebab-case)
- `title`: 페이지 제목
- `titleImageUrl`, `headerBackgroundImageUrl`: 이미지 (placeholder 가능)
- `wheelchairUserCommentHtml`: 휠체어 사용자 한마디
- `routeSection`: 동선정보 (지하철, 콜택시, 자차, 버스 등)
- `ticketInfoSection`: 매표 및 입장동선
- `seatViewSection`: 좌석 시야
- `nearbyPlacesSection`: 근처 맛집
- `reviewSection`: 후기
- `ctaFooterSection`: CTA 버튼
- `overviewSection`: 한눈에 보기

---

### Phase 3: 데이터 추가

`web/screens/BbucleRoadScreen/config/bbucleRoadData.ts`에 새 항목 추가:

```typescript
'page-id': {
  "id": "page-id",
  "title": "휠체어로 ??? 어때?",
  // ... 전체 데이터 구조
}
```

---

### Phase 4: 디자인 검증 (반복) ⚠️ 가장 중요

#### 4-0. Figma 스크린샷 획득 (시각적 비교용)
```
# 각 섹션별 nodeId로 Figma 스크린샷 획득
get_screenshot(nodeId: "<섹션별 nodeId>")
```
- Claude가 **직접 이미지를 볼 수 있음**
- 브라우저 스크린샷과 **시각적 1:1 비교** 가능

**주요 섹션 nodeId 예시 (Figma URL에서 추출):**
- 교통정보: `node-id=XXX:YYY`
- 매표정보: `node-id=XXX:YYY`
- 시야정보: `node-id=XXX:YYY`
- 근처맛집: `node-id=XXX:YYY`

#### 4-1. 브라우저 스크린샷 캡처
```bash
yarn web  # Dev 서버 실행
cd web/screens/BbucleRoadScreen/scripts
npx tsx capture-screenshots.ts <pageId> desktop
```

#### 4-2. 시각적 비교 (CRITICAL - 반드시 수행!)

**Claude가 두 이미지를 직접 보고 비교:**
1. Figma 스크린샷 (`get_screenshot` 결과)
2. 브라우저 스크린샷 (Playwright 캡처 결과)

**육안으로 확인할 항목:**
- 전체 레이아웃 일치 여부
- 배지/태그 색상 (배경색, 텍스트색, 테두리)
- 박스 중첩 구조 (이중 박스, 중복 제목)
- 텍스트 스타일 (크기, 굵기, 줄간격)
- 간격 (padding, margin, gap)

#### 4-3. 섹션별 상세 스타일 비교 (필수!)

**각 섹션마다 아래 과정 수행:**

1. **Figma 스타일 추출**
   - `get_design_context`로 해당 섹션 nodeId의 상세 스타일 확인
   - 배경색, 테두리, 폰트, 패딩, 마진 등 수치 기록

2. **현재 데이터/컴포넌트 스타일 확인**
   - `bbucleRoadData.ts`의 HTML 인라인 스타일 확인
   - 해당 섹션 컴포넌트(`.tsx`) 스타일 확인

3. **1:1 비교표 작성 (MANDATORY)**
   ```markdown
   | 항목 | Figma | 현재 데이터/컴포넌트 | 일치여부 |
   |------|-------|---------------------|---------|
   | 배지 배경색 | #fff | #0C76F7 | ❌ |
   | 배지 테두리 | 1px solid #D8D8DF | 없음 | ❌ |
   | ... | ... | ... | ... |
   ```

4. **차이점 발견 시 즉시 수정**
5. **스크린샷 재캡처 후 재비교** (4-0부터 반복)

---

## ⚠️ 세부 검증 체크리스트 (CRITICAL)

### 배지/태그 스타일
| 검증 항목 | 확인 방법 |
|----------|----------|
| 배경색 | filled (파란 배경) vs outline (흰 배경+테두리) 구분 |
| 테두리 | border 유무 및 색상 (#D8D8DF 등) |
| 텍스트 색상 | 배경과 대비되는 색상 |
| border-radius | 50px (pill) vs 4px/8px/12px |
| padding | px 또는 em 단위 정확히 |

**⚠️ 흔한 실수: Figma에서 outline 스타일인데 filled로 구현**

### 박스/컨테이너 구조
| 검증 항목 | 확인 방법 |
|----------|----------|
| 중첩 구조 | 컴포넌트가 만드는 박스 + 데이터 HTML의 박스 = 이중 래핑 주의 |
| 배경색 | #F7F8FA (연회색) vs #fff (흰색) |
| border-radius | 4px vs 8px vs 12px |
| padding/gap | 정확한 수치 |

**⚠️ 흔한 실수: 컴포넌트에서 박스+제목 렌더링 + 데이터 HTML에서도 박스+제목 = 중복**

### 텍스트 스타일
| 검증 항목 | 확인 방법 |
|----------|----------|
| font-size | px 또는 em 단위 |
| font-weight | 400 (regular) vs 500 (medium) vs 700 (bold) |
| line-height | px 또는 배수 |
| color | hex 코드 정확히 |
| 줄바꿈 위치 | `<br>` 위치 Figma와 동일 |

### 아이콘
| 검증 항목 | 확인 방법 |
|----------|----------|
| 아이콘 타입 | SUBWAY, CAR, TAXI, BUS 등 |
| 크기 | width, height |
| 색상 | fill color |

---

## ⚠️ 흔히 놓치는 패턴 (MUST CHECK)

### 1. 인라인 스타일 불일치
- **문제**: 새 페이지 HTML에 다른 스타일 적용
- **해결**: 기존 페이지(KSPO DOME, 고척스카이돔)의 동일 요소 스타일 복사 후 수정

### 2. 컴포넌트 래핑 중복
- **문제**: 컴포넌트가 박스/제목 렌더링 + 데이터 HTML도 박스/제목 포함
- **해결**:
  - 컴포넌트 코드 확인 (`sections/*.tsx`)
  - 컴포넌트가 래핑하는 요소와 데이터 HTML 중복 제거
  - 데이터 HTML은 **본문만** 제공

### 3. 배지 스타일 (outline vs filled)
- **문제**: Figma는 흰배경+테두리인데 파란배경으로 구현
- **해결**: Figma에서 배지의 fill/stroke 속성 확인

### 4. 기존 페이지와 패턴 불일치
- **문제**: 같은 요소인데 페이지마다 다른 스타일
- **해결**: 기존 페이지의 동일 요소 HTML 복사 후 내용만 수정

### 5. 링크 URL 검증 ⚠️ NEW
- **문제**: 기존 페이지에서 복사한 HTML의 링크가 다른 페이지/장소 것일 수 있음
- **예시**: 제보 링크가 `scc.page.link/NjHT` (KSPO DOME용)인데 TLA에도 그대로 복사됨
- **해결**:
  - 모든 `<a href="...">` 링크 URL을 Figma 디자인과 대조
  - 새 페이지에 맞는 링크로 교체 (사용자에게 확인 필요)

### 6. 컴포넌트 styled-components 스타일 검증 ⚠️ NEW
- **문제**: 섹션 컴포넌트(`.tsx`)의 styled-components 스타일이 Figma와 다를 수 있음
- **예시**: `NoticeBoxContainer`의 배경색이 `#FFF9E6` (연노랑)인데 Figma는 `#fff` + 테두리
- **해결**:
  - 데이터뿐 아니라 **컴포넌트 스타일**도 Figma와 비교
  - `get_design_context`로 Figma 스타일 추출 후 컴포넌트 스타일과 대조

### 7. HTML 내용 검증 (다른 페이지 내용 복사됨) ⚠️ NEW
- **문제**: 기존 페이지에서 HTML을 복사했을 때 **내용 자체**가 다른 페이지 것일 수 있음
- **예시**: `wheelchairUserTipHtml`이 KSPO DOME 내용("주차장 실시간 혼잡도")인데 TLA에도 그대로 복사됨
- **해결**:
  - Figma에서 **텍스트 내용** 확인 (`get_design_context` 또는 `get_screenshot`)
  - 텍스트 내용이 새 페이지에 맞는지 확인

### 8. gap/margin 정확한 수치 ⚠️ NEW
- **문제**: Figma의 `gap-8px`이 데이터에서 `gap: 4px`로 잘못 적용됨
- **해결**:
  - `get_design_context`로 정확한 gap, padding, margin 수치 확인
  - Tailwind 클래스 (`gap-[8px]`) → 인라인 스타일 (`gap: 8px`) 변환

### 9. bold/강조 텍스트 확인 ⚠️ NEW
- **문제**: Figma에서 **bold** 처리된 텍스트가 일반 텍스트로 구현됨
- **해결**:
  - `get_design_context` 결과에서 `font-weight: 700` 또는 `Bold` 폰트 확인
  - 해당 텍스트에 `<b>` 또는 `font-weight: 700` 적용

---

## 주요 파일

| 파일 | 설명 |
|------|------|
| `web/screens/BbucleRoadScreen/config/bbucleRoadData.ts` | 페이지 데이터 |
| `web/screens/BbucleRoadScreen/index.tsx` | 메인 컴포넌트 |
| `web/screens/BbucleRoadScreen/sections/*.tsx` | 섹션 컴포넌트 |
| `web/screens/BbucleRoadScreen/scripts/capture-screenshots.ts` | 스크린샷 캡처 |

---

## 최종 체크리스트

### 데이터 완성도
- [ ] 모든 필수 섹션 포함
- [ ] HTML 인라인 스타일이 **기존 페이지 패턴과 일치**
- [ ] **링크 URL**이 새 페이지에 맞는지 확인 (다른 페이지 링크 복사 주의)
- [ ] **텍스트 내용**이 새 페이지에 맞는지 확인 (다른 페이지 내용 복사 주의)

### 세부 디자인 검증
- [ ] **배지/태그**: outline vs filled, 테두리, 색상
- [ ] **박스 구조**: 컴포넌트+데이터 HTML 중첩 없음
- [ ] **텍스트**: font-size, weight, line-height, color
- [ ] **bold 처리**: Figma에서 강조된 텍스트 `<b>` 태그 적용
- [ ] **아이콘**: 타입, 크기, 색상
- [ ] **gap/padding/margin**: 정확한 px 수치 (4px vs 8px 등)

### 컴포넌트 스타일 검증
- [ ] **섹션 컴포넌트** styled-components 스타일이 Figma와 일치
- [ ] 배경색, 테두리, border-radius 확인
- [ ] 컴포넌트 수정이 필요하면 다른 페이지에 영향 없는지 확인

### 검증 프로세스
- [ ] 각 섹션별 **Figma vs 브라우저 1:1 비교표** 작성
- [ ] 차이점 **0개**가 될 때까지 반복
- [ ] 데스크톱 뷰 완전 일치
- [ ] 모바일 뷰 완전 일치

### 이미지
- [ ] 이미지 URL placeholder 표시
- [ ] 사용자에게 이미지 등록 안내

### 코드 품질
- [ ] `yarn lint` 통과
- [ ] `yarn tsc --noEmit` 통과

---

## 참고

- 기존 페이지 예시: `gocheok-skydome`, `kspo-dome`
- CLAUDE.md의 Figma Implementation Guidelines 참조

---

## Figma MCP 도구 참조

### 사용 가능한 도구 (figma-dev-mode-mcp-server)

| 도구 | 설명 | 용도 |
|------|------|------|
| `get_screenshot` | 노드의 스크린샷 이미지 반환 | **시각적 비교용** - Claude가 이미지를 직접 볼 수 있음 |
| `get_design_context` | UI 코드/스타일 컨텍스트 | 상세 스타일 수치 추출 (색상, 폰트, 패딩 등) |
| `get_metadata` | 노드 구조 메타데이터 (XML) | 컴포넌트 구조 파악 |
| `get_variable_defs` | 디자인 변수 정의 | 색상/폰트 변수 확인 |

### nodeId 추출 방법
Figma URL에서 `node-id` 파라미터 추출:
```
https://figma.com/design/xxx/yyy?node-id=1038-5703
→ nodeId: "1038:5703" (하이픈을 콜론으로 변환)
```

### 시각적 비교 워크플로우
```
1. get_screenshot(nodeId: "섹션nodeId") → Figma 이미지
2. capture-screenshots.ts 실행 → 브라우저 이미지
3. 두 이미지를 **시각적으로 직접 비교**
4. 차이점 발견 → get_design_context로 상세 스타일 확인 → 수정
5. 반복
```

**⚠️ 중요**: `get_screenshot`은 이미지를 파일로 저장하지 않음. Claude가 메모리에서 직접 확인.
