import React from 'react';
import styled from 'styled-components/native';

import {SccPressable} from '@/components/SccPressable';
import SccRemoteImage from '@/components/SccRemoteImage';

interface MissionHeroProps {
  hiddenActive: boolean;
  hiddenCompleted: boolean;
  onHiddenPress: () => void;
  onHiddenListPress: () => void;
  imageWidth: number;
  heroImageUrl: string;
}

// Figma 잔디밭 윌리 2 frame: width=390, height=575 (x=0, y=94 ~ y=669 in screen coord).
// hero 이미지는 잔디밭 윌리 2 영역 전체를 한 장의 PNG로 합쳐서 export한 것.
// 통이미지에 sky/잔디/title/subtitle/bubble/willy/외출템/CTA 가 모두 baked-in 되어 있다.
// hero-local 좌표(= figma 절대좌표 - 94)로 hot zone과 CTA pressable을 통이미지 위에 띄운다.
const DESIGN_WIDTH = 390;
const DESIGN_HEIGHT = 575;

// figma 절대좌표(y=380.63) - hero top(94) = 286.63
const HAT_HOT_ZONE = {
  left: 144.14,
  top: 286.63,
  width: 92.06,
  height: 57.79,
};

// figma 절대좌표(y=581) - hero top(94) = 487
const CTA_BUTTON = {
  left: 40,
  top: 487,
  width: 310,
  height: 48,
};

export default function MissionHero({
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

  const ctaActivated = hiddenActive;

  return (
    <HeroContainer style={{width: imageWidth, height: heroHeight}}>
      <SccRemoteImage
        imageUrl={heroImageUrl}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: imageWidth,
          height: heroHeight,
        }}
        resizeMode="cover"
        wrapperBackgroundColor={null}
      />

      {hiddenActive && !hiddenCompleted && (
        <HatHotZone
          elementName="tutorial_mission_hat_hot_zone"
          onPress={onHiddenPress}
          style={{
            position: 'absolute',
            left: px(HAT_HOT_ZONE.left),
            top: px(HAT_HOT_ZONE.top),
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
          top: px(CTA_BUTTON.top),
          width: px(CTA_BUTTON.width),
          height: px(CTA_BUTTON.height),
        }}
      />
    </HeroContainer>
  );
}

const HeroContainer = styled.View`
  overflow: hidden;
`;

// hot zone과 CTA pressable은 투명 — 시각적 UI는 통이미지에 포함됨.
// 사용자 터치 이벤트만 가로채는 역할.
const HatHotZone = styled(SccPressable)``;

const HiddenListCtaButton = styled(SccPressable)``;
