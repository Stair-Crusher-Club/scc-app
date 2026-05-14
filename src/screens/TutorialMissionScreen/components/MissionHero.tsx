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
import SccRemoteImage from '@/components/SccRemoteImage';
import {color} from '@/constant/color';
import {font} from '@/constant/font';

interface MissionHeroProps {
  stage: number;
  hiddenActive: boolean;
  hiddenCompleted: boolean;
  onHiddenPress: () => void;
  onHiddenListPress: () => void;
  imageWidth: number;
  heroImageUrl: string;
}

// Figma 절대좌표 기준 상수.
// 잔디 frame은 y=94 (App bar 아래), height=575.
// 컴포넌트 내 좌표로 변환할 때 94를 빼서 사용한다.
const DESIGN_WIDTH = 390;
const FIGMA_HERO_TOP = 94;
const DESIGN_HEIGHT = 575;

const HERO_BASE = {
  width: DESIGN_WIDTH,
  height: DESIGN_HEIGHT,
};

const HERO_TITLE = {
  topInFrame: 146,
  emptyWidth: 265.08,
  emptyHeight: 97.35,
  fullWidth: 236.75,
  fullHeight: 96.48,
};

const BUBBLE_TAIL_TOP_OFFSET = 38;

const MISSION_ITEM_FRAME = {
  left: 24,
  top: 371.29,
  width: 314.69,
  height: 161,
};

const HAT_HOT_ZONE = {
  left: 120.14,
  top: 9.34,
  width: 92.06,
  height: 57.79,
};

const CTA_BUTTON = {
  left: 40,
  top: 581,
  width: 310,
  height: 48,
};

interface BubbleSpec {
  text: string;
  left: number;
  top: number;
  width: number;
}

function getBubble(
  stage: number,
  hiddenActive: boolean,
  hiddenCompleted: boolean,
): BubbleSpec {
  // bubble width는 Pretendard SemiBold 18px 기준 텍스트 잘림 방지를 위해
  // Figma 원본(Kyobo 손글씨체)보다 약 25% 늘리고, 가운데 정렬을 위해
  // 늘어난 만큼 절반씩 좌측으로 이동.
  if (hiddenCompleted) {
    return {
      text: '외출 준비 완료!',
      left: 130,
      top: 335.5,
      width: 220,
    };
  }
  if (hiddenActive) {
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
      return {
        text: '외출템을 다 모았어!!',
        left: 145,
        top: 335.5,
        width: 180,
      };
  }
}

export default function MissionHero({
  stage,
  hiddenActive,
  hiddenCompleted,
  onHiddenPress,
  onHiddenListPress,
  imageWidth,
  heroImageUrl,
}: MissionHeroProps) {
  const scale = imageWidth / DESIGN_WIDTH;
  const heroHeight = DESIGN_HEIGHT * scale;
  const px = (val: number) => val * scale;
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

  const ctaActivated = hiddenActive;

  return (
    <HeroContainer style={{width: imageWidth, height: heroHeight}}>
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

      <SccRemoteImage
        imageUrl={heroImageUrl}
        style={{
          position: 'absolute',
          left: px(MISSION_ITEM_FRAME.left),
          top: py(MISSION_ITEM_FRAME.top),
          width: px(MISSION_ITEM_FRAME.width),
          height: px(MISSION_ITEM_FRAME.height),
        }}
        resizeMode="contain"
        wrapperBackgroundColor={null}
      />

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
