import type { GetBbucleRoadPageResponseDto, BbucleRoadRouteDto } from '@/generated-sources/openapi';

/**
 * 근처 장소 섹션 데이터 타입
 */
export interface NearbyPlacesSectionData {
  title: string;
  mapImageUrl: string;
  listImageUrl: string;
  naverListUrl?: string;
  morePlacesUrl?: string;
}

/**
 * 확장된 Route 데이터 타입 (API 타입 + descriptionHtml)
 */
export type ExtendedRouteDto = BbucleRoadRouteDto & {
  descriptionHtml?: string;
};

/**
 * 확장된 뿌클로드 데이터 타입 (API 타입 + 추가 필드)
 */
export interface BbucleRoadData extends GetBbucleRoadPageResponseDto {
  nearbyPlacesSection?: NearbyPlacesSectionData | null;
  summaryTitle?: string;
  summaryTitleColor?: string;
  summaryBackgroundImageUrl?: string;
}

/**
 * ID별 하드코딩 데이터
 * API spec과 동일한 형태로 관리
 */
export const BBUCLE_ROAD_DATA: Record<string, BbucleRoadData> = {
  'gocheok-skydome': {
  "id": "gocheok-skydome",
  "title": "",
  "titleImageUrl": "https://scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com/20251129062436_77FB8C07B532496A.png",
  "summaryItems": [
    "시야 OK, 약 40석",
    "지하철에서 올 때 주의!",
    "엘리베이터 이용 동선 체크!"
  ],
  "sections": [],
  "routeSection": {
    "title": "고척스카이돔 동선정보",
    "routes": [
      {
        "id": "route-1764393670990",
        "tabLabel": "지하철 - 구일역",
        "tabIconType": "SUBWAY",
        "descriptionImageUrl": "",
        "descriptionHtml": "<div style=\"font-family: Pretendard, sans-serif;\">\n  <div style=\"display: flex; gap: 6px; align-items: center; margin-bottom: 8px;\">\n    <span style=\"font-size: 22px; font-weight: 700; color: #000; line-height: 32px;\">1호선 구일역</span>\n    <span style=\"font-size: 16px; color: #767884; letter-spacing: -0.32px; line-height: 26px;\">(도보 8분)</span>\n  </div>\n  <ul style=\"margin: 0; padding-left: 24px; font-size: 16px; color: #16181C; line-height: 26px;\">\n    <li>구일역 2번 출구(엘리베이터) 탑승</li>\n    <li>고척스카이돔 방향으로 직진</li>\n    <li><span style=\"font-weight: 700; color: #E52123;\">경사로 갈림길 1</span>에서 원하는 경사로를 통해 위로 이동\n      <ul style=\"list-style-type: disc; margin: 0; padding-left: 24px;\">\n        <li>가파른 오르막</li>\n        <li>장애인 경사로</li>\n      </ul>\n    </li>\n    <li><span style=\"font-weight: 700; color: #E52123;\">경사로 갈림길 2</span>에서 원하는 경사로를 통해 3루 매표소로 이동\n      <ul style=\"list-style-type: disc; margin: 0; padding-left: 24px;\">\n        <li>가파른 내리막</li>\n        <li>외야-엘리베이터 연결 육교</li>\n      </ul>\n    </li>\n  </ul>\n  <div style=\"background-color: #F7F8FA; border-radius: 12px; padding: 16px 20px; margin-top: 20px;\">\n    <p style=\"font-size: 16px; font-weight: 700; color: #0E64D3; line-height: 24px; margin: 0 0 6px 0;\">접근성 팁!</p>\n    <ul style=\"margin: 0; padding-left: 24px; font-size: 16px; color: #24262B; line-height: 26px;\">\n      <li>개봉역에서도 고척돔 접근이 가능한데, 도보가 15분이고 인도가 잘 정비되지 않은 골목을 지나와야 해요.</li>\n      <li>자신의 상황에 따라서 체크해보시길 추천해요!</li>\n    </ul>\n  </div>\n</div>",
        "interactiveImage": {
          "url": "https://scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com/20251129062550_B19C35CDC0FE45E9.png",
          "clickableRegions": [
            {
              "id": "region-1764397994649",
              "polygon": [
                {
                  "x": 0.10602678571428571,
                  "y": 0.28572413340336134
                },
                {
                  "x": 0.10267857142857142,
                  "y": 0.558483237044818
                },
                {
                  "x": 0.375,
                  "y": 0.5541765143557422
                },
                {
                  "x": 0.37611607142857145,
                  "y": 0.2885952818627451
                }
              ],
              "modalImageUrls": [
                "https://scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com/20251129063312_5E2006C24D704962.png"
              ]
            },
            {
              "id": "region-1764398015189",
              "polygon": [
                {
                  "x": 0.10491071428571429,
                  "y": 0.604421612394958
                },
                {
                  "x": 0.10379464285714286,
                  "y": 0.8771807160364146
                },
                {
                  "x": 0.38058035714285715,
                  "y": 0.8757451418067227
                },
                {
                  "x": 0.38058035714285715,
                  "y": 0.6029860381652661
                }
              ],
              "modalImageUrls": [
                "https://scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com/20251129063325_BA1E343B03B74AE6.png"
              ]
            },
            {
              "id": "region-1764398040867",
              "polygon": [
                {
                  "x": 0.6540178571428571,
                  "y": 0.3374048056722689
                },
                {
                  "x": 0.65625,
                  "y": 0.6130350577731092
                },
                {
                  "x": 0.9274553571428571,
                  "y": 0.6173417804621848
                },
                {
                  "x": 0.9296875,
                  "y": 0.3374048056722689
                }
              ],
              "modalImageUrls": [
                "https://scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com/20251129063359_1DDBF44D58D14464.png"
              ]
            }
          ]
        }
      },
      {
        "id": "route-1764400982753",
        "tabLabel": "지하철 - 개봉역",
        "tabIconType": "SUBWAY",
        "descriptionImageUrl": "",
        "descriptionHtml": "<div style=\"font-family: Pretendard, sans-serif;\">\n  <div style=\"display: flex; gap: 6px; align-items: center; margin-bottom: 8px;\">\n    <span style=\"font-size: 22px; font-weight: 700; color: #000; line-height: 32px;\">1호선 개봉역</span>\n    <span style=\"font-size: 16px; color: #767884; letter-spacing: -0.32px; line-height: 26px;\">(도보 15분)</span>\n  </div>\n  <ul style=\"margin: 0; padding-left: 24px; font-size: 16px; color: #24262B; line-height: 26px;\">\n    <li>개봉역 2번 출구(엘리베이터) 탑승</li>\n    <li>메가커피 방향으로 큰길이 나올때까지 직진</li>\n    <li>큰길에서 경기장 방향으로 길따라서 직진</li>\n    <li>3루 매표소에서 매표 진행</li>\n  </ul>\n  <div style=\"background-color: #F7F8FA; border-radius: 12px; padding: 16px 20px; margin-top: 20px;\">\n    <p style=\"font-size: 18px; font-weight: 700; color: #0E64D3; line-height: 26px; letter-spacing: -0.36px; margin: 0 0 6px 0;\">접근성 팁!</p>\n    <ul style=\"margin: 0; padding-left: 24px; font-size: 16px; color: #24262B; line-height: 26px;\">\n      <li>개봉역에서도 고척돔 접근이 가능한데, 도보가 15분이고 인도가 잘 정비되지 않은 골목을 지나와야 해요.</li>\n      <li>자신의 상황에 따라서 체크해보시길 추천해요!</li>\n    </ul>\n  </div>\n</div>",
        "interactiveImage": {
          "url": "https://scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com/20251129072342_D4266AE618A74BFA.png",
          "clickableRegions": [
            {
              "id": "region-1764401419616",
              "polygon": [
                {
                  "x": 0.031201248049921998,
                  "y": 0.17458015967697532
                },
                {
                  "x": 0.028081123244929798,
                  "y": 0.4555137499617632
                },
                {
                  "x": 0.3042121684867395,
                  "y": 0.4555137499617632
                },
                {
                  "x": 0.30265210608424337,
                  "y": 0.18060016518307792
                }
              ],
              "modalImageUrls": [
                "https://scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com/20251129073026_DC97AB44736C4D2B.png"
              ]
            },
            {
              "id": "region-1764401440645",
              "polygon": [
                {
                  "x": 0.36349453978159124,
                  "y": 0.13645345813832555
                },
                {
                  "x": 0.36505460218408736,
                  "y": 0.41538037992107923
                },
                {
                  "x": 0.6380655226209049,
                  "y": 0.4173870484231134
                },
                {
                  "x": 0.6380655226209049,
                  "y": 0.14247346364442814
                }
              ],
              "modalImageUrls": [
                "https://scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com/20251129073039_17550028698F4971.png"
              ]
            },
            {
              "id": "region-1764401832173",
              "polygon": [
                {
                  "x": 0.11856474258970359,
                  "y": 0.6862806276956961
                },
                {
                  "x": 0.11700468018720749,
                  "y": 0.9692208864825181
                },
                {
                  "x": 0.3993759750390016,
                  "y": 0.9632008809764155
                },
                {
                  "x": 0.39469578783151327,
                  "y": 0.6902939646997645
                }
              ],
              "modalImageUrls": [
                "https://scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com/20251129073718_A91A6D2B3FF84F8C.png"
              ]
            }
          ]
        }
      }
    ]
  },
  "nearbyPlacesSection": {
    "title": "고척스카이돔 근처 맛집 정보",
    "mapImageUrl": "https://scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com/20251130052102_DE22CB472F484409.png",
    "listImageUrl": "https://scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com/20251130052115_7FA097A994D54CB8.png",
    "naverListUrl": "https://map.naver.com",
    "morePlacesUrl": "https://link.staircrusher.club/ns539uk"
  },
  "summaryTitle": "고척 스카이돔, 휠체어석 {n}줄 요약",
  "summaryTitleColor": "#FFFFFF",
  "summaryBackgroundImageUrl": "https://scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com/20251130085809_410F0D1A2B024668.png"
},
};

/**
 * 빈 데이터 템플릿 (새 페이지 생성용)
 */
export const EMPTY_BBUCLE_ROAD_DATA: BbucleRoadData = {
  id: '',
  title: '',
  titleImageUrl: '',
  summaryItems: [],
  sections: [],
  routeSection: null,
  nearbyPlacesSection: null,
};

/**
 * Config에서 데이터 조회
 * @param bbucleRoadId - 조회할 ID
 * @returns 데이터 또는 undefined
 */
export function getBbucleRoadConfig(
  bbucleRoadId: string,
): BbucleRoadData | undefined {
  return BBUCLE_ROAD_DATA[bbucleRoadId];
}

/**
 * 새 빈 데이터 생성
 * @param bbucleRoadId - 새 페이지의 ID
 * @returns 빈 데이터 템플릿 (ID만 설정됨)
 */
export function createEmptyBbucleRoadData(
  bbucleRoadId: string,
): BbucleRoadData {
  return {
    ...EMPTY_BBUCLE_ROAD_DATA,
    id: bbucleRoadId,
  };
}
