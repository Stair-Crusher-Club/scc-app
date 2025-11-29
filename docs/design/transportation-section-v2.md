# BbucleRoadRouteSectionDto 설계

## 개요
동선정보 섹션을 위한 별도 DTO. 여러 동선(탭)을 포함하며, 각 동선은 텍스트 설명 이미지 + interactive 지도 이미지로 구성.

---

## 1. API Spec (api-spec.yaml)

```yaml
# 동선정보 섹션 전체
BbucleRoadRouteSectionDto:
  type: object
  properties:
    title:
      type: string
      description: 섹션 제목 (예: "고척스카이돔 동선정보")
    routes:
      type: array
      items:
        $ref: '#/components/schemas/BbucleRoadRouteDto'
  required:
    - title
    - routes

# 개별 동선 (탭 하나)
BbucleRoadRouteDto:
  type: object
  properties:
    id:
      type: string
    tabLabel:
      type: string
      description: 탭에 표시될 텍스트 (예: "지하철 - 구일역")
    tabIconType:
      $ref: '#/components/schemas/BbucleRoadRouteIconTypeDto'
    descriptionImageUrl:
      type: string
      description: 텍스트 설명 이미지 (통짜 이미지)
    interactiveImage:
      $ref: '#/components/schemas/BbucleRoadInteractiveImageDto'
  required:
    - id
    - tabLabel
    - tabIconType
    - descriptionImageUrl
    - interactiveImage

# 탭 아이콘 타입
BbucleRoadRouteIconTypeDto:
  type: string
  enum:
    - SUBWAY
    - TAXI
    - CAR
    - BUS

# Interactive 이미지 (clickable polygon 포함)
BbucleRoadInteractiveImageDto:
  type: object
  properties:
    url:
      type: string
    clickableRegions:
      type: array
      items:
        $ref: '#/components/schemas/BbucleRoadClickableRegionDto'
  required:
    - url

# Polygon 좌표점 (상대좌표 0-1 비율)
BbucleRoadPolygonPointDto:
  type: object
  properties:
    x:
      type: number
      description: X 좌표 (0-1 비율)
    y:
      type: number
      description: Y 좌표 (0-1 비율)
  required:
    - x
    - y

# Clickable 영역
BbucleRoadClickableRegionDto:
  type: object
  properties:
    id:
      type: string
    polygon:
      type: array
      items:
        $ref: '#/components/schemas/BbucleRoadPolygonPointDto'
    modalImageUrls:
      type: array
      items:
        type: string
  required:
    - id
    - polygon
    - modalImageUrls
```

---

## 2. 컴포넌트 구조

```
web/screens/BbucleRoadScreen/
├── sections/
│   └── RouteSection/
│       ├── index.tsx                  # RouteSection 메인
│       ├── RouteTabs.tsx              # 탭 UI
│       └── RouteContent.tsx           # 개별 동선 내용
├── components/
│   ├── InteractiveImage.tsx           # 이미지 + polygon overlay
│   └── RegionDetailModal.tsx          # 클릭 시 모달
```

---

## 3. 예시 데이터

```json
{
  "title": "고척스카이돔 동선정보",
  "routes": [
    {
      "id": "guil-station",
      "tabLabel": "지하철 - 구일역",
      "tabIconType": "SUBWAY",
      "descriptionImageUrl": "https://example.com/guil-description.png",
      "interactiveImage": {
        "url": "https://example.com/guil-map.png",
        "clickableRegions": [
          {
            "id": "slope-1",
            "polygon": [
              { "x": 0.18, "y": 0.33 },
              { "x": 0.28, "y": 0.33 },
              { "x": 0.28, "y": 0.42 },
              { "x": 0.18, "y": 0.42 }
            ],
            "modalImageUrls": ["https://example.com/slope-1.jpg"]
          }
        ]
      }
    },
    {
      "id": "gaebong-station",
      "tabLabel": "지하철 - 개봉역",
      "tabIconType": "SUBWAY",
      "descriptionImageUrl": "https://example.com/gaebong-description.png",
      "interactiveImage": {
        "url": "https://example.com/gaebong-map.png",
        "clickableRegions": []
      }
    },
    {
      "id": "taxi",
      "tabLabel": "장애인 콜택시",
      "tabIconType": "TAXI",
      "descriptionImageUrl": "https://example.com/taxi-description.png",
      "interactiveImage": {
        "url": "https://example.com/taxi-map.png",
        "clickableRegions": []
      }
    }
  ]
}
```

---

## 4. 결정 사항

| 항목 | 결정 |
|------|------|
| 좌표 방식 | 상대좌표 (0-1 비율) |
| 다중 이미지 표시 | 캐러셀 (swipe) |
| 텍스트 설명 | 통짜 이미지 (descriptionImageUrl) |

---

## 5. 구현 순서

1. `api-spec.yaml`에 새 스키마 추가
2. `yarn openapi-generator` 실행
3. `RouteSection` 컴포넌트 구현 (탭 + 콘텐츠)
4. `InteractiveImage.tsx` 컴포넌트 구현
5. `RegionDetailModal.tsx` 구현
6. `BbucleRoadScreen`에서 새 섹션 연결
