import React from 'react';
import styled from 'styled-components/native';

import {SccPressable} from '@/components/SccPressable';
import SccRemoteImage from '@/components/SccRemoteImage';

import SpeechBubble, {BubbleVariant} from './SpeechBubble';

interface MissionHeroProps {
  hiddenActive: boolean;
  hiddenCompleted: boolean;
  onHiddenPress: () => void;
  imageWidth: number;
  heroImageUrl: string;
  /**
   * 박원 디자이너 시안(2026-05-27)에 따른 말풍선 variant. null 이면 말풍선 미노출.
   * (스플래시 직전 등 hero 만 렌더해야 하는 케이스 대비.)
   */
  bubbleVariant: BubbleVariant | null;
  /**
   * 말풍선 둥실(float) 애니메이션 여부. hero 자체는 정지하고 말풍선만 움직인다.
   * - variant 1/2/3/5: true (둥실)
   * - variant 4/6: false (정지)
   */
  bubbleFloat: boolean;
  /**
   * 미션 카드 hot zone 탭 핸들러. hero 안의 외출템(스마트폰/지도/돋보기)을 누르면
   * 해당 미션 카드로 부모 ScrollView 가 스크롤한다.
   */
  onMissionItemPress?: (index: 0 | 1 | 2) => void;
  /**
   * 말풍선 탭 핸들러. 지정 시 말풍선이 탭 가능해진다(진행 중 미션으로 스크롤). 진행 중
   * 미션이 있는 variant 1/2/3 에서만 부모가 전달한다.
   */
  onBubblePress?: () => void;
}

// 박원 figma 의 hero(visual) frame 사이즈. button/말풍선은 hero PNG 에서 제외됐고
// 클라이언트가 따로 sticky CTA / SpeechBubble layer 로 띄운다.
const DESIGN_WIDTH = 390;
const DESIGN_HEIGHT = 512;

// 윌리 모자 위 hot zone (히든 미션 트리거). figma visual 안 item_hidden 노드의
// hero-local 좌표. stage3b (visual 2003:16476) item_hidden = abs(32644,-724,92.06,57.78)
// → hero-local (146, 277, 92, 58). all_complete (visual 2004:15144) 도 거의 동일.
const HAT_HOT_ZONE = {
  left: 146,
  top: 277,
  width: 92,
  height: 58,
};

// figma `mission_item` group 의 외출템 좌표 → hero-local 변환값. 모든 variant frame
// 에서 동일한 절대 좌표를 사용한다 (박원 시안의 vector 노드 좌표는 stage 별로 같음).
const MISSION_ITEM_HOT_ZONES = [
  // item_1 (smartphone): hero-local x=58, y=272, w=67, h=95
  {left: 58, top: 272, width: 67, height: 95},
  // item_2 (map): hero-local x=25, y=392, w=95, h=74
  {left: 25, top: 392, width: 95, height: 74},
  // item_3 (magnifier): hero-local x=285, y=337, w=72, h=87
  {left: 285, top: 337, width: 72, height: 87},
] as const;

export default function MissionHero({
  hiddenActive,
  hiddenCompleted,
  onHiddenPress,
  imageWidth,
  heroImageUrl,
  bubbleVariant,
  bubbleFloat,
  onMissionItemPress,
  onBubblePress,
}: MissionHeroProps) {
  const scale = imageWidth / DESIGN_WIDTH;
  const heroHeight = DESIGN_HEIGHT * scale;
  const px = (val: number) => val * scale;

  return (
    <HeroContainer style={{width: imageWidth, height: heroHeight}}>
      <SccRemoteImage
        imageUrl={heroImageUrl}
        style={{
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

      {onMissionItemPress &&
        MISSION_ITEM_HOT_ZONES.map((zone, idx) => (
          <MissionItemHotZone
            key={idx}
            elementName={`tutorial_mission_item_${idx + 1}_hot_zone`}
            onPress={() => onMissionItemPress(idx as 0 | 1 | 2)}
            style={{
              position: 'absolute',
              left: px(zone.left),
              top: px(zone.top),
              width: px(zone.width),
              height: px(zone.height),
            }}
          />
        ))}

      {bubbleVariant && (
        <SpeechBubble
          variant={bubbleVariant}
          heroWidth={imageWidth}
          float={bubbleFloat}
          onPress={onBubblePress}
        />
      )}
    </HeroContainer>
  );
}

const HeroContainer = styled.View`
  overflow: hidden;
`;

const HatHotZone = styled(SccPressable)``;

const MissionItemHotZone = styled(SccPressable)``;
