import type { GetBbucleRoadPageResponseDto, BbucleRoadRouteDto, BbucleRoadInteractiveImageDto } from '@/generated-sources/openapi';

/**
 * 근처 장소 개별 데이터 타입
 */
export interface NearbyPlaceData {
  id: string;
  /** 접근레벨 (0~5) */
  accessLevel: number;
  /** 장소명 */
  name: string;
  /** 주소 */
  address: string;
  /** 영업시간 */
  businessHours: string;
  /** 접근성 태그들 (예: "경사로있음", "1층") */
  tags: string[];
  /** 이미지 URL 3개 */
  imageUrls: string[];
}

/**
 * 근처 장소 섹션 데이터 타입
 */
export interface NearbyPlacesSectionData {
  /** 타이틀 첫째 줄 (검정색) */
  titleLine1: string;
  /** 타이틀 둘째 줄 (파란색) */
  titleLine2: string;
  mapImageUrl: string;
  /** 모바일용 지도 이미지 URL */
  mobileMapImageUrl?: string;
  /** 장소 목록 (3개) */
  places: NearbyPlaceData[];
  naverListUrl?: string;
  morePlacesUrl?: string;
}

/**
 * 매표정보 섹션 데이터 타입
 */
export interface TicketInfoSectionData {
  /** 타이틀 첫째 줄 (검정색) */
  titleLine1: string;
  /** 타이틀 둘째 줄 (파란색) */
  titleLine2: string;
  descriptionHtml?: string;
  imageUrl: string;
  tips?: string[];
}

/**
 * 시야정보 섹션 데이터 타입
 */
export interface SeatViewSectionData {
  /** 타이틀 첫째 줄 (검정색) */
  titleLine1: string;
  /** 타이틀 둘째 줄 (파란색) */
  titleLine2: string;
  descriptionHtmls?: string[];
  interactiveImage?: BbucleRoadInteractiveImageDto;
  /** 모바일용 정적 이미지 URL (클릭 영역 없음) */
  mobileImageUrl?: string;
}

/**
 * 방문후기 섹션 데이터 타입
 */
export interface ReviewSectionData {
  /** 타이틀 첫째 줄 (검정색) */
  titleLine1: string;
  /** 타이틀 둘째 줄 (파란색) */
  titleLine2: string;
  /** 후기 HTML 목록 (좌우 번갈아 배치됨) */
  descriptionHtmls: string[];
  /** 조사단 정보 */
  investigatorInfo?: {
    /** 조사단 이름 (예: "고척스카이돔 조사단") */
    title: string;
    /** 조사단 멤버 (예: "(한은혜, 오준서, ...)") */
    members: string;
  };
}

/**
 * CTA 푸터 섹션 데이터 타입
 * 타이틀과 버튼 텍스트는 고정, URL만 가변
 */
export interface CTAFooterSectionData {
  buttonUrl: string;
}

/**
 * 한눈에보기 섹션 데이터 타입
 */
export interface OverviewSectionData {
  /** 타이틀 첫째 줄 (검정색) */
  titleLine1: string;
  /** 타이틀 둘째 줄 (파란색) */
  titleLine2: string;
  mapImageUrl: string;
}

/**
 * 확장된 Route 데이터 타입 (API 타입 + descriptionHtml)
 */
export type ExtendedRouteDto = BbucleRoadRouteDto & {
  descriptionHtml?: string;
};

/**
 * 확장된 Route Section 데이터 타입
 */
export interface ExtendedRouteSectionData {
  /** 타이틀 첫째 줄 (검정색) */
  titleLine1: string;
  /** 타이틀 둘째 줄 (파란색) */
  titleLine2: string;
  routes: ExtendedRouteDto[];
}

/**
 * 확장된 뿌클로드 데이터 타입 (API 타입 + 추가 필드)
 * Omit으로 routeSection을 제거하고 확장된 타입으로 재정의
 */
export interface BbucleRoadData extends Omit<GetBbucleRoadPageResponseDto, 'routeSection' | 'summaryItems'> {
  routeSection?: ExtendedRouteSectionData | null;
  nearbyPlacesSection?: NearbyPlacesSectionData | null;
  /** 최종 업데이트 텍스트 (예: "최종 업데이트 2025.12.05") */
  lastUpdatedDate?: string;
  /** 휠체어 사용자의 한마디 (HTML 형식) */
  wheelchairUserCommentHtml?: string;
  /** 헤더 배경 이미지 URL */
  headerBackgroundImageUrl?: string;
  overviewSection?: OverviewSectionData | null;
  ticketInfoSection?: TicketInfoSectionData | null;
  seatViewSection?: SeatViewSectionData | null;
  reviewSection?: ReviewSectionData | null;
  ctaFooterSection?: CTAFooterSectionData | null;
  /** 플로팅 헤더 타이틀 */
  floatingHeaderTitle?: string;
  /** 좋아요 수 */
  likeCount?: number;
}

/**
 * ID별 하드코딩 데이터
 * API spec과 동일한 형태로 관리
 */
export const BBUCLE_ROAD_DATA: Record<string, BbucleRoadData> = {
  'gocheok-skydome': {
  "id": "gocheok-skydome",
  "title": "휠체어로 고척 어때?",
  "titleImageUrl": "https://scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com/20251204094524_BB2F52447BBD4666.png",
  "headerBackgroundImageUrl": "https://scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com/20251205015702_871B3E8C8194426B.png",
  "lastUpdatedDate": "최종 업데이트 2025.12.05",
  "wheelchairUserCommentHtml": "<div style=\"max-width:507px\"><span style=\"font-size: 15px;\"><b>구일역 2번 출구 엘리베이터 > 3루 매표소 방향</br>이동</b> 추천합니다! 고척돔 주변 지형에 경사지대가 많아 <b>경기장 이동에는 어려움 있을 수 있지만, 경기장 내에서의 이동은 수월했습니다.</b></span></div>",
  "sections": [],
  "routeSection": {
    "titleLine1": "고척스카이돔",
    "titleLine2": "대중교통 및 주차장 동선",
    "routes": [
      {
        "id": "route-1764393670990",
        "tabLabel": "지하철 - 구일역",
        "tabIconType": "SUBWAY",
        "descriptionImageUrl": "",
        "descriptionHtml": "<div style=\"font-family: Pretendard, sans-serif;\">\n  <div style=\"display: flex; gap: 6px; align-items: center; margin-bottom: 8px;\">\n    <span style=\"font-size: 1.375em; font-weight: 700; color: #000; line-height: 32px;\">1호선 구일역</span>\n    <span style=\"font-size: 1em; color: #767884; letter-spacing: -0.32px; line-height: 1.625em;\">(도보 8분)</span>\n  </div>\n  <ul style=\"margin: 0; padding-left: 24px; font-size: 1em; color: #16181C; line-height: 1.625em;\">\n    <li>구일역 2번 출구 쪽 엘리베이터 이용</li>\n    <li>고척스카이돔 방향으로 직진</li>\n    <li><span style=\"font-weight: 700; color: #E52123;\">경사로 1의</span> 갈림길 중 본인에게 편안한 길을 택해서 이동\n      <ul style=\"list-style-type: disc; margin: 0; padding-left: 24px;\">\n        <li>가파른 오르막이나, 짧은 거리 이동</li>\n        <li><b>(추천)장애인 경사로(나무데크)를 통해 안전하게 이동</b></li>\n        <li>나무데크 옆 아스팔트 인도, 가파른 내리막</li>\n      </ul>\n    </li>\n    <li><span style=\"font-weight: 700; color: #E52123;\">경사로 2의</span> <b>갈림길 중 하나를 택해</b> 3루 매표소로 이동\n      <ul style=\"list-style-type: disc; margin: 0; padding-left: 24px;\">\n        <li>가파른 내리막이나, 비교적 짧은 거리 이동</li>\n        <li>완만하게 연결된 육교를 건너, 엘리베이터 이용</li>\n      </ul>\n    </li>\n  </ul>\n  <div style=\"background-color: #F7F8FA; border-radius: 12px; padding: 16px 20px; margin-top: 20px;\">\n    <p style=\"font-size: 1em; font-weight: 700; color: #0E64D3; line-height: 1.5em; align-self: stretch; margin: 0 0 6px 0;\">이미 다녀온 휠체어 사용자의 후기🦽</p>\n    <ul style=\"margin: 0; padding-left: 24px; font-size: 1em; color: #24262B; line-height: 1.625em;\">\n      <li>개봉역에서도 이동이 가능한데, 수동휠체어로 20분 넘게 걸리고, 인도가 잘 정비되지 않은 골목을 지나와야 해요. (대신 좀 덜 붐벼요)</li>\n      <li>자신의 상황과 선호에 따라서 이용하길 추천해요!</li>\n    </ul>\n  </div>\n</div>",
        "interactiveImage": {
          "url": "https://scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com/20251207035424_00B896BC6F734985.png",
          "clickableRegions": [
            {
              "id": "region-1764398015189",
              "polygon": [
                {
                  "x": 0.034782608695652174,
                  "y": 0.6442557544757034
                },
                {
                  "x": 0.03130434782608696,
                  "y": 0.9686206308610401
                },
                {
                  "x": 0.37217391304347824,
                  "y": 0.9708576300085252
                },
                {
                  "x": 0.37043478260869567,
                  "y": 0.6397817561807332
                }
              ],
              "modalImageUrls": [
                "https://scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com/20251207035519_E27E383C33B64B20.png"
              ]
            },
            {
              "id": "region-1764397994649",
              "polygon": [
                {
                  "x": 0.03304347826086956,
                  "y": 0.29080988917306055
                },
                {
                  "x": 0.029565217391304348,
                  "y": 0.6039897698209719
                },
                {
                  "x": 0.37043478260869567,
                  "y": 0.6107007672634271
                },
                {
                  "x": 0.36869565217391304,
                  "y": 0.2796248934356351
                }
              ],
              "modalImageUrls": [
                "https://scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com/20251207035458_4032FBC9626F40AA.png"
              ]
            },
            {
              "id": "region-1764398040867",
              "polygon": [
                {
                  "x": 0.6504347826086957,
                  "y": 0.43174083546462066
                },
                {
                  "x": 0.6504347826086957,
                  "y": 0.7538687127024724
                },
                {
                  "x": 0.9895652173913043,
                  "y": 0.7471577152600171
                },
                {
                  "x": 0.9843478260869565,
                  "y": 0.42726683716965047
                }
              ],
              "modalImageUrls": [
                "https://scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com/20251207035537_9D84D2CD5F7442BE.png"
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
        "descriptionHtml": "<div style=\"font-family: Pretendard, sans-serif;\">\n  <div style=\"display: flex; gap: 6px; align-items: center; margin-bottom: 8px;\">\n    <span style=\"font-size: 1.375em; font-weight: 700; color: #000; line-height: 32px;\">1호선 개봉역</span>\n    <span style=\"font-size: 1em; color: #767884; letter-spacing: -0.32px; line-height: 1.625em;\">(전동휠체어 15분, 수동휠체어 25분)</span>\n  </div>\n  <ul style=\"margin: 0; padding-left: 24px; font-size: 1em; color: #24262B; line-height: 1.625em;\">\n    <li>개봉역 2번 출구 엘리베이터 이용</li>\n    <li>메가커피 방향으로 큰길이 나올때까지 직진</li>\n    <li>큰길에서 경기장 방향으로 길따라서 직진</li>\n    <li>3루 매표소에서 현장수령 등 진행</li>\n  </ul>\n  <div style=\"background-color: #F7F8FA; border-radius: 12px; padding: 16px 20px; margin-top: 20px;\">\n    <p style=\"font-size: 1em; font-weight: 700; color: #0E64D3; line-height: 1.5em; margin: 0 0 6px 0;\">이미 다녀온 휠체어 사용자의 후기🦽</p>\n    <ul style=\"margin: 0; padding-left: 24px; font-size: 1em; color: #24262B; line-height: 1.625em;\">\n      <li>개봉역은 수동휠체어로 20분 넘게 걸리고, 인도가 잘 정비되지 않은 골목을 지나와야 해요. (대신 좀 덜 붐벼요)</li>\n      <li>자신의 상황과 선호에 따라서 이용하길 추천해요!</li>\n    </ul>\n  </div>\n</div>",
        "interactiveImage": {
          "url": "https://scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com/20251207035554_953F41BEF3954A6B.png",
          "clickableRegions": [
            {
              "id": "region-1764401440645",
              "polygon": [
                {
                  "x": 0.11826086956521739,
                  "y": 0.6509667519181586
                },
                {
                  "x": 0.11826086956521739,
                  "y": 0.9775686274509805
                },
                {
                  "x": 0.4591304347826087,
                  "y": 0.9798056265984655
                },
                {
                  "x": 0.4539130434782609,
                  "y": 0.6554407502131288
                }
              ],
              "modalImageUrls": [
                "https://scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com/20251207035638_F0FFB9A2CB5042E2.png"
              ]
            },
            {
              "id": "region-1764401419616",
              "polygon": [
                {
                  "x": 0.01217391304347826,
                  "y": 0.07382097186700767
                },
                {
                  "x": 0.008695652173913044,
                  "y": 0.4116078431372549
                },
                {
                  "x": 0.34956521739130436,
                  "y": 0.40713384484228476
                },
                {
                  "x": 0.34956521739130436,
                  "y": 0.07605797101449276
                }
              ],
              "modalImageUrls": [
                "https://scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com/20251207035618_240BE65C0A1741E7.png"
              ]
            },
            {
              "id": "region-1764401832173",
              "polygon": [
                {
                  "x": 0.5791304347826087,
                  "y": 0.6241227621483376
                },
                {
                  "x": 0.5756521739130435,
                  "y": 0.9551986359761296
                },
                {
                  "x": 0.92,
                  "y": 0.9574356351236147
                },
                {
                  "x": 0.9182608695652174,
                  "y": 0.6285967604433078
                }
              ],
              "modalImageUrls": [
                "https://scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com/20251208140014_66608E35D463429D.png"
              ]
            }
          ]
        }
      },
      {
        "id": "route-1764846301837",
        "tabLabel": "장애인 콜택시",
        "tabIconType": "TAXI",
        "descriptionImageUrl": "",
        "descriptionHtml": "<div style=\"font-family: Pretendard, sans-serif;\">\n  <div style=\"display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px;\">\n    <div style=\"display: flex; gap: 6px; align-items: center;\">\n      <div style=\"background-color: #0E64D3; color: #fff; width: 1.625em; height: 1.625em; border-radius: 100px; display: flex; align-items: center; justify-content: center; font-size: 1.125em; font-weight: 500;\">1</div>\n      <span style=\"font-size: 1.375em; font-weight: 700; color: #000; line-height: 2em;\">서울아트책보고</span>\n    </div>\n    <ul style=\"margin: 0; padding-left: 24px; font-size: 1em; color: #16181C; line-height: 1.625em;\">\n      <li>서울 구로구 경인로 430</li>\n    </ul>\n  </div>\n  <div style=\"display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px;\">\n    <div style=\"display: flex; gap: 6px; align-items: center;\">\n      <div style=\"background-color: #0E64D3; color: #fff; width: 26px; height: 27px; border-radius: 100px; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 500;\">2</div>\n      <span style=\"font-size: 1.375em; font-weight: 700; color: #000; line-height: 32px;\">구로창의아트홀</span>\n    </div>\n    <ul style=\"margin: 0; padding-left: 24px; font-size: 1em; color: #16181C; line-height: 1.625em;\">\n      <li>서울 구로구 경인로 416</li>\n    </ul>\n  </div>\n  <div style=\"background-color: #F7F8FA; border-radius: 12px; padding: 16px 20px;\">\n    <p style=\"font-size: 1em; font-weight: 700; color: #0E64D3; line-height: 1.5em; margin: 0 0 6px 0;\">이미 다녀온 휠체어 사용자의 한마디🦽</p>\n    <ul style=\"margin: 0; padding-left: 24px; font-size: 1em; color: #24262B; line-height: 1.625em;\">\n      <li>서울아트책보고 입구 앞 하차를 추천해요.</li>\n      <li><span style=\"font-weight: 700;\">구로창의아트홀</span>은 훨씬 한적해서, 좀 더 안전하게 승하차 할 수 있어요.</li>\n      <li>경기 당일에는 혼잡할 수 있으니, 장애인 콜택시를 더 여유있게 부르는 걸 추천해요</li>\n    </ul>\n  </div>\n</div>",
        "interactiveImage": {
          "url": "https://scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com/20251207035735_96EB2B61126F4711.png",
          "clickableRegions": [
            {
              "id": "region-1764848039050",
              "polygon": [
                {
                  "x": 0.4852173913043478,
                  "y": 0.026843989769820973
                },
                {
                  "x": 0.48,
                  "y": 0.35120886615515773
                },
                {
                  "x": 0.8226086956521739,
                  "y": 0.3534458653026428
                },
                {
                  "x": 0.8295652173913044,
                  "y": 0.002236999147485081
                }
              ],
              "modalImageUrls": [
                "https://scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com/20251207035837_B7B93A1805444980.png"
              ]
            },
            {
              "id": "region-1764848056588",
              "polygon": [
                {
                  "x": 0.09739130434782609,
                  "y": 0.3937118499573743
                },
                {
                  "x": 0.09913043478260869,
                  "y": 0.7270247229326514
                },
                {
                  "x": 0.44,
                  "y": 0.7203137254901961
                },
                {
                  "x": 0.4365217391304348,
                  "y": 0.3914748508098892
                }
              ],
              "modalImageUrls": [
                "https://scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com/20251207035900_92DBFD14783946B6.png"
              ]
            }
          ]
        }
      },
      {
        "id": "route-1764846424807",
        "tabLabel": "자차",
        "tabIconType": "CAR",
        "descriptionImageUrl": "",
        "descriptionHtml": "<div style=\"font-family: Pretendard, sans-serif;\">\n  <div style=\"display: flex; flex-direction: column; gap: 4px; margin-bottom: 20px;\">\n    <span style=\"font-size: 1.375em; font-weight: 700; color: #000; line-height: 2em;\">고척스카이돔 2 지하주차장</span>\n    <ul style=\"margin: 0; padding-left: 24px; font-size: 1em; color: #16181C; line-height: 1.625em;\">\n      <li>장애인 등록차량 이동 시 주차장 사용이 가능합니다.</li>\n      <li>고척 스카이돔 지하 1층 장애인 주차구역 이용 (17자리 있음)</li>\n      <li>단, 콘서트에 따라 주차 안내가 다를 수 있으니, <b>공식 티켓판매처안내를 확인해주세요!</b></li>\n    </ul>\n  </div>\n  <div style=\"background-color: #F7F8FA; border-radius: 12px; padding: 16px 20px;\">\n    <p style=\"font-size: 1em; font-weight: 700; color: #0E64D3; line-height: 1.5em; margin: 0 0 6px 0;\">이미 다녀온 휠체어 사용자의 후기🦽</p>\n    <p style=\"margin: 0; font-size: 1em; color: #24262B; line-height: 1.625em;\">고척스카이돔 지하주차장 가는 상세한 방법이 궁금하다면 영상으로 확인할 수 있어요. <a target=\"_blank\" href=\"https://youtube.com\">영상보기</a>\n    </p>\n  </div>\n</div>\n<style>\n    a:visited {\n        color: #24262B; /* Example: blue color */\n        text-decoration: none; /* Optional: remove underline */\n    }\n</style>",
        "interactiveImage": {
          "url": "https://scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com/20251208073118_2408D2235BCD4C82.png",
          "clickableRegions": []
        }
      },
      {
        "id": "route-1764846434933",
        "tabLabel": "버스",
        "tabIconType": "BUS",
        "descriptionImageUrl": "",
        "descriptionHtml": "<div style=\"font-family: Pretendard, sans-serif;\">\n  <div style=\"display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px;\">\n    <span style=\"font-size: 1.375em; font-weight: 600; color: #000; line-height: 2em;\">동양미래대학, 구로성심병원(중) 정류장</span>\n    <div style=\"display: flex; flex-direction: column; align-items: flex-start; gap: 4px; align-self: stretch;\">\n      <div style=\"display: flex; align-items: flex-start; gap: 8px; align-self: stretch; line-height: 1.625rem\">\n        <span style=\"color: #34A853; font-weight: 700;\">초록버스(지선)</span>\n        <span style=\"flex: 1 0 0; font-weight: 400;\">5626번, 5712번, 6713번, 6515번, 6511번, 6647번, 6640A번</span>\n      </div>\n      <div style=\"display: flex; align-items: flex-start; gap: 8px; align-self: stretch; line-height: 1.625rem\">\n        <span style=\"color: #4285F4; font-weight: 700;\">파란버스(간선)</span>\n        <span style=\"flex: 1 0 0; font-weight: 400;\">600번, 662번, 660번, 160번, N16번</span>\n      </div>\n    </div>\n  </div>\n  <div style=\"background-color: #F7F8FA; border-radius: 12px; padding: 16px 20px;\">\n    <p style=\"font-size: 1em; font-weight: 700; color: #0E64D3; line-height: 1.5em; margin: 0 0 6px 0;\">참고해주세요🦽</p>\n    <p style=\"margin: 0; font-size: 1em; color: #24262B; line-height: 1.625em; font-weight: 400\">위 라인 저상버스 포함해 운영 중이나 일부 차량은 저상버스가 아니므로 확인이 필요해요</p>\n  </div>\n</div>",
        "interactiveImage": {
          "url": "https://scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com/20251208073127_8D80EFAD510048D4.png",
          "clickableRegions": []
        }
      }
    ]
  },
  "nearbyPlacesSection": {
    "titleLine1": "고척스카이돔",
    "titleLine2": "근처 맛집 정보",
    "mapImageUrl": "https://scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com/20251208073509_54D57C6141664DBE.png",
    "places": [
      {
        "id": "place-1",
        "accessLevel": 1,
        "name": "서울아트책보고",
        "address": "서울 구로구 경인로 430 고척스카이돔 지하1층",
        "businessHours": "평일(화-금) | 10:00 - 19:00, 주말/공휴일 | 10:00 - 20:00",
        "tags": [
          "지하 1층",
          "경사로없음"
        ],
        "imageUrls": [
          "https://scc-prod-accessibility-thumbnails.s3.ap-northeast-2.amazonaws.com/thumbnail_20251120013456_2A9624E2F0104000_b.webp",
          "https://scc-prod-accessibility-thumbnails.s3.ap-northeast-2.amazonaws.com/thumbnail_20251120013456_A419A89F9EE94809.webp"
        ]
      },
      {
        "id": "place-2",
        "accessLevel": 0,
        "name": "닥터로빈 고척점",
        "address": "구로구 경인로46길 51 (주)귀뚜라미에너지 복합건물 지상 1층",
        "businessHours": "매일 | 8:00 ~ 21:00",
        "tags": [
          "1층"
        ],
        "imageUrls": [
          "https://scc-prod-accessibility-thumbnails.s3.ap-northeast-2.amazonaws.com/thumbnail_20251018015801_5F93B4222F1547D1.webp",
          "https://scc-prod-accessibility-thumbnails.s3.ap-northeast-2.amazonaws.com/thumbnail_20251018015801_CE5D992A03424639_b.webp"
        ]
      },
      {
        "id": "place-3",
        "accessLevel": 2,
        "name": "샤브향 구로점",
        "address": "서울 구로구 중앙로 13",
        "businessHours": "매일 | 11:00 ~ 21:00 (라스트오더 20:00)",
        "tags": [
          "1층",
          "경사로없음"
        ],
        "imageUrls": [
          "https://scc-prod-accessibility-thumbnails.s3.ap-northeast-2.amazonaws.com/thumbnail_20251120022742_F9C1512174224B55.webp",
          "https://scc-prod-accessibility-thumbnails.s3.ap-northeast-2.amazonaws.com/thumbnail_20251120022742_4E597486312741E1.webp",
          "https://scc-prod-accessibility-thumbnails.s3.ap-northeast-2.amazonaws.com/thumbnail_20251120022742_AFB6DA9B7CFE4186.webp"
        ]
      }
    ],
    "naverListUrl": "https://naver.me/5YSWYw6R",
    "morePlacesUrl": "https://link.staircrusher.club/ns539uk",
    "mobileMapImageUrl": "https://scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com/20251208074355_862135F501BD47DE.png"
  },
  "ticketInfoSection": {
    "titleLine1": "고척스카이돔",
    "titleLine2": "매표 및 입장동선",
    "descriptionHtml": "<div style=\"font-family: Pretendard, sans-serif;\">\n  <div style=\"display: flex; flex-direction: column; gap: 4px; margin-bottom: 20px;\">\n    <div style=\"background-color: #0C76F7; color: #fff; font-size: 0.9375em; font-weight: 500; padding: 2px 10px; border-radius: 50px; width: fit-content; line-height: 22px;\">매표</div>\n    <div style=\"display: flex; gap: 6px; align-items: center;\">\n      <span style=\"font-size: 1.375em; font-weight: 700; color: #000; line-height: 32px;\">3루 매표소</span>\n      <span style=\"font-size: 1em; font-weight: 600; color: #0E64D3; letter-spacing: -0.32px; line-height: 1.625em;\">(장애인 우대창구)</span>\n    </div>\n    <ul style=\"margin: 0; padding-left: 24px; font-size: 1em; color: #16181C; line-height: 1.625em;\">\n      <li>실물티켓 수령시 가장 접근성이 좋은 매표소</li>\n    </ul>\n  </div>\n  <div style=\"background-color: #fff; border-radius: 12px; padding: 16px 20px;\">\n    <p style=\"font-size: 0.9375em; font-weight: 700; color: #0E64D3; line-height: 1.625em; margin: 0 0 6px 0;\">콘서트/공연 입장 참고사항</p>\n    <p style=\"font-size: 1em; color: #16181C; line-height: 1.625em; font-weight: 400; margin: 0;\">콘서트에 따라 휠체어석 동선 안내가 다를 수 있으니, 전화 예매시 티켓수령 위치와 현장에서의 안내를 잘 확인해주세요!</p>\n  </div>\n</div>",
    "imageUrl": "https://scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com/20251209013426_0D2B0706643948AA.png",
    "tips": []
  },
  "seatViewSection": {
    "titleLine1": "고척스카이돔",
    "titleLine2": "휠체어석 위치 및 시야 확인",
    "descriptionHtmls": [
      "<div style=\"font-family: Pretendard, sans-serif; display: flex; flex-direction: column; align-items: flex-start; gap: 12px; flex: 1 0 0;\">\n  <div style=\"display: flex; flex-direction: column; gap: 8px;\">\n    <div style=\"border: 1px solid #D8D8DF; color: #0E64D3; font-size: 0.8125em; font-weight: 500; padding: 5px 13px; display: flex; justify-content: center; align-items: center; border-radius: 50px; width: fit-content; line-height: 18px;\">입장</div>\n    <span style=\"font-size: 1.375em; font-weight: 700; color: #000; line-height: 32px;\">주출입구</span>\n  </div>\n  <ul style=\"margin: 0; padding-left: 24px; font-size: 1em; font-weight: 400; color: #16181C; line-height: 1.625em;\">\n    <li>T01·T02(출입구 B), T06·T07(출입구 D) 추천</li>\n    <li>출입구 B, D 돔 내부에서 연결되어 있음</li>\n  </ul>\n  <div style=\"background-color: #F7F8FA; border-radius: 12px; padding: 12px 16px; align-self: stretch\">\n    <p style=\"font-size: 0.9375em; font-weight: 700; color: #0E64D3; line-height: 22px; margin: 0 0 12px 0;\">참고사항</p>\n    <p style=\"font-size: 0.9375em; color: #24262B; line-height: 1.6em; margin: 0;\">콘서트에 따라 이용 가능한 출입구가 다를 수 있으니,<br>현장 스태프에게 꼭 확인하고 안내받는 것을 추천합니다.</p>\n  </div>\n</div>",
      "<div style=\"font-family: Pretendard, sans-serif; display: flex; flex-direction: column; align-items: flex-start; gap: 12px; flex: 1 0 0;\">\n  <div style=\"display: flex; flex-direction: column; gap: 8px;\">\n    <div style=\"border: 1px solid #D8D8DF; color: #0E64D3; font-size: 0.8125em; font-weight: 500; padding: 5px 13px; display: flex; justify-content: center; align-items: center; border-radius: 50px; width: fit-content; line-height: 18px;\">좌석</div>\n    <span style=\"font-size: 1.375em; font-weight: 700; color: #000; line-height: 32px;\">휠체어석 위치 및 시야</span>\n  </div>\n  <ul style=\"margin: 0; padding-left: 24px; font-size: 1em; font-weight: 400; color: #16181C; line-height: 1.625em;\">\n    <li>T01·T02 구역 뒤쪽 통로에 휠체어석</li>\n    <li>T06·T07 구역 뒤쪽 통로에 휠체어석</li>\n    <li>좌석 앞 시야가 넓은 편이며, 동행인 1인 좌석 있음</li>\n  </ul>\n</div>"
    ],
    "interactiveImage": {
      "url": "https://scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com/20251208073500_4E940490BED14B0A.png",
      "clickableRegions": [
        {
          "id": "region-1764840941176",
          "polygon": [
            {
              "x": 0.030392156862745098,
              "y": 0.04133545310015898
            },
            {
              "x": 0.029411764705882353,
              "y": 0.4260731319554849
            },
            {
              "x": 0.43137254901960786,
              "y": 0.42289348171701113
            },
            {
              "x": 0.4303921568627451,
              "y": 0.0397456279809221
            }
          ],
          "modalImageUrls": [
            "https://scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com/20251207040007_0D229B6FE0D64218.png"
          ]
        },
        {
          "id": "region-1764840960476",
          "polygon": [
            {
              "x": 0.5705882352941176,
              "y": 0.04292527821939587
            },
            {
              "x": 0.5705882352941176,
              "y": 0.424483306836248
            },
            {
              "x": 0.9735294117647059,
              "y": 0.424483306836248
            },
            {
              "x": 0.9725490196078431,
              "y": 0.08744038155802862
            },
            {
              "x": 0.942156862745098,
              "y": 0.0492845786963434
            },
            {
              "x": 0.884313725490196,
              "y": 0.04133545310015898
            }
          ],
          "modalImageUrls": [
            "https://scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com/20251207040029_E1CFDB12FCC44C5B.png"
          ]
        }
      ]
    },
    "mobileImageUrl": "https://scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com/20251208074349_FCCB4DB379C447DF.png"
  },
  "reviewSection": {
    "titleLine1": "고척스카이돔",
    "titleLine2": "휠체어 이용자의 후기",
    "descriptionHtmls": [
      "<div style=\"font-family: Pretendard, sans-serif; font-size: 1em; color: #24262B; line-height: 1.6875em;\"><p style=\"margin: 0 0 8px 0;\"><span style=\"font-weight: 700;\">구일역 2번 출구 엘리베이터 > 3루 매표소 방향 이동</span> 추천합니다! 고척스카이돔 주변 지형에 경사지대가 많아 경기장 이동에는 어려움 있을 수 있어요. 수동휠체어 혼자 갈 때에는 주의가 필요해요. 경기장 내에서의 이동은 수월했습니다.</p><p style=\"margin: 0;\">*경사가 불안하신 분들은 콜택시, 자차 등을 이용하는 걸 추천해요! 아니면 개봉역을 통한 이동도 가능한데, 도보 15분이에요. 대체로 평지이긴 해요. 전동휠체어면 무리 없을 것 같습니다.</p></div>",
      "<div style=\"font-family: Pretendard, sans-serif; font-size: 1em; color: #24262B; line-height: 1.6875em;\"><p style=\"margin: 0;\">휠체어석 안내 정보가 충분하지 않아서 헷갈리거든요 ㅠㅠ 구일역에서 이동이 할 때 <span style=\"font-weight: 700;\">나무데크가 아닌 오른쪽 아스팔트 인도로 이동도 가능해요.</span> 3루 매표소 가는 숏컷인데 내리막이 심해서 조심!!!</p></div>",
      "<div style=\"font-family: Pretendard, sans-serif; font-size: 1em; color: #24262B; line-height: 1.6875em; font-weight: 700;\"><p style=\"margin: 0;\">장애인콜택시 하차 할 때는 서울아트책보고 쪽이 편한 듯? 고척 바로 앞쪽은 사람도 많고 위험~~</p><p style=\"margin: 0;\">좀 가까이는 아트책보고가 좋고, 구로창의아트센터 쪽으로 아예 널널한 곳도 좋음</p></div>",
      "<div style=\"font-family: Pretendard, sans-serif; font-size: 1em; color: #24262B; line-height: 1.6875em;\"><p style=\"margin: 0;\"><span style=\"font-weight: 700;\">1루, 3루 휠체어석 시야가 모두 탁 트여서 경기가 정말 잘보였습니다🙌</span> 휠체어석 안내표지도 크게 잘 되어 있다고 생각했습니다. 또 장애인 화장실도 4개나 있어요. 쾌적해서 이용에 편리합니다.</p></div>",
      "<div style=\"font-family: Pretendard, sans-serif; font-size: 1em; color: #24262B; line-height: 1.6875em;\"><p style=\"margin: 0;\"><span style=\"font-weight: 700;\">2층 편의점은 턱없어 휠체어 접근가능</span>하고, 직원에게 직접 물건을 말하면 꺼내줬음.</p><p style=\"margin: 0;\">편리한 편. 내부 음식점, 간식은 현장 상황에 따라 유연하게 운영 중이라고 함 (크림새우 추천)</p></div>"
    ],
    "investigatorInfo": {
      "title": "고척스카이돔 조사단",
      "members": "(한은혜, 오준서, 백은하, 박수빈, 이대호, 임지선)"
    }
  },
  "ctaFooterSection": {
    "buttonUrl": "https://forms.staircrusher.club/contents-alarm"
  },
  "overviewSection": {
    "titleLine1": "고척스카이돔 근처 정보",
    "titleLine2": "한눈에 보기",
    "mapImageUrl": "https://scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com/20251205015639_09108C7BCC314AD2.png"
  },
  "floatingHeaderTitle": "휠체어로 고척 어때?",
  "likeCount": 126
},
};

/**
 * 빈 데이터 템플릿 (새 페이지 생성용)
 */
export const EMPTY_BBUCLE_ROAD_DATA: BbucleRoadData = {
  id: '',
  title: '',
  titleImageUrl: '',
  headerBackgroundImageUrl: '',
  lastUpdatedDate: '',
  wheelchairUserCommentHtml: '',
  sections: [],
  routeSection: null,
  nearbyPlacesSection: null,
  overviewSection: null,
  ticketInfoSection: null,
  seatViewSection: null,
  reviewSection: null,
  ctaFooterSection: null,
  floatingHeaderTitle: '',
  likeCount: 0,
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
