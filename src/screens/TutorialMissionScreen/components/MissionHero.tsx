import React from 'react';
import {View} from 'react-native';
import styled from 'styled-components/native';

import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';
import {font} from '@/constant/font';

interface MissionHeroProps {
  /** 외출템 수집 단계 (0..4). 4면 모든 main 미션 완료 상태 */
  stage: number;
  /** 모든 메인 미션 완료 시 히든 hot zone 활성화 여부 */
  hiddenActive: boolean;
  /** 히든 미션 완료 여부. 완료 시 hot zone CTA 비활성 */
  hiddenCompleted: boolean;
  /** 히든 hot zone (모자/CTA) 클릭 핸들러 */
  onHiddenPress: () => void;
  /** 이미지 폭 (보통 screen width) */
  imageWidth: number;
}

/**
 * 윌리의 외출 NUX 튜토리얼 미션 화면 상단 hero.
 *
 * Figma 디자인은 통짜 5단계 이미지 + 하단 "히든 맛집 리스트 받기" 버튼 형태이지만,
 * 1차 구현에서는 디자이너의 3x PNG export 없이도 동작하도록 단순화한 layout 사용.
 * - 배경: 푸른 하늘 → 풀밭 그라데이션
 * - 중앙: "윌리의 외출을 함께해주세요!" 타이틀
 * - 진행 텍스트: 수집한 외출템 개수 / 4
 * - 하단 CTA: 모든 미션 완료 시 활성화되는 히든 맛집 리스트 받기 버튼
 *
 * 향후 디자이너 export 받으면 hero_stage_0..4.png를 통째로 교체할 수 있도록
 * `imageWidth`만큼 폭을 차지하는 컨테이너 구조 유지.
 */
export default function MissionHero({
  stage,
  hiddenActive,
  hiddenCompleted,
  onHiddenPress,
  imageWidth,
}: MissionHeroProps) {
  const heroHeight = Math.round((imageWidth * 575) / 390);

  return (
    <HeroContainer style={{width: imageWidth, height: heroHeight}}>
      <SkyBackground />
      <GrassBackground />

      <HeroInner>
        <HeroTitle>{'윌리의 외출을\n함께해주세요!'}</HeroTitle>
        <HeroSubtitle>
          {`미션을 성공해서 윌리의 외출템을 모아보세요!\n전부 모으면 계뿌클 히든 맛집 리스트도 공개됩니다`}
        </HeroSubtitle>

        <BubbleContainer>
          <BubbleText>나? 윌리!! 외출템이 필요해!</BubbleText>
        </BubbleContainer>

        <ProgressIndicator>
          <ProgressLabel>외출템 수집</ProgressLabel>
          <ProgressValue>{stage}/4</ProgressValue>
        </ProgressIndicator>

        <View style={{flex: 1}} />

        <HiddenCtaButton
          elementName="tutorial_mission_hidden_cta"
          onPress={onHiddenPress}
          disabled={!hiddenActive || hiddenCompleted}
          activated={hiddenActive && !hiddenCompleted}>
          <HiddenCtaText activated={hiddenActive && !hiddenCompleted}>
            {hiddenCompleted
              ? '히든 맛집 리스트 받기 완료!'
              : '계뿌클 히든 맛집 리스트 받기!'}
          </HiddenCtaText>
        </HiddenCtaButton>
      </HeroInner>
    </HeroContainer>
  );
}

const HeroContainer = styled.View`
  background-color: #6daff9;
  overflow: hidden;
`;

const SkyBackground = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #c0dbf8;
`;

const GrassBackground = styled.View`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50%;
  background-color: #8bc04a;
`;

const HeroInner = styled.View`
  flex: 1;
  align-items: center;
  padding: 56px 24px 24px;
`;

const HeroTitle = styled.Text`
  font-family: ${font.gumiRomance};
  font-size: 36px;
  line-height: 44px;
  letter-spacing: -0.72px;
  color: ${color.white};
  text-align: center;
  text-shadow: 0 0 4px #0d5ab2;
`;

const HeroSubtitle = styled.Text`
  margin-top: 12px;
  font-family: ${font.pretendardSemibold};
  font-size: 16px;
  line-height: 24px;
  letter-spacing: -0.32px;
  color: ${color.white};
  text-align: center;
`;

const BubbleContainer = styled.View`
  margin-top: 16px;
  background-color: ${color.white};
  border-radius: 20px;
  padding: 6px 14px;
`;

const BubbleText = styled.Text`
  font-family: ${font.pretendardSemibold};
  font-size: 14px;
  line-height: 20px;
  letter-spacing: -0.28px;
  color: ${color.black};
`;

const ProgressIndicator = styled.View`
  margin-top: 24px;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  background-color: ${color.blacka30};
  padding: 8px 16px;
  border-radius: 20px;
`;

const ProgressLabel = styled.Text`
  font-family: ${font.pretendardMedium};
  font-size: 13px;
  line-height: 18px;
  color: ${color.white};
`;

const ProgressValue = styled.Text`
  font-family: ${font.pretendardBold};
  font-size: 16px;
  line-height: 22px;
  color: ${color.white};
`;

const HiddenCtaButton = styled(SccPressable)<{activated: boolean}>`
  margin-top: 16px;
  width: 310px;
  height: 48px;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border-width: 1.5px;
  border-color: ${color.white};
  background-color: ${({activated}) =>
    activated ? color.brand40 : color.gray40};
`;

const HiddenCtaText = styled.Text<{activated: boolean}>`
  font-family: ${font.pretendardSemibold};
  font-size: 18px;
  line-height: 26px;
  letter-spacing: -0.36px;
  color: ${({activated}) => (activated ? color.white : '#E3E4E8')};
`;
