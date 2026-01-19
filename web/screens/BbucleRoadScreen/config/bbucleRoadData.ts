import type { GetBbucleRoadPageResponseDto, BbucleRoadRouteDto, BbucleRoadInteractiveImageDto, BbucleRoadClickableRegionDto } from '@/generated-sources/openapi';

/**
 * 확장된 Clickable Region 타입 (모바일 모달 이미지 지원)
 */
export type ExtendedClickableRegionDto = BbucleRoadClickableRegionDto & {
  /** 모바일용 모달 이미지 URLs */
  mobileModalImageUrls?: string[];
};

/**
 * 확장된 Interactive 이미지 타입 (모바일 URL 지원)
 */
export type ExtendedInteractiveImageDto = Omit<BbucleRoadInteractiveImageDto, 'clickableRegions'> & {
  /** 모바일용 이미지 URL (@2x) */
  mobileUrl?: string;
  /** 확장된 클릭 영역 (모바일 모달 이미지 포함) */
  clickableRegions?: ExtendedClickableRegionDto[];
};

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
  /** 두 번째 지도 이미지 URL (TLA 근처맛집처럼 2개 방면 지도가 있는 경우) */
  secondMapImageUrl?: string;
  /** 모바일용 두 번째 지도 이미지 URL */
  mobileSecondMapImageUrl?: string;
  /** 장소 목록 (3개) */
  places: NearbyPlaceData[];
  naverListUrl?: string;
  morePlacesUrl?: string;
  /** "이미 다녀온 휠체어 사용자의 후기" 팁 박스 HTML (optional, kspo-dome에만 사용) */
  wheelchairUserTipHtml?: string;
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
  /** 모바일용 이미지 URL (@2x) */
  mobileImageUrl?: string;
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
  interactiveImage?: ExtendedInteractiveImageDto;
  /** 모바일용 정적 이미지 URL (클릭 영역 없음) */
  mobileImageUrl?: string;
  /** 제보 알림 박스 (선택) */
  noticeBox?: {
    /** 알림 제목 (예: "📢 휠체어석 시야 사진 제보 받아요!") */
    title: string;
    /** 알림 설명 HTML */
    descriptionHtml: string;
  } | null;
}

/**
 * 방문후기 섹션 데이터 타입
 */
export interface ReviewSectionData {
  /** 타이틀 첫째 줄 (검정색) */
  titleLine1: string;
  /** 타이틀 둘째 줄 (파란색) */
  titleLine2: string;
  /** 후기 HTML 목록 - 데스크탑용 (좌우 번갈아 배치됨) */
  descriptionHtmls: string[];
  /** 후기 HTML 목록 - 모바일용 (줄바꿈/bold 위치가 다름) */
  descriptionHtmlsMobile?: string[];
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
  /** 모바일용 지도 이미지 URL (@2x) */
  mobileMapImageUrl?: string;
}

/**
 * 확장된 Route 데이터 타입 (API 타입 + descriptionHtml + 확장된 interactiveImage)
 */
export type ExtendedRouteDto = Omit<BbucleRoadRouteDto, 'interactiveImage'> & {
  descriptionHtml?: string;
  /** 모바일용 설명 HTML (폰트 크기, line-height 등 모바일 최적화) */
  mobileDescriptionHtml?: string;
  interactiveImage?: ExtendedInteractiveImageDto;
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
  /** 모바일용 휠체어 사용자의 한마디 (HTML 형식) */
  wheelchairUserCommentHtmlMobile?: string;
  /** 헤더 배경 이미지 URL */
  headerBackgroundImageUrl?: string;
  /** 모바일용 타이틀 이미지 URL (@2x) */
  mobileTitleImageUrl?: string;
  /** 모바일용 헤더 배경 이미지 URL (@2x) */
  mobileHeaderBackgroundImageUrl?: string;
  /** 헤더 배경 이미지 캡션 (예: "*플레이브 콘서트 사진") */
  headerImageCaption?: string;
  overviewSection?: OverviewSectionData | null;
  ticketInfoSection?: TicketInfoSectionData | null;
  seatViewSection?: SeatViewSectionData | null;
  reviewSection?: ReviewSectionData | null;
  ctaFooterSection?: CTAFooterSectionData | null;
  /** 플로팅 헤더 타이틀 */
  floatingHeaderTitle?: string;
  /** 좋아요 수 */
  likeCount?: number;
  /** OG(Open Graph) 공유 미리보기 이미지 URL */
  ogImageUrl?: string;
  /** 타이틀 이미지 너비 (데스크탑, 기본값: 487px) */
  titleImageWidth?: number;
  /** 모바일 타이틀 이미지 너비 (기본값: 280px) */
  mobileTitleImageWidth?: number;
  /** 휠체어 사용자의 한마디 라벨 (예: "휠체어 사용자의 고척돔 접근성 한마디") */
  wheelchairUserCommentLabel?: string;
  /** 모바일용 휠체어 사용자의 한마디 라벨 */
  mobileWheelchairUserCommentLabel?: string;
  /** 생성일 (정렬용, ISO 8601 형식: YYYY-MM-DD) */
  createdAt?: string;
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
  "headerImageCaption": "*플레이브 콘서트 사진",
  "ogImageUrl": "https://scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com/20260119164457_GOCHEOK_THUMBNAIL.png",
  "lastUpdatedDate": "최종 업데이트 2025.12.05",
  "wheelchairUserCommentHtml": "<div style=\"max-width:507px\"><span style=\"font-size: 15px;\"><b>구일역 2번 출구 엘리베이터 > 3루 매표소 방향</b>&nbsp;이동이 가장 숏컷이에요.<br>근데 경사가 좀 있어서, <b>수동휠체어 이동은 장콜이나 자차</b>를 더 추천해요!</span></div>",
  "wheelchairUserCommentLabel": "휠체어 사용자의 고척돔 접근성 한마디",
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
        "descriptionHtml": "<div style=\"font-family: Pretendard, sans-serif;\">\n  <div style=\"display: flex; gap: 6px; align-items: center; margin-bottom: 8px;\">\n    <span style=\"font-size: 1.375em; font-weight: 700; color: #000; line-height: 32px;\">구일역 → 고척스카이돔</span>\n    <span style=\"font-size: 0.875em; color: #767884; letter-spacing: -0.32px; line-height: 1.625em;\">(전동휠체어 8분, 수동휠체어 15분)</span>\n  </div>\n  <ul style=\"margin: 0; padding-left: 24px; font-size: 1em; color: #16181C; line-height: 1.625em;\">\n    <li>구일역 2번 출구 쪽 엘리베이터 이용</li>\n    <li>고척스카이돔 방향으로 직진</li>\n    <li><span style=\"font-weight: 700; color: #E52123;\">경사로 1의</span> 갈림길 중 본인에게 편안한 길을 택해서 이동\n      <ul style=\"list-style-type: disc; margin: 0; padding-left: 24px;\">\n        <li>가파른 오르막이나, 짧은 거리 이동</li>\n        <li><b>(추천)장애인 경사로(나무데크)를 통해 안전하게 이동</b></li>\n        <li>나무데크 옆 아스팔트 인도, 가파른 내리막</li>\n      </ul>\n    </li>\n    <li><span style=\"font-weight: 700; color: #E52123;\">경사로 2의</span> <b>갈림길 중 하나를 택해</b> 3루 매표소로 이동\n      <ul style=\"list-style-type: disc; margin: 0; padding-left: 24px;\">\n        <li>가파른 내리막이나, 비교적 짧은 거리 이동</li>\n        <li>완만하게 연결된 육교를 건너, 엘리베이터 이용</li>\n      </ul>\n    </li>\n  </ul>\n  <div style=\"background-color: #F7F8FA; border-radius: 12px; padding: 16px 20px; margin-top: 20px;\">\n    <p style=\"font-size: 1em; font-weight: 700; color: #0E64D3; line-height: 1.5em; align-self: stretch; margin: 0 0 6px 0;\">이미 다녀온 휠체어 사용자의 후기🦽</p>\n    <ul style=\"margin: 0; padding-left: 24px; font-size: 1em; color: #24262B; line-height: 1.625em;\">\n      <li>개봉역에서도 이동이 가능한데, 수동휠체어로 20분 넘게 걸리고, 인도가 잘 정비되지 않은 골목을 지나와야 해요. (대신 좀 덜 붐벼요)</li>\n      <li>자신의 상황과 선호에 따라서 이용하길 추천해요!</li>\n    </ul>\n  </div>\n</div>",
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
        "descriptionHtml": "<div style=\"font-family: Pretendard, sans-serif;\">\n  <div style=\"display: flex; gap: 6px; align-items: center; margin-bottom: 8px;\">\n    <span style=\"font-size: 1.375em; font-weight: 700; color: #000; line-height: 32px;\">개봉역 → 고척스카이돔</span>\n    <span style=\"font-size: 0.875em; color: #767884; letter-spacing: -0.32px; line-height: 1.625em;\">(전동휠체어 15분, 수동휠체어 25분)</span>\n  </div>\n  <ul style=\"margin: 0; padding-left: 24px; font-size: 1em; color: #24262B; line-height: 1.625em;\">\n    <li>개봉역 2번 출구 엘리베이터 이용</li>\n    <li>메가커피 방향으로 큰길이 나올때까지 직진</li>\n    <li>큰길에서 경기장 방향으로 길따라서 직진</li>\n    <li>3루 매표소에서 현장수령 등 진행</li>\n  </ul>\n  <div style=\"background-color: #F7F8FA; border-radius: 12px; padding: 16px 20px; margin-top: 20px;\">\n    <p style=\"font-size: 1em; font-weight: 700; color: #0E64D3; line-height: 1.5em; margin: 0 0 6px 0;\">이미 다녀온 휠체어 사용자의 후기🦽</p>\n    <ul style=\"margin: 0; padding-left: 24px; font-size: 1em; color: #24262B; line-height: 1.625em;\">\n      <li>개봉역은 수동휠체어로 20분 넘게 걸리고, 인도가 잘 정비되지 않은 골목을 지나와야 해요. (대신 좀 덜 붐벼요)</li>\n      <li>자신의 상황과 선호에 따라서 이용하길 추천해요!</li>\n    </ul>\n  </div>\n</div>",
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
        "descriptionHtml": "<div style=\"font-family: Pretendard, sans-serif;\">\n  <div style=\"display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px;\">\n    <span style=\"font-size: 1.375em; font-weight: 600; color: #000; line-height: 2em;\">동양미래대학, 구로성심병원(중) 정류장</span>\n    <div style=\"display: flex; flex-direction: column; align-items: flex-start; gap: 4px; align-self: stretch;\">\n      <div style=\"display: flex; align-items: flex-start; gap: 8px; align-self: stretch; line-height: 1.625em\">\n        <span style=\"color: #34A853; font-weight: 700;\">초록버스(지선)</span>\n        <span style=\"flex: 1 0 0; font-weight: 400;\">5626번, 5712번, 6713번, 6515번, 6511번, 6647번, 6640A번</span>\n      </div>\n      <div style=\"display: flex; align-items: flex-start; gap: 8px; align-self: stretch; line-height: 1.625em\">\n        <span style=\"color: #4285F4; font-weight: 700;\">파란버스(간선)</span>\n        <span style=\"flex: 1 0 0; font-weight: 400;\">600번, 662번, 660번, 160번, N16번</span>\n      </div>\n    </div>\n  </div>\n  <div style=\"background-color: #F7F8FA; border-radius: 12px; padding: 16px 20px;\">\n    <p style=\"font-size: 1em; font-weight: 700; color: #0E64D3; line-height: 1.5em; margin: 0 0 6px 0;\">참고해주세요🦽</p>\n    <p style=\"margin: 0; font-size: 1em; color: #24262B; line-height: 1.625em; font-weight: 400\">위 라인 저상버스 포함해 운영 중이나 일부 차량은 저상버스가 아니므로 확인이 필요해요</p>\n  </div>\n</div>",
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
    "mapImageUrl": "https://scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com/20251210043027_B9FE8E965C154E8D.png",
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
        "accessLevel": 1,
        "name": "샤브향 구로점",
        "address": "서울 구로구 중앙로 13",
        "businessHours": "매일 | 11:00 ~ 21:00 (라스트오더 20:00)",
        "tags": [
          "1층",
          "경사로있음"
        ],
        "imageUrls": [
          "https://scc-prod-accessibility-thumbnails.s3.ap-northeast-2.amazonaws.com/thumbnail_20251120022742_F9C1512174224B55.webp",
          "https://scc-prod-accessibility-thumbnails.s3.ap-northeast-2.amazonaws.com/thumbnail_20251120050829_CA99D584BF1540C2.webp",
          "https://scc-prod-accessibility-thumbnails.s3.ap-northeast-2.amazonaws.com/thumbnail_20251120022742_AFB6DA9B7CFE4186.webp"
        ]
      }
    ],
    "naverListUrl": "https://naver.me/5YSWYw6R",
    "morePlacesUrl": "https://link.staircrusher.club/ns539uk",
    "mobileMapImageUrl": "https://scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com/20251210043023_8FCEF6A5F8154BD3.png"
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
    "mapImageUrl": "https://scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com/20251210133457_3841F6BBA4DB4DD3.png"
  },
  "floatingHeaderTitle": "휠체어로 고척 어때?",
  "likeCount": 126,
  "wheelchairUserCommentHtmlMobile": "<div style=\"max-width:507px\"><span style=\"font-size: 15px;\"><b>구일역 2번 출구 엘리베이터 > 3루 매표소 방향</b><br>이동이 가장 숏컷이에요. 근데 경사가 좀 있어서,<br><b>수동휠체어 이동은 장콜이나 자차</b>를 더 추천해요!</span></div>",
  "mobileHeaderBackgroundImageUrl": "https://scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com/20251210130255_93AD412E8FE248C5.png",
  "createdAt": "2025-12-05"
},
  'kspo-dome': {
  "id": "kspo-dome",
  "title": "휠체어로 KSPO 어때?",
  "titleImageUrl": "https://scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com/20251223071246_ECA9AE7A79B9420C.png",
  "titleImageWidth": 547,
  "mobileTitleImageWidth": 300,
  "headerBackgroundImageUrl": "https://scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com/20251223071250_CFDB368904344C9F.png",
  "headerImageCaption": "*슈가 콘서트 사진",
  "ogImageUrl": "https://scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com/20260119164503_KSPO_THUMBNAIL.png",
  "lastUpdatedDate": "최종 업데이트 2025.12.22",
  "wheelchairUserCommentHtml": "<div style=\"font-family: Pretendard, sans-serif; font-size: 1em; line-height: 1.5em; max-width: 507px;\">KSPO DOME을 갈 때,<br><b>수동휠체어 타고 경사 빡센 곳을 힘들어 하신다면 P6-7</b>을 추천해요!</div>",
  "wheelchairUserCommentLabel": "휠체어 사용자의 KSPO 접근성 한마디",
  "sections": [],
  "routeSection": {
    "titleLine1": "KSPO DOME",
    "titleLine2": "대중교통 및 주차장 동선",
    "routes": [
      {
        "id": "route-kspo-subway",
        "tabLabel": "지하철",
        "tabIconType": "SUBWAY",
        "descriptionImageUrl": "",
        "descriptionHtml": "<div style=\"font-family: Pretendard, sans-serif; font-size: 1em;\"><div style=\"display: flex; flex-direction: column; gap: 0.375em; margin-bottom: 1.5em;\"><div style=\"background-color: #EBF5FF; color: #0E64D3; font-size: 0.875em; font-weight: 400; padding: 0.125em 0.3125em; border-radius: 1px; width: fit-content; line-height: 1.25em;\">전동휠체어 8분, 수동휠체어 15분</div><div style=\"display: flex; gap: 0.25em; align-items: center;\"><span style=\"font-size: 1.375em; font-weight: 700; color: #000; line-height: 2em;\">올림픽공원역</span><span style=\"font-size: 1em;\">→</span><span style=\"font-size: 1.375em; font-weight: 700; color: #000; line-height: 2em;\">KSPO DOME</span></div></div><div style=\"display: flex; flex-direction: column; gap: 0.75em; margin-bottom: 2em; color: #24262B; font-size: 1em; line-height: 1.625em;\"><p style=\"margin: 0;\"><b>➊ 올림픽공원역 3번 또는 4번 출구</b> 엘리베이터 이용</p><p style=\"margin: 0;\"><b>➋</b> KSPO DOME 방향으로 <b>직진</b></p><p style=\"margin: 0;\"><b>➌ 아치형 다리를</b> 건너 KSPO DOME 방향으로 <b>직진</b></p><p style=\"margin: 0;\"><b>➍ 티켓 및 MD 부스 구역</b> 티켓 수령하여 공연장 입구로 이동</p><p style=\"margin: 0;\"><b>➎ 휠체어 출입구</b>로 공연장 입장</p></div><div style=\"background-color: #F7F8FA; border-radius: 4px; padding: 1em;\"><p style=\"font-size: 1em; font-weight: 700; color: #0E64D3; line-height: 1.5em; margin: 0 0 0.375em 0;\">이미 다녀온 휠체어 사용자의 후기🦽</p><ul style=\"margin: 0; padding-left: 1.5em; font-size: 1em; color: #24262B; line-height: 1.625em;\"><li>전체적으로 평지이지만,<br>보도블럭이 일어난 구간들이 있어서 주의해야 해요.</li><li>4번 구간에 MD부스, 포토존들이 있어요!</li></ul></div></div>",
        "interactiveImage": {
          "url": "https://scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com/20251223125440_9DAED33D40C647EC.png",
          "clickableRegions": [
            {
              "id": "region-1766494503356",
              "polygon": [
                {
                  "x": 0.5404411764705882,
                  "y": 0.021280276816608996
                },
                {
                  "x": 0.5386029411764706,
                  "y": 0.4445213379469435
                },
                {
                  "x": 0.9779411764705882,
                  "y": 0.4516147635524798
                },
                {
                  "x": 0.9742647058823529,
                  "y": 0.014186851211072665
                }
              ],
              "modalImageUrls": [
                "https://scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com/20251223130733_4276412FB0714731.png"
              ]
            }
          ]
        }
      },
      {
        "id": "route-kspo-taxi",
        "tabLabel": "장애인 콜택시",
        "tabIconType": "TAXI",
        "descriptionImageUrl": "",
        "descriptionHtml": "<div style=\"font-family: Pretendard, sans-serif; font-size: 1em;\"><div style=\"display: flex; flex-direction: column; gap: 0.75em; margin-bottom: 2em;\"><div style=\"display: flex; gap: 0.375em; align-items: center;\"><div style=\"background-color: #0E64D3; color: #fff; width: 1.25em; height: 1.25em; border-radius: 150px; display: flex; align-items: center; justify-content: center; font-size: 1em; font-weight: 700;\">1</div><span style=\"font-size: 1.375em; font-weight: 700; color: #000; line-height: 2em;\">올림픽 공원 P5</span><span style=\"background-color: #F2F2F5; color: #585A64; font-size: 0.875em; font-weight: 500; padding: 0 0.3125em; border-radius: 4px; line-height: 1.25em;\">하차지 추천</span></div><ul style=\"margin: 0; padding-left: 1.5em; font-size: 1em; color: #24262B; line-height: 1.625em;\"><li>서울 송파구 올림픽로 424 올림픽공원 P5 주차장</li><li>KSPO DOME에서 가장 가까운 주차장</li></ul></div><div style=\"display: flex; flex-direction: column; gap: 0.75em; margin-bottom: 2em;\"><div style=\"display: flex; gap: 0.375em; align-items: center;\"><div style=\"background-color: #0E64D3; color: #fff; width: 1.25em; height: 1.25em; border-radius: 150px; display: flex; align-items: center; justify-content: center; font-size: 1em; font-weight: 700;\">2</div><span style=\"font-size: 1.375em; font-weight: 700; color: #000; line-height: 2em;\">한국체육대학교 주차장</span><span style=\"background-color: #F2F2F5; color: #585A64; font-size: 0.875em; font-weight: 500; padding: 0 0.3125em; border-radius: 4px; line-height: 1.25em;\">승차지/하차지 추천</span></div><ul style=\"margin: 0; padding-left: 1.5em; font-size: 1em; color: #24262B; line-height: 1.625em;\"><li>서울 송파구 양재대로 1239 한국체육대학교 철골주차장</li><li>KSPO DOME에서 가까운 외부 주차장</li></ul></div><div style=\"display: flex; flex-direction: column; gap: 0.75em; margin-bottom: 2em;\"><div style=\"display: flex; gap: 0.375em; align-items: center;\"><div style=\"background-color: #0E64D3; color: #fff; width: 1.25em; height: 1.25em; border-radius: 150px; display: flex; align-items: center; justify-content: center; font-size: 1em; font-weight: 700;\">3</div><span style=\"font-size: 1.375em; font-weight: 700; color: #000; line-height: 2em;\">JYP 사옥 부근</span><span style=\"background-color: #F2F2F5; color: #585A64; font-size: 0.875em; font-weight: 500; padding: 0 0.3125em; border-radius: 4px; line-height: 1.25em;\">승차지 추천</span></div><ul style=\"margin: 0; padding-left: 1.5em; font-size: 1em; color: #24262B; line-height: 1.625em;\"><li>서울 강동구 강동대로 207</li><li>건물 앞 택시 정류장</li></ul></div><div style=\"background-color: #F7F8FA; border-radius: 4px; padding: 1em;\"><p style=\"font-size: 1em; font-weight: 700; color: #0E64D3; line-height: 1.5em; margin: 0 0 0.375em 0;\">이미 다녀온 휠체어 사용자의 후기🦽</p><p style=\"margin: 0; font-size: 1em; color: #24262B; line-height: 1.625em;\">공연이 끝나고 집에 갈 때는 가능한 올림픽 공원 외부로 장콜을 부르는게 좋아요!</p></div></div>",
        "interactiveImage": {
          "url": "https://scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com/20251223125546_A0EDC319E3474529.png",
          "clickableRegions": [
            {
              "id": "region-1766494579853",
              "polygon": [
                {
                  "x": 0.034926470588235295,
                  "y": 0.04256055363321799
                },
                {
                  "x": 0.03125,
                  "y": 0.4658016147635525
                },
                {
                  "x": 0.4319852941176471,
                  "y": 0.4658016147635525
                },
                {
                  "x": 0.43014705882352944,
                  "y": 0.04256055363321799
                }
              ],
              "modalImageUrls": [
                "https://scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com/20251223125615_B4115C60E85A45B1.png"
              ]
            },
            {
              "id": "region-1766494598048",
              "polygon": [
                {
                  "x": 0.5919117647058824,
                  "y": 0.28137254901960784
                },
                {
                  "x": 0.5900735294117647,
                  "y": 0.7164359861591695
                },
                {
                  "x": 0.9889705882352942,
                  "y": 0.7093425605536332
                },
                {
                  "x": 0.9834558823529411,
                  "y": 0.276643598615917
                }
              ],
              "modalImageUrls": [
                "https://scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com/20251223125636_A2305864551D4F88.png"
              ]
            }
          ]
        }
      },
      {
        "id": "route-kspo-bus",
        "tabLabel": "버스",
        "tabIconType": "BUS",
        "descriptionImageUrl": "",
        "descriptionHtml": "<div style=\"font-family: Pretendard, sans-serif; font-size: 1em;\"><div style=\"display: flex; flex-direction: column; gap: 1.25em; margin-bottom: 2em;\"><p style=\"margin: 0;\"><span style=\"font-size: 1.375em; font-weight: 700; color: #000; line-height: 2em;\">올림픽공원역</span><span style=\"font-size: 1.125em; font-weight: 400; color: #000; line-height: 2em;\">(올림픽공원 장미광장 방면)</span></p><div style=\"display: flex; flex-direction: column; gap: 0.25em;\"><div style=\"display: flex; gap: 0.5em; align-items: flex-start; line-height: 1.625em;\"><span style=\"color: #00A005; font-weight: 700; font-size: 1em; line-height: 1.5em;\">초록버스(지선)</span><span style=\"color: #16181C; font-weight: 400;\">3216, 3412, 3413, 3414</span></div><div style=\"display: flex; gap: 0.5em; align-items: flex-start; line-height: 1.625em;\"><span style=\"color: #0E64D3; font-weight: 700; font-size: 1em; line-height: 1.5em;\">파란버스(간선)</span><span style=\"color: #16181C; font-weight: 400;\">301, 302</span></div></div></div><div style=\"background-color: #F7F8FA; border-radius: 12px; padding: 1em 1.25em;\"><p style=\"font-size: 1em; font-weight: 700; color: #0E64D3; line-height: 1.5em; margin: 0 0 0.375em 0;\">이미 다녀온 휠체어 사용자의 후기🦽</p><p style=\"margin: 0; font-size: 1em; color: #24262B; line-height: 1.625em;\">위 라인 저상버스 포함해 운영 중이나 일부 차량은 저상버스가 아니므로 확인이 필요해요!</p></div></div>",
        "interactiveImage": {
          "url": "https://scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com/20251223125647_DBCC1530A70F4843.png",
          "clickableRegions": []
        }
      },
      {
        "id": "route-kspo-car-internal",
        "tabLabel": "자차-올림픽공원 내부",
        "tabIconType": "CAR",
        "descriptionImageUrl": "",
        "descriptionHtml": "<div style=\"font-family: Pretendard, sans-serif; font-size: 1em;\"><div style=\"margin-bottom: 2em;\"><div style=\"display: flex; flex-direction: column; gap: 0.25em; margin-bottom: 1.25em;\"><span style=\"background-color: #F2F2F5; color: #585A64; font-size: 0.875em; font-weight: 500; padding: 0 0.3125em; border-radius: 4px; width: fit-content; line-height: 1.25em;\">가장 가까운 주차장</span><span style=\"font-size: 1.375em; font-weight: 700; color: #000; line-height: 2em;\">올림픽공원 P5</span></div><div style=\"display: flex; flex-direction: column; gap: 0.75em; padding-left: 0.375em; color: #24262B; line-height: 1.625em;\"><div style=\"display: flex; gap: 0.375em; align-items: flex-start;\"><div style=\"background-color: #24262B; color: #fff; min-width: 1em; height: 1em; border-radius: 150px; display: flex; align-items: center; justify-content: center; font-size: 0.875em; margin-top: 0.3125em;\">1</div><span><b>P5</b> 장애인 주차장(7석)에 차량 주차</span></div><div style=\"display: flex; gap: 0.375em; align-items: flex-start;\"><div style=\"background-color: #24262B; color: #fff; min-width: 1em; height: 1em; border-radius: 150px; display: flex; align-items: center; justify-content: center; font-size: 0.875em; margin-top: 0.3125em;\">2</div><span><b>오르막</b>을 따라서 만남의 광장 방향으로 이동</span></div><div style=\"display: flex; gap: 0.375em; align-items: flex-start;\"><div style=\"background-color: #24262B; color: #fff; min-width: 1em; height: 1em; border-radius: 150px; display: flex; align-items: center; justify-content: center; font-size: 0.875em; margin-top: 0.3125em;\">3</div><span><b>아치형 다리를</b> 건너 KSPO DOME 방향으로 <b>직진</b></span></div></div></div><div style=\"margin-bottom: 2em;\"><div style=\"margin-bottom: 1.25em;\"><span style=\"font-size: 1.375em; font-weight: 700; color: #000; line-height: 2em;\">올림픽공원 P7</span></div><div style=\"display: flex; flex-direction: column; gap: 0.75em; padding-left: 0.375em; color: #24262B; line-height: 1.625em;\"><div style=\"display: flex; gap: 0.375em; align-items: flex-start;\"><div style=\"background-color: #24262B; color: #fff; min-width: 1em; height: 1em; border-radius: 150px; display: flex; align-items: center; justify-content: center; font-size: 0.875em; margin-top: 0.3125em;\">4</div><span><b>P7</b> 장애인 주차장에 차량 주차</span></div><div style=\"display: flex; gap: 0.375em; align-items: flex-start;\"><div style=\"background-color: #24262B; color: #fff; min-width: 1em; height: 1em; border-radius: 150px; display: flex; align-items: center; justify-content: center; font-size: 0.875em; margin-top: 0.3125em;\">5</div><span><b>휠체어 전용 경사로</b>를 따라서 공연장 방향으로 이동</span></div><div style=\"display: flex; gap: 0.375em; align-items: flex-start;\"><div style=\"background-color: #24262B; color: #fff; min-width: 1em; height: 1em; border-radius: 150px; display: flex; align-items: center; justify-content: center; font-size: 0.875em; margin-top: 0.3125em;\">6</div><span><b>티켓링크 라이브 아레나를 둘러서</b> KSPO DOME으로 이동</span></div></div></div><div style=\"background-color: #F7F8FA; border-radius: 4px; padding: 1em;\"><p style=\"font-size: 1em; font-weight: 700; color: #0E64D3; line-height: 1.5em; margin: 0 0 0.375em 0;\">이미 다녀온 휠체어 사용자의 후기🦽</p><p style=\"margin: 0; font-size: 1em; color: #24262B; line-height: 1.625em;\">올림픽공원 홈페이지에서<br><b>주차장의 실시간 혼잡도</b>를 확인할 수 있어요!<br><a href=\"https://www.ksponco.or.kr/olympicpark/parkingInfo?mid=a20111000000\" target=\"_blank\" style=\"color: #0E64D3; text-decoration: underline;\">실시간 혼잡도 확인하기 ></a></p></div></div>",
        "interactiveImage": {
          "url": "https://scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com/20251223125716_BAA4E928B5FD44E9.png",
          "clickableRegions": [
            {
              "id": "region-1766494665187",
              "polygon": [
                {
                  "x": 0.6341911764705882,
                  "y": 0.02364475201845444
                },
                {
                  "x": 0.6323529411764706,
                  "y": 0.3759515570934256
                },
                {
                  "x": 0.9889705882352942,
                  "y": 0.37358708189158013
                },
                {
                  "x": 0.9871323529411765,
                  "y": 0.026009227220299885
                }
              ],
              "modalImageUrls": [
                "https://scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com/20251223125743_0C3873584526494C.png"
              ]
            },
            {
              "id": "region-1766494681605",
              "polygon": [
                {
                  "x": 0.15625,
                  "y": 0.6053056516724337
                },
                {
                  "x": 0.15808823529411764,
                  "y": 0.9576124567474048
                },
                {
                  "x": 0.5202205882352942,
                  "y": 0.9552479815455593
                },
                {
                  "x": 0.5183823529411765,
                  "y": 0.6076701268742791
                }
              ],
              "modalImageUrls": [
                "https://scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com/20251223125800_E05E5A0A263042F9.png"
              ]
            }
          ]
        }
      },
      {
        "id": "route-kspo-car-external",
        "tabLabel": "자차-올림픽공원 외부",
        "tabIconType": "CAR",
        "descriptionImageUrl": "",
        "descriptionHtml": "<div style=\"font-family: Pretendard, sans-serif; font-size: 1em;\"><div style=\"margin-bottom: 2em;\"><div style=\"margin-bottom: 1.25em;\"><span style=\"font-size: 1.375em; font-weight: 700; color: #000; line-height: 2em;\">한국체육대학교 주차장</span></div><div style=\"display: flex; flex-direction: column; gap: 0.75em; padding-left: 0.375em; color: #24262B; line-height: 1.625em;\"><div style=\"display: flex; gap: 0.375em; align-items: flex-start;\"><div style=\"background-color: #24262B; color: #fff; min-width: 1em; height: 1em; border-radius: 150px; display: flex; align-items: center; justify-content: center; font-size: 0.875em; margin-top: 0.3125em;\">1</div><span style=\"font-weight: 700;\">한국체육대학교 입구 주차장에 차량 주차</span></div><div style=\"display: flex; gap: 0.375em; align-items: flex-start;\"><div style=\"background-color: #24262B; color: #fff; min-width: 1em; height: 1em; border-radius: 150px; display: flex; align-items: center; justify-content: center; font-size: 0.875em; margin-top: 0.3125em;\">2</div><span>주차장을 나와 <b>올림픽공원역 방향</b>으로 <b>직진</b></span></div><div style=\"display: flex; gap: 0.375em; align-items: flex-start;\"><div style=\"background-color: #24262B; color: #fff; min-width: 1em; height: 1em; border-radius: 150px; display: flex; align-items: center; justify-content: center; font-size: 0.875em; margin-top: 0.3125em;\">3</div><span>KSPO DOME 방향으로 <b>직진</b></span></div><div style=\"display: flex; gap: 0.375em; align-items: flex-start;\"><div style=\"background-color: #24262B; color: #fff; min-width: 1em; height: 1em; border-radius: 150px; display: flex; align-items: center; justify-content: center; font-size: 0.875em; margin-top: 0.3125em;\">4</div><span><b>아치형 다리를</b> 건너 KSPO DOME 방향으로 <b>직진</b></span></div></div></div><div style=\"background-color: #F7F8FA; border-radius: 4px; padding: 1em;\"><p style=\"font-size: 1em; font-weight: 700; color: #0E64D3; line-height: 1.5em; margin: 0 0 0.375em 0;\">이미 다녀온 휠체어 사용자의 후기🦽</p><p style=\"margin: 0; font-size: 1em; color: #24262B; line-height: 1.625em;\">올림픽공원 내부 주차장은 공연이 끝나고 집갈 때 힘든데,<br>한체대 주차장은 집갈 때도 덜 막혀요.</p></div></div>",
        "interactiveImage": {
          "url": "https://scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com/20251223125820_1865243FE1DC4056.png",
          "clickableRegions": [
            {
              "id": "region-1766494724876",
              "polygon": [
                {
                  "x": 0.5845588235294118,
                  "y": 0.02364475201845444
                },
                {
                  "x": 0.5845588235294118,
                  "y": 0.4563437139561707
                },
                {
                  "x": 0.9834558823529411,
                  "y": 0.4563437139561707
                },
                {
                  "x": 0.9797794117647058,
                  "y": 0.009457900807381776
                }
              ],
              "modalImageUrls": [
                "https://scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com/20251223125843_2955EDEF820A41E2.png"
              ]
            }
          ]
        }
      }
    ]
  },
  "nearbyPlacesSection": {
    "titleLine1": "KSPO DOME",
    "titleLine2": "근처 맛집 정보",
    "mapImageUrl": "https://scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com/20251223071548_60D3DB395FC0451D.png",
    "places": [],
    "naverListUrl": "https://naver.me/FLev5cng",
    "morePlacesUrl": "https://link.staircrusher.club/o0o7kx",
    "wheelchairUserTipHtml": "공연이 끝나고 장콜을 기다려야 할 때는 외부에 있는 식당이나 카페를 이용하는 게 좋아요! 훨씬 덜 붐비고 차 타기도 쉬워요."
  },
  "ticketInfoSection": {
    "titleLine1": "KSPO DOME",
    "titleLine2": "매표 및 입장동선",
    "descriptionHtml": "<div style=\"font-family: Pretendard, sans-serif; font-size: 1em;\"><div style=\"display: flex; flex-direction: column; gap: 0.5em; margin-bottom: 1.25em;\"><div style=\"border: 1px solid #D8D8DF; background-color: #fff; color: #0E64D3; font-size: 0.8125em; font-weight: 500; padding: 0.25em 0.75em; border-radius: 50px; width: fit-content; line-height: 1.125em;\">매표</div><span style=\"font-size: 1.375em; font-weight: 700; color: #000; line-height: 2em;\">부스형 매표소</span><ul style=\"margin: 0; padding-left: 1.5em; font-size: 1em; color: #16181C; line-height: 1.625em; margin-top: 8px;\"><li>콘서트에 따라 다른 위치에 매표소가 운영될 수 있음</li></ul></div><div style=\"background-color: #fff; border-radius: 12px; padding: 1em 1.25em;\"><p style=\"font-size: 0.9375em; font-weight: 700; color: #0E64D3; line-height: 1.375em; margin: 0 0 0.375em 0;\">콘서트/공연 입장 참고사항</p><p style=\"font-size: 0.9375em; color: #16181C; line-height: 1.375em; margin: 0;\">티켓 현장수령이 필요하니<br>사전에 <b>매표소(현장 티켓부스) 위치를 확인</b>하세요.</p></div></div>",
    "imageUrl": "https://scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com/20251223071512_239FAF1D9CCC4734.png",
    "tips": []
  },
  "seatViewSection": {
    "titleLine1": "KSPO DOME",
    "titleLine2": "휠체어석 위치 및 시야 확인",
    "descriptionHtmls": [
      "<div style=\"font-family: Pretendard, sans-serif; font-size: 1em; display: flex; flex-direction: column; gap: 1em;\"><div style=\"display: flex; flex-direction: column; gap: 0.5em;\"><div style=\"border: 1px solid #D8D8DF; color: #0E64D3; font-size: 0.8125em; font-weight: 500; padding: 0.3125em 0.8125em; border-radius: 50px; width: fit-content; line-height: 1.125em;\">입장</div><span style=\"font-size: 1.375em; font-weight: 700; color: #000; line-height: 2em;\">주출입구</span></div><ul style=\"margin: 0; font-size: 1em; color: #16181C; line-height: 1.625em; padding-left: 1.5em;\"><li>휠체어석과 가까운 출입구 2-2 추천</li></ul><div style=\"background-color: #F7F8FA; border-radius: 12px; padding: 0.75em 1em;\"><p style=\"font-size: 0.9375em; font-weight: 700; color: #16181C; line-height: 1.375em; margin: 0 0 0.75em 0; color: #0E64D3;\">참고사항</p><p style=\"font-size: 0.9375em; color: #24262B; line-height: 1.5em; margin: 0;\">콘서트에 따라 이용 가능한 출입구가 다를 수 있으니,<br>현장 스태프에게 꼭 확인하고 안내받는 것을 추천합니다!</p></div></div>",
      "<div style=\"font-family: Pretendard, sans-serif; font-size: 1em; display: flex; flex-direction: column; gap: 1em;\"><div style=\"display: flex; flex-direction: column; gap: 0.5em;\"><div style=\"border: 1px solid #D8D8DF; color: #0E64D3; font-size: 0.8125em; font-weight: 500; padding: 0.3125em 0.8125em; border-radius: 50px; width: fit-content; line-height: 1.125em;\">좌석</div><span style=\"font-size: 1.375em; font-weight: 700; color: #000; line-height: 2em;\">휠체어석 위치 및 시야</span></div><ul style=\"margin: 0; font-size: 1em; color: #16181C; line-height: 1.625em; padding-left: 1.5em;\"><li>1층 5~11 뒷자석 통로 구역에 위치</li><li>전체를 조망하기에는 나쁘지 않지만, <b>앞사람들이 일어서면 시야가 가려짐</b></li></ul></div>"
    ],
    "interactiveImage": {
      "url": "https://scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com/20251223071525_4F491F9FF07E4C0D.png",
      "clickableRegions": [
        {
          "id": "region-1766494760503",
          "polygon": [
            {
              "x": 0.4950980392156863,
              "y": 0.025396825396825397
            },
            {
              "x": 0.4950980392156863,
              "y": 0.4492063492063492
            },
            {
              "x": 0.9813725490196078,
              "y": 0.4492063492063492
            },
            {
              "x": 0.9852941176470589,
              "y": 0.0873015873015873
            },
            {
              "x": 0.9558823529411765,
              "y": 0.009523809523809525
            }
          ],
          "modalImageUrls": [
            "https://scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com/20251223125917_9D58EABEC6834234.png",
          ],
          "mobileModalImageUrls": [
            "https://scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com/20251223154935_0375E27206EE44ED.png",
          ],
        }
      ]
    },
    // "mobileImageUrl": "https://scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com/20251223125956_80C08C5AEC314B9E.png"
  },
  "reviewSection": {
    "titleLine1": "KSPO DOME",
    "titleLine2": "휠체어 이용자의 후기",
    "descriptionHtmls": [
      "<div style=\"font-family: Pretendard, sans-serif; font-size: 1em; color: #24262B; line-height: 1.6875em;\"><p style=\"margin: 0 0 0.5em 0;\">올림픽 공원은 평지고, 차가 다니지 않아서 생각보다 <b>경기장 접근이 어렵지 않아요.</b><br>다만 공연이 많으면 굉장히 혼잡하기 때문에 주차장 이용시 여유롭게 도착하는 것을 추천합니다!<br><b>KSPO DOME 갈 때, 수동휠체어 타고 경사 빡센 곳을 힘들어 하신다면 P6-7을 추천해요!</b></p><p style=\"margin: 0; font-size: 0.875em; font-weight: 500; line-height: 1.25em; color: #0E64D3;\">- 야마하 수전동 휠체어 -</p></div>",
      "<div style=\"font-family: Pretendard, sans-serif; font-size: 1em; color: #24262B; line-height: 1.6875em;\"><p style=\"margin: 0 0 0.5em 0;\"><b>지하철</b>로 방문했는데, <b>4번출구 쪽 엘리베이터</b>로 나오면 대부분 평지였습니다.<br>오래된 공원/공연장이다 보니 <b>보도가 조금씩 깨져 있어서 살짝 주의해야 하지만</b> 이동에 큰 어려움은<br>없었습니다. 공연마다 다르겠지만, 제가 갔던 공연(데이식스)에서는 주최측에서도 휠체어석으로<br>들어가는 루트를 잘 안내해줘서 편했어요!</p><p style=\"margin: 0; font-size: 0.875em; font-weight: 500; line-height: 1.25em; color: #0E64D3;\">- 아리아 수동 휠체어 동반인 -</p></div>",
      "<div style=\"font-family: Pretendard, sans-serif; font-size: 1em; color: #24262B; line-height: 1.6875em;\"><p style=\"margin: 0 0 0.5em 0;\">데이식스 공연이 진행되는 kspo돔 근처가 <b>다 평지여서 이동하기 편했어요~~</b><br>아치다리를 건너야하긴 했지만 <b>엄청 빡센 경사는 아니라 이동하는데에 어려움은 없었어요</b>!<br>주차는 일부러 올림픽공원이 아니라 한국체육대학교 건물 주차장에 주차했는데<br>혼란스럽지 않게 나올 수 있었어요~~!</p><p style=\"margin: 0; font-size: 0.875em; font-weight: 500; line-height: 1.25em; color: #0E64D3;\">- 아리아 수동 휠체어 -</p></div>"
    ],
    "descriptionHtmlsMobile": [
      "<div style=\"font-family: Pretendard, sans-serif; font-size: 0.875em; color: #24262B; line-height: 1.375em;\"><p style=\"margin: 0;\">올림픽 공원은 평지고, 차가 다니지 않아서 생각보다 <b>경기장 접근이 어렵지 않아요.</b> 다만 공연이 많으면 굉장히 혼잡하기 때문에 주차장 이용시 여유롭게 도착하는 것을 추천합니다!<br><br></p><p style=\"margin: 0;\"><b>KSPO DOME 갈 때, 수동휠체어 타고 경사 빡센 곳을 힘들어 하신다면 P6-7을 추천해요!</b></p><p style=\"margin: 1em 0 0 0; font-size: 0.875em; font-weight: 500; line-height: 1.25em; color: #0E64D3;\">- 야마하 수전동 휠체어 -</p></div>",
      "<div style=\"font-family: Pretendard, sans-serif; font-size: 0.875em; color: #24262B; line-height: 1.375em;\"><p style=\"margin: 0;\"><b>지하철</b>로 방문했는데,<br><b>4번출구 쪽 엘리베이터</b>로 나오면 대부분 평지였습니다.<br>오래된 공원/공연장이다 보니 <b>보도가 조금씩 깨져 있어서<br>살짝 주의해야 하지만</b> 이동에 큰 어려움은 없었습니다.<br>공연마다 다르겠지만, 제가 갔던 공연(데이식스)에서는 주최측에서도 휠체어석으로 들어가는 루트를 잘 안내해줘서 편했어요!</p><p style=\"margin: 1em 0 0 0; font-size: 0.875em; font-weight: 500; line-height: 1.25em; color: #0E64D3;\">- 아리아 수동 휠체어 동반인 -</p></div>",
      "<div style=\"font-family: Pretendard, sans-serif; font-size: 0.875em; color: #24262B; line-height: 1.375em;\"><p style=\"margin: 0;\">kspo돔 근처가 <b>다 평지여서 이동하기 편했어요~~</b><br>아치다리를 건너야하긴 했지만 <b>엄청 빡센 경사는 아니라 이동하는데에 어려움은 없었어요!</b></p><p style=\"margin: 0;\">주차는 일부러 올림픽공원이 아니라 한국체육대학교 건물 주차장에 주차했는데 혼란스럽지 않게 나올 수 있었어요~~!</p><p style=\"margin: 1em 0 0 0; font-size: 0.875em; font-weight: 500; line-height: 1.25em; color: #0E64D3;\">- 아리아 수동 휠체어 -</p></div>"
    ],
    "investigatorInfo": {
      "title": "KSPO DOME 조사단",
      "members": "(박수빈, 박원, 백은하, 지수환, 주성희)"
    }
  },
  "ctaFooterSection": {
    "buttonUrl": "https://forms.staircrusher.club/contents-alarm"
  },
  "overviewSection": {
    "titleLine1": "KSPO DOME 동선 정보",
    "titleLine2": "한눈에 보기",
    "mapImageUrl": "https://scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com/20251223071430_C2B5A98BAA5C4C1C.png"
  },
  "floatingHeaderTitle": "휠체어로 KSPO 어때?",
  "likeCount": 0,
  "createdAt": "2025-12-22"
},
  'ticketlink-live-arena': {
  "id": "ticketlink-live-arena",
  "title": "휠체어로 티켓링크 라이브 아레나 어때?",
  "titleImageUrl": "https://scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com/20260116170330_tla-title-image.png",
  "titleImageWidth": 514,
  "mobileTitleImageWidth": 280,
  "headerBackgroundImageUrl": "https://scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com/20260116152333_76c3296c_tla-header-bg.png",
  "headerImageCaption": "*도영 콘서트 사진",
  "ogImageUrl": "https://scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com/20260119164502_TLA_THUMBNAIL.png",
  "lastUpdatedDate": "최종 업데이트 2026.01.09",
  "wheelchairUserCommentHtml": "<div style=\"font-family: Pretendard, sans-serif; font-size: 1em; line-height: 1.5em; max-width: 507px;\">티켓링크 라이브 아레나를 자차로 가시는 분!,<br><b>수동휠체어 사용하고, 경사 빡센곳을 힘들어하신다면 P6-7 주차장</b>을 추천해요!</div>",
  "wheelchairUserCommentLabel": "휠체어 사용자의 티켓링크 라이브 아레나 접근성 한마디",
  "mobileWheelchairUserCommentLabel": "휠체어 사용자의\n티켓링크 라이브 아레나 접근성 한마디",
  "sections": [],
  "routeSection": {
    "titleLine1": "티켓링크 라이브 아레나",
    "titleLine2": "대중교통 및 주차장 동선",
    "routes": [
      {
        "id": "route-tla-subway",
        "tabLabel": "지하철",
        "tabIconType": "SUBWAY",
        "descriptionImageUrl": "https://scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com/20260116164822_tla-route-subway.png",
        "descriptionHtml": "<div style=\"font-family: Pretendard, sans-serif; font-size: 1em;\"><div style=\"display: flex; flex-direction: column; gap: 0.375em; margin-bottom: 1.5em;\"><div style=\"background-color: #EBF5FF; color: #0E64D3; font-size: 0.875em; font-weight: 400; padding: 0.125em 0.3125em; border-radius: 1px; width: fit-content; line-height: 1.25em;\">전동휠체어 8분, 수동휠체어 15분</div><div style=\"display: flex; gap: 0.25em; align-items: center;\"><span style=\"font-size: 1.375em; font-weight: 700; color: #000; line-height: 2em;\">올림픽공원역</span><span style=\"font-size: 1em;\">→</span><span style=\"font-size: 1.375em; font-weight: 700; color: #000; line-height: 2em;\">티켓링크 라이브 아레나</span></div></div><div style=\"display: flex; flex-direction: column; gap: 0.75em; margin-bottom: 2em; color: #24262B; font-size: 1em; line-height: 1.625em;\"><p style=\"margin: 0;\"><b>➊ 올림픽공원역 3번 또는 4번 출구</b> 엘리베이터 이용</p><p style=\"margin: 0;\"><b>➋</b> 티켓링크 라이브 아레나 방향으로 <b>직진</b></p><p style=\"margin: 0;\"><b>➌ 아치형 다리를</b> 건너 티켓링크 라이브 아레나 방향으로 <b>직진</b></p><p style=\"margin: 0;\"><b>➍ 티켓 및 MD 부스 구역</b> 티켓 수령하여 공연장 입구로 이동</p><p style=\"margin: 0;\"><b>➎ 휠체어 출입구</b>로 공연장 입장</p></div><div style=\"background-color: #F7F8FA; border-radius: 4px; padding: 1em;\"><p style=\"font-size: 1em; font-weight: 700; color: #0E64D3; line-height: 1.5em; margin: 0 0 0.375em 0;\">이미 다녀온 휠체어 사용자의 후기🦽</p><ul style=\"margin: 0; padding-left: 1.5em; font-size: 1em; color: #24262B; line-height: 1.625em;\"><li>전체적으로 평지이지만,<br>보도블럭이 일어난 구간들이 있어서 주의해야 해요.</li><li>4번 구간에 MD부스, 포토존들이 있어요!</li></ul></div></div>",
        "interactiveImage": {
          "url": "https://scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com/20260116164822_tla-route-subway.png",
          "clickableRegions": [
            {
              "id": "region-tla-subway-arch-bridge",
              "polygon": [
                { "x": 0.5472, "y": 0.0216 },
                { "x": 0.9817, "y": 0.0216 },
                { "x": 0.9817, "y": 0.4412 },
                { "x": 0.5472, "y": 0.4412 }
              ],
              "modalImageUrls": [
                "https://scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com/20260116181658_tla-subway-modal-arch-bridge.png"
              ]
            }
          ]
        }
      },
      {
        "id": "route-tla-taxi",
        "tabLabel": "장애인 콜택시",
        "tabIconType": "TAXI",
        "descriptionImageUrl": "https://scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com/20260116164822_tla-route-taxi.png",
        "descriptionHtml": "<div style=\"font-family: Pretendard, sans-serif; font-size: 1em;\"><div style=\"display: flex; flex-direction: column; gap: 0.75em; margin-bottom: 2em;\"><div style=\"display: flex; gap: 0.375em; align-items: center;\"><div style=\"background-color: #0E64D3; color: #fff; width: 1.25em; height: 1.25em; border-radius: 150px; display: flex; align-items: center; justify-content: center; font-size: 1em; font-weight: 700;\">1</div><span style=\"font-size: 1.375em; font-weight: 700; color: #000; line-height: 2em;\">SK올림픽핸드볼경기장 주차장</span><span style=\"background-color: #F2F2F5; color: #585A64; font-size: 0.875em; font-weight: 500; padding: 0 0.3125em; border-radius: 4px; line-height: 1.25em;\">하차지 추천</span></div><ul style=\"margin: 0; padding-left: 1.5em; font-size: 1em; color: #24262B; line-height: 1.625em;\"><li>서울 송파구 올림픽로 424, 올림픽공원 SK올림픽핸드볼경기장 주차장 <a href=\"#\" style=\"color: #0E64D3; text-decoration: underline;\">복사</a></li><li>티켓링크 라이브 아레나 주차장 <b>입구</b> 쪽에서 하차 추천</li></ul></div><div style=\"display: flex; flex-direction: column; gap: 0.75em; margin-bottom: 2em;\"><div style=\"display: flex; gap: 0.375em; align-items: center;\"><div style=\"background-color: #0E64D3; color: #fff; width: 1.25em; height: 1.25em; border-radius: 150px; display: flex; align-items: center; justify-content: center; font-size: 1em; font-weight: 700;\">2</div><span style=\"font-size: 1.375em; font-weight: 700; color: #000; line-height: 2em;\">한국체육대학교 주차장</span><span style=\"background-color: #F2F2F5; color: #585A64; font-size: 0.875em; font-weight: 500; padding: 0 0.3125em; border-radius: 4px; line-height: 1.25em;\">승차지/하차지 추천</span></div><ul style=\"margin: 0; padding-left: 1.5em; font-size: 1em; color: #24262B; line-height: 1.625em;\"><li>서울 송파구 양재대로 1239 한국체육대학교 철골주차장 <a href=\"#\" style=\"color: #0E64D3; text-decoration: underline;\">복사</a></li><li>티켓링크 라이브 아레나에서 가까운 외부 주차장</li></ul></div><div style=\"display: flex; flex-direction: column; gap: 0.75em; margin-bottom: 2em;\"><div style=\"display: flex; gap: 0.375em; align-items: center;\"><div style=\"background-color: #0E64D3; color: #fff; width: 1.25em; height: 1.25em; border-radius: 150px; display: flex; align-items: center; justify-content: center; font-size: 1em; font-weight: 700;\">3</div><span style=\"font-size: 1.375em; font-weight: 700; color: #000; line-height: 2em;\">JYP 사옥 부근</span><span style=\"background-color: #F2F2F5; color: #585A64; font-size: 0.875em; font-weight: 500; padding: 0 0.3125em; border-radius: 4px; line-height: 1.25em;\">승차지 추천</span></div><ul style=\"margin: 0; padding-left: 1.5em; font-size: 1em; color: #24262B; line-height: 1.625em;\"><li>서울 강동구 강동대로 207 <a href=\"#\" style=\"color: #0E64D3; text-decoration: underline;\">복사</a></li><li>건물 앞 택시 정류장</li></ul></div><div style=\"background-color: #F7F8FA; border-radius: 4px; padding: 1em;\"><p style=\"font-size: 1em; font-weight: 700; color: #0E64D3; line-height: 1.5em; margin: 0 0 0.375em 0;\">이미 다녀온 휠체어 사용자의 후기🦽</p><p style=\"margin: 0; font-size: 1em; color: #24262B; line-height: 1.625em;\">공연이 끝나고 집에 갈 때는 가능한 올림픽 공원 외부로 장콜을 부르는게 좋아요!</p></div></div>",
        "mobileDescriptionHtml": "<div style=\"font-family: Pretendard, sans-serif; font-size: 15px;\"><div style=\"display: flex; flex-direction: column; gap: 12px; margin-bottom: 30px;\"><div style=\"display: flex; gap: 6px; align-items: center; flex-wrap: wrap;\"><div style=\"background-color: #0E64D3; color: #fff; width: 16px; height: 16px; border-radius: 150px; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 700;\">1</div><span style=\"font-size: 18px; font-weight: 700; color: #000; line-height: 26px; letter-spacing: -0.36px;\">SK올림픽핸드볼경기장 주차장(P6)</span><span style=\"background-color: #F2F2F5; color: #585A64; font-size: 12px; font-weight: 500; padding: 0 5px; border-radius: 4px; line-height: 16px;\">하차지 추천</span></div><ul style=\"margin: 0; padding-left: 24px; font-size: 15px; color: #24262B; line-height: 24px;\"><li>서울 송파구 올림픽로 424, 올림픽공원 SK올림픽핸드볼경기장 주차장 <a href=\"#\" style=\"color: #0E64D3; text-decoration: underline;\">복사</a></li><li>티켓링크 라이브 아레나 주차장 입구 쪽에서 하차 추천</li></ul></div><div style=\"display: flex; flex-direction: column; gap: 12px; margin-bottom: 30px;\"><div style=\"display: flex; gap: 6px; align-items: center; flex-wrap: wrap;\"><div style=\"background-color: #0E64D3; color: #fff; width: 16px; height: 16px; border-radius: 150px; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 700;\">2</div><span style=\"font-size: 18px; font-weight: 700; color: #000; line-height: 26px; letter-spacing: -0.36px;\">한국체육대학교 주차장</span><span style=\"background-color: #F2F2F5; color: #585A64; font-size: 12px; font-weight: 500; padding: 0 5px; border-radius: 4px; line-height: 16px;\">승차지/하차지 추천</span></div><ul style=\"margin: 0; padding-left: 24px; font-size: 15px; color: #24262B; line-height: 24px;\"><li>서울 송파구 양재대로 1239 한국체육대학교 철골주차장 <a href=\"#\" style=\"color: #0E64D3; text-decoration: underline;\">복사</a></li><li>티켓링크 라이브 아레나에서 가까운 외부 주차장</li></ul></div><div style=\"display: flex; flex-direction: column; gap: 12px; margin-bottom: 30px;\"><div style=\"display: flex; gap: 6px; align-items: center; flex-wrap: wrap;\"><div style=\"background-color: #0E64D3; color: #fff; width: 16px; height: 16px; border-radius: 150px; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 700;\">3</div><span style=\"font-size: 18px; font-weight: 700; color: #000; line-height: 26px; letter-spacing: -0.36px;\">JYP 사옥 부근</span><span style=\"background-color: #F2F2F5; color: #585A64; font-size: 12px; font-weight: 500; padding: 0 5px; border-radius: 4px; line-height: 16px;\">승차지 추천</span></div><ul style=\"margin: 0; padding-left: 24px; font-size: 15px; color: #24262B; line-height: 24px;\"><li>서울 강동구 강동대로 207 <a href=\"#\" style=\"color: #0E64D3; text-decoration: underline;\">복사</a></li><li>건물 앞 택시 정류장</li></ul></div><div style=\"background-color: #F7F8FA; border-radius: 4px; padding: 16px;\"><p style=\"font-size: 16px; font-weight: 700; color: #0E64D3; line-height: 24px; margin: 0 0 6px 0;\">이미 다녀온 휠체어 사용자의 후기🦽</p><p style=\"margin: 0; font-size: 16px; color: #24262B; line-height: 26px;\">공연이 끝나고 집에 갈때는 가능한 올림픽 공원 외부로 장콜을 부르는게 좋아요!</p></div></div>",
        "interactiveImage": {
          "url": "https://scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com/20260116164822_tla-route-taxi.png",
          "clickableRegions": [
            {
              "id": "region-tla-taxi-sk-handball",
              "polygon": [
                { "x": 0.0274, "y": 0.2863 },
                { "x": 0.4207, "y": 0.2863 },
                { "x": 0.4207, "y": 0.7059 },
                { "x": 0.0274, "y": 0.7059 }
              ],
              "modalImageUrls": [
                "https://scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com/20260116182647_tla-taxi-modal-olympic-p5.png"
              ]
            },
            {
              "id": "region-tla-taxi-knsu",
              "polygon": [
                { "x": 0.5793, "y": 0.2451 },
                { "x": 0.9726, "y": 0.2451 },
                { "x": 0.9726, "y": 0.6647 },
                { "x": 0.5793, "y": 0.6647 }
              ],
              "modalImageUrls": [
                "https://scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com/20260116182647_tla-taxi-modal-hantae.png"
              ]
            }
          ]
        }
      },
      {
        "id": "route-tla-parking-closest",
        "tabLabel": "자차",
        "tabIconType": "CAR",
        "descriptionImageUrl": "https://scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com/20260116164822_tla-route-car.png",
        "descriptionHtml": "<div style=\"font-family: Pretendard, sans-serif; font-size: 1em;\"><div style=\"display: flex; flex-direction: column; gap: 1.25em; margin-bottom: 2em;\"><div style=\"display: flex; flex-direction: column; gap: 0.25em;\"><div style=\"background-color: #F2F2F5; color: #585A64; font-size: 0.875em; font-weight: 500; padding: 0 0.3125em; border-radius: 4px; width: fit-content; line-height: 1.25em;\">가장 가까운 주차장</div><span style=\"font-size: 1.375em; font-weight: 700; color: #000; line-height: 2em;\">SK올림픽핸드볼경기장 주차장 (올림픽공원 P6)</span></div><div style=\"display: flex; flex-direction: column; gap: 0.75em; padding-left: 0.375em; color: #24262B; font-size: 1em; line-height: 1.625em;\"><p style=\"margin: 0;\"><b>➊ P6</b> 장애인 주차장(5석)에 차량 주차</p><p style=\"margin: 0;\"><b>➋ 오르막</b>을 따라 정면에 <b>한얼광장 방향</b>으로 이동</p><p style=\"margin: 0;\"><b>➌</b> 한얼광장에서 <b>티켓링크 라이브 아레나 방향</b>으로 이동</p><p style=\"margin: 0; font-size: 0.9375em; font-weight: 500; color: #E52123; line-height: 1.375em;\">*공연에 따라 통제 되는 경우도 있음</p></div></div><div style=\"display: flex; flex-direction: column; gap: 1.25em; margin-bottom: 2em;\"><div style=\"display: flex; flex-direction: column; gap: 0.25em;\"><span style=\"font-size: 1.375em; font-weight: 700; color: #000; line-height: 2em;\">올림픽공원 P7</span></div><div style=\"display: flex; flex-direction: column; gap: 0.75em; padding-left: 0.375em; color: #24262B; font-size: 1em; line-height: 1.625em;\"><p style=\"margin: 0;\"><b>➍ P7</b> 장애인 주차장에 차량 주차</p><p style=\"margin: 0;\"><b>➎ 휠체어 전용 경사로</b>를 따라서 공연장 방향으로 이동</p><p style=\"margin: 0;\"><b>➏</b> 경사로에서 우측의 <b>티켓링크 라이브 아레나 방향</b>으로 이동</p></div></div><div style=\"background-color: #F7F8FA; border-radius: 4px; padding: 1em; display: flex; flex-direction: column; gap: 0.375em;\"><p style=\"font-size: 1em; font-weight: 700; color: #0E64D3; line-height: 1.5em; margin: 0;\">이미 다녀온 휠체어 사용자의 후기🦽</p><p style=\"font-size: 1em; color: #24262B; line-height: 1.625em; margin: 0;\">올림픽공원 홈페이지에서 <br><b>주차장의 실시간 혼잡도</b>를 확인할 수 있어요!<br><a href=\"https://www.ksponco.or.kr/olympicpark/parkingInfo?mid=a20111000000\" style=\"color: #0E64D3; text-decoration: underline;\">실시간 혼잡도 확인하기 ></a></p></div></div>",
        "interactiveImage": {
          "url": "https://scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com/20260116164822_tla-route-car.png",
          "clickableRegions": [
            {
              "id": "region-tla-car-p7-ramp",
              "polygon": [
                { "x": 0.0213, "y": 0.0275 },
                { "x": 0.3720, "y": 0.0275 },
                { "x": 0.3720, "y": 0.3657 },
                { "x": 0.0213, "y": 0.3657 }
              ],
              "modalImageUrls": [
                "https://scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com/20260116182647_tla-car-modal-p7-ramp.png"
              ]
            },
            {
              "id": "region-tla-car-p6-ramp",
              "polygon": [
                { "x": 0.6280, "y": 0.6333 },
                { "x": 0.9787, "y": 0.6333 },
                { "x": 0.9787, "y": 0.9716 },
                { "x": 0.6280, "y": 0.9716 }
              ],
              "modalImageUrls": [
                "https://scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com/20260116182647_tla-car-modal-p5-ramp.png"
              ]
            }
          ]
        }
      },
      {
        "id": "route-tla-bus",
        "tabLabel": "버스",
        "tabIconType": "BUS",
        "descriptionImageUrl": "https://scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com/20260116164822_tla-route-bus.png",
        "descriptionHtml": "<div style=\"font-family: Pretendard, sans-serif; font-size: 1em;\"><div style=\"display: flex; flex-direction: column; gap: 1.25em; margin-bottom: 2em;\"><p style=\"margin: 0;\"><span style=\"font-size: 1.375em; font-weight: 700; color: #000; line-height: 2em;\">올림픽공원역</span><span style=\"font-size: 1.125em; font-weight: 400; color: #000; line-height: 2em;\">(올림픽공원 장미광장 방면)</span></p><div style=\"display: flex; flex-direction: column; gap: 0.25em;\"><div style=\"display: flex; gap: 0.5em; align-items: flex-start; line-height: 1.625em;\"><span style=\"color: #00A005; font-weight: 700; font-size: 1em; line-height: 1.5em;\">초록버스(지선)</span><span style=\"color: #16181C; font-weight: 400;\">3216, 3412, 3413, 3414</span></div><div style=\"display: flex; gap: 0.5em; align-items: flex-start; line-height: 1.625em;\"><span style=\"color: #0E64D3; font-weight: 700; font-size: 1em; line-height: 1.5em;\">파란버스(간선)</span><span style=\"color: #16181C; font-weight: 400;\">301, 302</span></div></div></div><div style=\"background-color: #F7F8FA; border-radius: 12px; padding: 1em 1.25em;\"><p style=\"font-size: 1em; font-weight: 700; color: #0E64D3; line-height: 1.5em; margin: 0 0 0.375em 0;\">이미 다녀온 휠체어 사용자의 후기🦽</p><p style=\"margin: 0; font-size: 1em; color: #24262B; line-height: 1.625em;\">위 라인 저상버스 포함해 운영 중이나 일부 차량은 저상버스가 아니므로 확인이 필요해요!</p></div></div>",
        "interactiveImage": {
          "url": "https://scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com/20260116164822_tla-route-bus.png",
          "clickableRegions": []
        }
      }
    ]
  },
  "ticketInfoSection": {
    "titleLine1": "티켓링크 라이브 아레나",
    "titleLine2": "매표 및 입장동선",
    "descriptionHtml": "<div style=\"font-family: Pretendard, sans-serif;\">\n  <div style=\"display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px;\">\n    <div style=\"border: 1px solid #D8D8DF; background-color: #fff; color: #0E64D3; font-size: 0.8125em; font-weight: 500; padding: 5px 13px; border-radius: 50px; width: fit-content; line-height: 18px;\">매표</div>\n    <span style=\"font-size: 1.375em; font-weight: 700; color: #000; line-height: 32px;\">부스형 매표소</span>\n    <ul style=\"margin: 0; padding-left: 24px; font-size: 1em; color: #16181C; line-height: 1.625em;\">\n      <li>콘서트에 따라 다른 위치에 매표소가 운영될 수 있음</li>\n    </ul>\n  </div>\n  <div style=\"background-color: #fff; border-radius: 12px; padding: 16px;\">\n    <p style=\"font-size: 0.9375em; font-weight: 700; color: #0E64D3; line-height: 22px; margin: 0 0 6px 0;\">콘서트/공연 입장 참고사항</p>\n    <p style=\"font-size: 0.9375em; color: #16181C; line-height: 24px; font-weight: 400; margin: 0;\">티켓 현장수령이 필요하니<br>사전에 <b>매표소(현장 티켓부스) 위치를 확인</b>하세요.</p>\n  </div>\n</div>",
    "imageUrl": "https://scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com/20260116165730_tla-ticket-info-map.png",
    "tips": []
  },
  "seatViewSection": {
    "titleLine1": "티켓링크 라이브 아레나",
    "titleLine2": "휠체어석 위치 및 시야 확인",
    "descriptionHtmls": [
      "<div style=\"font-family: Pretendard, sans-serif; width: 100%;\">\n  <div style=\"display: flex; flex-direction: column; gap: var(--chip-gap, 8px); margin-bottom: 16px;\">\n    <div style=\"border: 1px solid #D8D8DF; color: #0E64D3; font-size: var(--chip-font-size, 13px); font-weight: 500; padding: 4px 12px; display: flex; justify-content: center; align-items: center; border-radius: 50px; width: fit-content; line-height: var(--chip-line-height, 18px);\">입장</div>\n    <span style=\"font-size: var(--title-font-size, 22px); font-weight: 700; color: #000; line-height: var(--title-line-height, 32px);\">주출입구</span>\n  </div>\n  <ul style=\"margin: 0 0 20px 0; padding-left: 24px; font-size: var(--list-font-size, 16px); font-weight: 400; color: #16181C; line-height: var(--list-line-height, 26px);\">\n    <li>휠체어석과 가까운 출입구 2-3추천</li>\n  </ul>\n  <div style=\"background-color: #F7F8FA; border-radius: var(--box-border-radius, 12px); padding: var(--box-padding, 16px); display: flex; flex-direction: column; gap: 6px;\">\n    <p style=\"font-size: 15px; font-weight: 700; color: #0E64D3; line-height: 22px; margin: 0;\">참고사항</p>\n    <p style=\"font-size: 15px; color: #24262B; line-height: 24px; margin: 0;\">콘서트에 따라 이용 가능한 출입구가 다를 수 있으니,<br>현장 스태프에게 꼭 확인하고 안내받는 것을 추천합니다!</p>\n  </div>\n</div>",
      "<div style=\"font-family: Pretendard, sans-serif; width: 100%;\">\n  <div style=\"display: flex; flex-direction: column; gap: var(--chip-gap, 8px); margin-bottom: 16px;\">\n    <div style=\"border: 1px solid #D8D8DF; color: #0E64D3; font-size: var(--chip-font-size, 13px); font-weight: 500; padding: 4px 12px; display: flex; justify-content: center; align-items: center; border-radius: 50px; width: fit-content; line-height: var(--chip-line-height, 18px);\">좌석</div>\n    <span style=\"font-size: var(--title-font-size, 22px); font-weight: 700; color: #000; line-height: var(--title-line-height, 32px);\">휠체어석 위치</span>\n  </div>\n  <ul style=\"margin: 0; padding-left: 24px; font-size: var(--list-font-size, 16px); font-weight: 400; color: #16181C; line-height: var(--list-line-height, 26px);\">\n    <li>2층 24~26 / 32~34 / 39~41 / 47~49 통로 구역에 위치</li>\n  </ul>\n</div>"
    ],
    "interactiveImage": {
      "url": "https://scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com/20260116165730_tla-seat-view-map.png",
      "clickableRegions": []
    },
    "noticeBox": {
      "title": "📢 휠체어석 시야 사진 제보 받아요!",
      "descriptionHtml": "<span style=\"font-size: 15px; color: #24262B; line-height: 24px;\">티켓링크 라이브 아레나 휠체어석 시야 사진을 <a href=\"https://tally.so/r/5B9q0E\" target=\"_blank\" style=\"color: #0E64D3; font-weight: 700; text-decoration: underline;\">여기로</a> 제보해주세요. 최초 제보자께는 소정의 리워드를 전달드릴게요.</span>"
    }
  },
  "nearbyPlacesSection": {
    "titleLine1": "티켓링크 라이브 아레나",
    "titleLine2": "근처 맛집 정보",
    "mapImageUrl": "https://scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com/20260116175702_tla-nearby-dunchon.png",
    "secondMapImageUrl": "https://scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com/20260116175702_tla-nearby-bangi.png",
    "places": [],
    "naverListUrl": "https://naver.me/FLev5cng",
    "morePlacesUrl": "https://link.staircrusher.club/o0o7kx",
    "wheelchairUserTipHtml": "<p style=\"font-size: 1em; color: #24262B; line-height: 1.625em; margin: 0;\">공연이 끝나고 장콜을 기다려야할때는 <b>외부에 있는 식당이나 카페를 이용</b>하는게 좋아요! 훨씬 덜 붐비고 차 타기도 쉬워요.</p>"
  },
  "reviewSection": {
    "titleLine1": "티켓링크 라이브 아레나",
    "titleLine2": "휠체어 이용자의 후기",
    "descriptionHtmls": [
      "<div style=\"font-family: Pretendard, sans-serif; font-size: 1em; color: #24262B; line-height: 1.6875em;\"><p style=\"margin: 0 0 0.5em 0;\">올림픽 공원은 평지고, 차가 다니지 않아서 생각보다 <b>경기장 접근이 어렵지 않아요.</b><br>다만 공연이 많으면 굉장히 혼잡하기 때문에 주차장 이용시 여유롭게 도착하는 것을 추천합니다!<br><b>티켓링크 라이브 아레나 갈 때, 수동휠체어 타고 경사 빡센곳을 힘들어하신다면 P6-7을 추천해요!</b></p><p style=\"margin: 0; font-size: 0.875em; font-weight: 500; line-height: 1.25em; color: #0E64D3;\">- 야마하 수전동 휠체어 -</p></div>",
      "<div style=\"font-family: Pretendard, sans-serif; font-size: 1em; color: #24262B; line-height: 1.6875em;\"><p style=\"margin: 0 0 0.5em 0;\"><b>지하철</b>로 방문했는데, <b>4번출구 쪽 엘리베이터</b>로 나오면 대부분 평지였습니다.<br>오래된 공원/공연장이다 보니 <b>보도가 조금씩 깨져 있어서 살짝 주의해야 하지만</b> 이동에 큰 어려움은<br>없었습니다.</p><p style=\"margin: 0; font-size: 0.875em; font-weight: 500; line-height: 1.25em; color: #0E64D3;\">- 아리아 수동 휠체어 동반인 -</p></div>",
      "<div style=\"font-family: Pretendard, sans-serif; font-size: 1em; color: #24262B; line-height: 1.6875em;\"><p style=\"margin: 0 0 0.5em 0;\">엔플라잉 공연이 진행되는 티켓링크 라이브 아레나 근처가 <b>다 평지여서 이동하기 편했어요~~</b><br>아치다리를 건너야하긴 했지만 <b>엄청 빡센 경사는 아니라 이동하는데에 어려움은 없었어요!</b><br>공연 끝나고 나서 방이역 쪽으로 이동해서 장콜 탑승했는데 혼란스럽지 않게 나올 수 있었어요~~!</p><p style=\"margin: 0; font-size: 0.875em; font-weight: 500; line-height: 1.25em; color: #0E64D3;\">- 아리아 수동 휠체어 -</p></div>"
    ],
    "descriptionHtmlsMobile": [
      "<div style=\"font-family: Pretendard, sans-serif; font-size: 0.875em; color: #24262B; line-height: 1.375em;\"><p style=\"margin: 0;\">올림픽 공원은 평지고, 차가 다니지 않아서 생각보다 <b>경기장 접근이 어렵지 않아요.</b> 다만 공연이 많으면 굉장히 혼잡하기 때문에 주차장 이용시 여유롭게 도착하는 것을 추천합니다!<br><br></p><p style=\"margin: 0;\"><b>티켓링크 라이브 아레나 갈 때, 수동휠체어 타고 경사 빡센곳을 힘들어하신다면 P6-7을 추천해요!</b></p><p style=\"margin: 1em 0 0 0; font-size: 0.875em; font-weight: 500; line-height: 1.25em; color: #0E64D3;\">- 야마하 수전동 휠체어 -</p></div>",
      "<div style=\"font-family: Pretendard, sans-serif; font-size: 0.875em; color: #24262B; line-height: 1.375em;\"><p style=\"margin: 0;\"><b>지하철</b>로 방문했는데,<br><b>4번출구 쪽 엘리베이터</b>로 나오면 대부분 평지였습니다.<br>오래된 공원/공연장이다 보니 <b>보도가 조금씩 깨져 있어서<br>살짝 주의해야 하지만</b> 이동에 큰 어려움은 없었습니다.</p><p style=\"margin: 1em 0 0 0; font-size: 0.875em; font-weight: 500; line-height: 1.25em; color: #0E64D3;\">- 아리아 수동 휠체어 동반인 -</p></div>",
      "<div style=\"font-family: Pretendard, sans-serif; font-size: 0.875em; color: #24262B; line-height: 1.375em;\"><p style=\"margin: 0;\">엔플라잉 공연이 진행되는 티켓링크 라이브 아레나 근처가 <b>다 평지여서 이동하기 편했어요~~</b><br>아치다리를 건너야하긴 했지만 <b>엄청 빡센 경사는 아니라 이동하는데에 어려움은 없었어요!</b></p><p style=\"margin: 0;\">공연 끝나고 나서 방이역 쪽으로 이동해서 장콜 탑승했는데 혼란스럽지 않게 나올 수 있었어요~~!</p><p style=\"margin: 1em 0 0 0; font-size: 0.875em; font-weight: 500; line-height: 1.25em; color: #0E64D3;\">- 아리아 수동 휠체어 -</p></div>"
    ],
    "investigatorInfo": {
      "title": "티켓링크 라이브 아레나 조사단",
      "members": "(박수빈, 박원, 백은하, 지수환, 주성희)"
    }
  },
  "ctaFooterSection": {
    "buttonUrl": "https://forms.staircrusher.club/contents-alarm"
  },
  "overviewSection": {
    "titleLine1": "티켓링크 라이브 아레나 동선 정보",
    "titleLine2": "한눈에 보기",
    "mapImageUrl": "https://scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com/20260116181402_tla-overview-map.png"
  },
  "floatingHeaderTitle": "티켓링크 라이브 아레나 접근성",
  "likeCount": 0,
  "createdAt": "2026-01-09"
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

/**
 * 모든 뿌클로드 리스트 조회 (리스트 페이지용)
 * @returns 뿌클로드 데이터 배열
 */
export function getAllBbucleRoadList(): BbucleRoadData[] {
  return Object.values(BBUCLE_ROAD_DATA);
}
