import React from 'react';
import {Image} from 'react-native';
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  Polygon,
  Rect,
  Stop,
} from 'react-native-svg';
import styled from 'styled-components/native';

import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';
import {font} from '@/constant/font';

interface MissionHeroProps {
  /** 외출템 수집 단계 (0..3). 3이면 모든 main 미션 완료 상태 */
  stage: number;
  /** 모든 메인 미션 완료 시 히든 hot zone 활성화 여부 */
  hiddenActive: boolean;
  /** 히든 미션 완료 여부. 완료 시 hot zone CTA 비활성 */
  hiddenCompleted: boolean;
  /** 히든 hot zone (모자) 클릭 핸들러 */
  onHiddenPress: () => void;
  /** "계뿌클 히든 맛집 리스트 보기!" CTA 버튼 클릭 핸들러 */
  onHiddenListPress: () => void;
  /** 이미지 폭 (보통 screen width) */
  imageWidth: number;
}

/**
 * 윌리의 외출 NUX 튜토리얼 미션 화면 상단 hero.
 *
 * Figma 디자인 (390x575 영역):
 *  - 배경: 하늘 #c0dbf8 → #6daff9 그라데이션 + 잔디밭 윌리 일러스트 (hero_base.png)
 *  - 가운데: HeroTitle 텍스트 vector (hero_title_empty.png / hero_title_full.png)
 *  - 부제: "미션을 성공해서 윌리의 외출템을 모아보세요!\n전부 모으면 계뿌클 히든 맛집 리스트도 공개됩니다"
 *  - 말풍선: 진행 상태별 다른 텍스트
 *  - mission_item layer: 외출템 4개가 단계별로 그려진 합성 PNG
 *    - mission_items_stage0..3.png — main 미션 0/1/2/3개 완료 시
 *    - mission_items_hidden.png — 모든 main + 모자 click! 표시
 *  - CTA Button: 계뿌클 히든 맛집 리스트 보기!
 *
 * 외출템 hot zone (히든 미션)은 모자 영역의 absolute 좌표에 SccPressable 오버레이.
 */

// Figma 기준 디자인 사이즈.
// Figma 절대좌표에서 잔디밭 frame은 y=94, height=575 (App bar 아래).
// MissionHero 컴포넌트는 ScreenLayout 헤더 아래에서 y=0부터 시작하므로,
// Figma 절대좌표값에서 94를 빼서 컴포넌트 내 좌표로 사용한다.
const DESIGN_WIDTH = 390;
const FIGMA_HERO_TOP = 94; // App bar 높이 = hero 시작점 offset
const DESIGN_HEIGHT = 575; // 잔디 frame 높이 (Figma 원본)

// 잔디밭 윌리 일러스트가 차지하는 영역 (Figma: y=94..669, 575 height)
const HERO_BASE = {
  width: DESIGN_WIDTH,
  height: DESIGN_HEIGHT,
};

// HeroTitle vector text 위치/크기 (Figma 정밀값)
// empty: 1648:36352 (265.08 x 97.35) at y=146 (Frame y=146)
// full ("함께해주세요!"): 1561:16790 (236.75 x 96.48) at y=146
// 둘 다 Frame 1618873117 (305 x ~163)에 들어가며, vector 자체는 Frame의 위쪽에 위치.
const HERO_TITLE = {
  topInFrame: 146,
  emptyWidth: 265.08,
  emptyHeight: 97.35,
  fullWidth: 236.75,
  fullHeight: 96.48,
};

// 말풍선 위치 (Figma 정밀값)
// empty: bubble at x=141 y=335.5, 193.84 x 38, polygon tail at x=242.5 y=388
// item 2: x=129, y=335.5, 221 x 38
// item 3: x=116, y=336, 238 x 38
// item-clear: x=159, y=335.5, 149 x 38
// reward_activate: x=143, y=318.79, 184.99 x 38
const BUBBLE_TAIL_TOP_OFFSET = 38;

// mission_item frame (Figma: x=24, y=371.29, 314.69 x 161)
const MISSION_ITEM_FRAME = {
  left: 24,
  top: 371.29,
  width: 314.69,
  height: 161,
};

// item_hidden (모자) hot zone 좌표 within mission_item frame
const HAT_HOT_ZONE = {
  left: 120.14, // 144.14 - 24
  top: 9.34, // 380.63 - 371.29
  width: 92.06,
  height: 57.79,
};

// CTA Button (Figma: x=40, y=581, 310 x 48)
const CTA_BUTTON = {
  left: 40,
  top: 581,
  width: 310,
  height: 48,
};

interface BubbleSpec {
  text: string;
  /** Figma 기준 bubble container x (rounded-rectangle left edge) */
  left: number;
  /** bubble top y (Figma 절대 좌표) */
  top: number;
  /** bubble width (rounded-rectangle) */
  width: number;
}

function getBubble(
  stage: number,
  hiddenActive: boolean,
  hiddenCompleted: boolean,
): BubbleSpec {
  // 말풍선 width는 Pretendard SemiBold 18px로 텍스트 잘림 방지를 위해
  // Figma 원본 width (Kyobo 손글씨체 기준)보다 약 25% 늘려 사용한다.
  // 위치(left)는 가운데 정렬 유지를 위해 늘어난 만큼 절반씩 좌측으로 이동.
  if (hiddenCompleted) {
    return {
      text: '외출 준비 완료!',
      left: 130,
      top: 335.5,
      width: 220,
    };
  }
  if (hiddenActive) {
    // reward_activate
    return {
      text: '숨겨진 외출템도 모아볼까?',
      left: 125,
      top: 318.79,
      width: 220,
    };
  }
  switch (stage) {
    case 0:
      return {
        text: '나? 윌리!! 외출템이 필요해!',
        left: 115,
        top: 335.5,
        width: 245,
      };
    case 1:
      return {
        text: '계단 정보가 있는 지도가 필요해!',
        left: 105,
        top: 335.5,
        width: 270,
      };
    case 2:
      return {
        text: '상세정보는 어떻게 확인하는거지?!',
        left: 95,
        top: 336,
        width: 280,
      };
    default:
      // 메인 3개 완료 + 히든 미완료/완료가 아닌 fallback (사용되지 않음)
      return {
        text: '외출템을 다 모았어!!',
        left: 145,
        top: 335.5,
        width: 180,
      };
  }
}

/**
 * TODO: hero 이미지를 서버에서 통짜로 내려주도록 변경.
 *   현재는 stage / hiddenActive 조합으로 5종을 앱 번들에 하드코딩한다.
 *   서버에서 UserTutorialProgressDto.heroImageUrl 같은 필드로 단일 URL을 받으면
 *   디자인 변경 시 앱 배포 없이 교체 가능 — 별도 follow-up 작업으로 분리.
 */
function getMissionItemsAsset(stage: number, hiddenActive: boolean): number {
  if (hiddenActive) {
    return require('@/assets/img/tutorial/mission_items_hidden.png');
  }
  switch (stage) {
    case 0:
      return require('@/assets/img/tutorial/mission_items_stage0.png');
    case 1:
      return require('@/assets/img/tutorial/mission_items_stage1.png');
    case 2:
      return require('@/assets/img/tutorial/mission_items_stage2.png');
    default:
      return require('@/assets/img/tutorial/mission_items_stage3.png');
  }
}

export default function MissionHero({
  stage,
  hiddenActive,
  hiddenCompleted,
  onHiddenPress,
  onHiddenListPress,
  imageWidth,
}: MissionHeroProps) {
  // Figma 비례를 유지하며 화면 폭에 맞춰 스케일
  const scale = imageWidth / DESIGN_WIDTH;
  const heroHeight = DESIGN_HEIGHT * scale;
  const px = (val: number) => val * scale;
  // Figma 절대 y좌표 → hero 컴포넌트 내부 y좌표 변환 (App bar offset 94 제거)
  const py = (figmaAbsoluteY: number) =>
    (figmaAbsoluteY - FIGMA_HERO_TOP) * scale;

  const isInitial = stage === 0 && !hiddenActive && !hiddenCompleted;
  const heroTitleSource = isInitial
    ? require('@/assets/img/tutorial/hero_title_empty.png')
    : require('@/assets/img/tutorial/hero_title_full.png');
  const heroTitleWidth = isInitial
    ? HERO_TITLE.emptyWidth
    : HERO_TITLE.fullWidth;
  const heroTitleHeight = isInitial
    ? HERO_TITLE.emptyHeight
    : HERO_TITLE.fullHeight;

  const bubble = getBubble(stage, hiddenActive, hiddenCompleted);
  const missionItemsAsset = getMissionItemsAsset(stage, hiddenActive);

  // CTA 버튼: 모든 main 완료 시 활성
  const ctaActivated = hiddenActive;

  return (
    <HeroContainer style={{width: imageWidth, height: heroHeight}}>
      {/* 하늘 그라데이션 (Figma: 33% 위치까지 #c0dbf8, 이후 #6daff9) */}
      <Svg
        width={imageWidth}
        height={heroHeight}
        style={{position: 'absolute', top: 0, left: 0}}>
        <Defs>
          <SvgLinearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0.33" stopColor="#C0DBF8" stopOpacity="1" />
            <Stop offset="1" stopColor="#6DAFF9" stopOpacity="1" />
          </SvgLinearGradient>
        </Defs>
        <Rect
          x="0"
          y="0"
          width={imageWidth}
          height={heroHeight}
          fill="url(#skyGrad)"
        />
      </Svg>

      {/* 잔디밭 + 윌리 base 일러스트 */}
      <Image
        source={require('@/assets/img/tutorial/hero_base.png')}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: px(HERO_BASE.width),
          height: px(HERO_BASE.height),
        }}
        resizeMode="cover"
      />

      {/* HeroTitle vector */}
      <Image
        source={heroTitleSource}
        style={{
          position: 'absolute',
          top: py(HERO_TITLE.topInFrame),
          left: (imageWidth - px(heroTitleWidth)) / 2,
          width: px(heroTitleWidth),
          height: px(heroTitleHeight),
        }}
        resizeMode="contain"
      />

      {/* HeroSubtitle */}
      <HeroSubtitle
        style={{
          position: 'absolute',
          top: py(HERO_TITLE.topInFrame + heroTitleHeight + 12),
          left: 0,
          right: 0,
          fontSize: px(16),
          lineHeight: px(27),
        }}>
        {`미션을 성공해서 윌리의 외출템을 모아보세요!\n전부 모으면 계뿌클 히든 맛집 리스트도 공개됩니다`}
      </HeroSubtitle>

      {/* 말풍선 */}
      <BubbleRect
        style={{
          position: 'absolute',
          top: py(bubble.top),
          left: px(bubble.left),
          width: px(bubble.width),
          height: px(38),
          borderRadius: px(52),
          paddingHorizontal: px(14),
          paddingVertical: px(6),
        }}>
        <BubbleText style={{fontSize: px(18), lineHeight: px(27)}}>
          {bubble.text}
        </BubbleText>
      </BubbleRect>
      {/* 말풍선 tail (좌하단) */}
      <Svg
        width={px(19.5)}
        height={px(14.5)}
        style={{
          position: 'absolute',
          left: px(bubble.left + 23),
          top: py(bubble.top + BUBBLE_TAIL_TOP_OFFSET),
        }}>
        <Polygon points={`0,0 ${px(19.5)},0 0,${px(14.5)}`} fill="#F1F1F1" />
      </Svg>

      {/* mission_item layer (외출템 합성 PNG) */}
      <Image
        source={missionItemsAsset}
        style={{
          position: 'absolute',
          left: px(MISSION_ITEM_FRAME.left),
          top: py(MISSION_ITEM_FRAME.top),
          width: px(MISSION_ITEM_FRAME.width),
          height: px(MISSION_ITEM_FRAME.height),
        }}
        resizeMode="contain"
      />

      {/* 모자 hot zone (히든 미션 시작 트리거) */}
      {hiddenActive && !hiddenCompleted && (
        <HatHotZone
          elementName="tutorial_mission_hat_hot_zone"
          onPress={onHiddenPress}
          style={{
            position: 'absolute',
            left: px(MISSION_ITEM_FRAME.left + HAT_HOT_ZONE.left),
            top: py(MISSION_ITEM_FRAME.top + HAT_HOT_ZONE.top),
            width: px(HAT_HOT_ZONE.width),
            height: px(HAT_HOT_ZONE.height),
          }}
        />
      )}

      {/* "계뿌클 히든 맛집 리스트 보기!" CTA */}
      <HiddenListCtaButton
        elementName="tutorial_mission_hidden_list_cta"
        onPress={ctaActivated ? onHiddenListPress : undefined}
        disabled={!ctaActivated}
        style={{
          position: 'absolute',
          left: px(CTA_BUTTON.left),
          top: py(CTA_BUTTON.top),
          width: px(CTA_BUTTON.width),
          height: px(CTA_BUTTON.height),
          borderRadius: px(8),
          borderWidth: 1.5,
        }}
        activated={ctaActivated}>
        <HiddenListCtaText
          style={{fontSize: px(18), lineHeight: px(26)}}
          activated={ctaActivated}>
          계뿌클 히든 맛집 리스트 보기!
        </HiddenListCtaText>
      </HiddenListCtaButton>
    </HeroContainer>
  );
}

const HeroContainer = styled.View`
  background-color: #6daff9;
  overflow: hidden;
`;

const HeroSubtitle = styled.Text`
  font-family: ${font.pretendardSemibold};
  letter-spacing: -0.32px;
  color: ${color.white};
  text-align: center;
  text-shadow-color: #0d5ab2;
  text-shadow-radius: 4px;
  text-shadow-offset: 0px 0px;
`;

const BubbleRect = styled.View`
  background-color: ${color.white};
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

const BubbleText = styled.Text`
  font-family: ${font.pretendardSemibold};
  letter-spacing: -0.36px;
  color: ${color.black};
  text-align: center;
`;

const HatHotZone = styled(SccPressable)``;

const HiddenListCtaButton = styled(SccPressable)<{activated: boolean}>`
  align-items: center;
  justify-content: center;
  border-color: ${color.white};
  background-color: ${({activated}) =>
    activated ? color.brand40 : color.gray40v2};
`;

const HiddenListCtaText = styled.Text<{activated: boolean}>`
  font-family: ${font.pretendardSemibold};
  letter-spacing: -0.36px;
  color: ${({activated}) => (activated ? color.white : color.gray20v2)};
`;
