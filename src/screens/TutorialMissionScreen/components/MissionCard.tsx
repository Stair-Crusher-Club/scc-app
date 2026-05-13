import React from 'react';
import {Image, View} from 'react-native';
import styled from 'styled-components/native';

import CheckColoredIcon from '@/assets/icon/ic_check_colored.svg';
import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {TutorialMissionTypeDto} from '@/generated-sources/openapi';

import {MissionMeta} from '../constants';

interface MissionCardProps {
  missionType: TutorialMissionTypeDto;
  meta: MissionMeta;
  isCompleted: boolean;
  isDimmed: boolean;
  /** dim 시 노출할 텍스트 (e.g. "외출템 1을 모으면, 외출템 2미션이 열려요!") */
  dimText?: string;
  onStart: () => void;
}

/**
 * 미션 카드 (358 x 128).
 * Figma 디자인:
 *  - bg white, border #e1eac2 1px, radius 16, padding 16, flex-row gap 12
 *  - item box: 90x96, bg #f4f4f4, radius 12
 *  - subtitle: Pretendard Medium 15/22 ls -0.3 color #0e64d3 (brand50) + bold suffix
 *  - title: Pretendard SemiBold 18/26 ls -0.36 color #16181c (gray90v2)
 *  - button: padding 12/5, radius 41
 *    - 미션 시작 (활성): bg #0c76f7 (brand40) 텍스트 white
 *    - 미션 완료 (회색): bg #a0a2ae (gray40v2) 텍스트 white
 *  - 완료 상태: item 위에 0.8 opacity dim + 큰 체크 아이콘 + 버튼 "미션 완료"
 *  - 잠김 상태: 카드 전체에 0.5 white overlay + 가운데 "🔒\n외출템 N을 모으면, 외출템 N+1미션이 열려요!" 텍스트
 */
export default function MissionCard({
  missionType,
  meta,
  isCompleted,
  isDimmed,
  dimText,
  onStart,
}: MissionCardProps) {
  return (
    <CardContainer>
      <ItemBox>
        <ItemImage source={meta.itemImage} resizeMode="contain" />
        {isCompleted && (
          <ItemDim>
            <CheckColoredIcon width={48} height={48} />
          </ItemDim>
        )}
      </ItemBox>

      <CardBody>
        <SubtitleRow>
          <Subtitle>
            {meta.subtitle}
            <SubtitleBold>{meta.subtitleBoldSuffix}</SubtitleBold>
          </Subtitle>
        </SubtitleRow>
        <Title>{meta.title}</Title>
        <StartButton
          elementName="tutorial_mission_start_button"
          logParams={{mission_type: missionType}}
          onPress={isCompleted || isDimmed ? undefined : onStart}
          disabled={isCompleted || isDimmed}
          completed={isCompleted}>
          <StartButtonText>
            {isCompleted ? '미션 완료' : '미션 시작'}
          </StartButtonText>
        </StartButton>
      </CardBody>

      {isDimmed && (
        <DimOverlay>
          <View style={{alignItems: 'center'}}>
            <DimLockIcon>🔒</DimLockIcon>
            <DimText>{dimText ?? '이전 미션을 먼저 완료해주세요!'}</DimText>
          </View>
        </DimOverlay>
      )}
    </CardContainer>
  );
}

const CardContainer = styled.View`
  background-color: ${color.white};
  border-width: 1px;
  border-color: #e1eac2;
  border-radius: 16px;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  padding: 16px;
  overflow: hidden;
`;

const ItemBox = styled.View`
  width: 90px;
  height: 96px;
  border-radius: 12px;
  background-color: #f4f4f4;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const ItemImage = styled(Image)`
  width: 70px;
  height: 70px;
`;

const ItemDim = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(244, 244, 244, 0.8);
  align-items: center;
  justify-content: center;
`;

const CardBody = styled.View`
  flex: 1;
  gap: 2px;
`;

const SubtitleRow = styled.View`
  margin-bottom: 2px;
`;

const Subtitle = styled.Text`
  font-family: ${font.pretendardMedium};
  font-size: 15px;
  line-height: 22px;
  letter-spacing: -0.3px;
  color: ${color.brand50};
`;

const SubtitleBold = styled.Text`
  font-family: ${font.pretendardBold};
  font-size: 15px;
  line-height: 22px;
  letter-spacing: -0.3px;
  color: ${color.brand50};
`;

const Title = styled.Text`
  font-family: ${font.pretendardSemibold};
  font-size: 18px;
  line-height: 26px;
  letter-spacing: -0.36px;
  color: ${color.gray90v2};
`;

const StartButton = styled(SccPressable)<{completed: boolean}>`
  margin-top: 12px;
  align-self: flex-start;
  background-color: ${({completed}) =>
    completed ? color.gray40v2 : color.brand40};
  border-radius: 41px;
  padding: 5px 12px;
`;

const StartButtonText = styled.Text`
  font-family: ${font.pretendardMedium};
  font-size: 14px;
  line-height: 20px;
  letter-spacing: -0.28px;
  color: ${color.white};
`;

const DimOverlay = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  /* Figma: backdrop-blur(5.5px) + bg rgba(255,255,255,0.5).
     RN에서는 BlurView 없이 단순 흰색 overlay로 근사. */
  background-color: rgba(255, 255, 255, 0.82);
  align-items: center;
  justify-content: center;
`;

const DimLockIcon = styled.Text`
  font-size: 18px;
  line-height: 26px;
  letter-spacing: -0.36px;
  color: ${color.black};
  text-align: center;
  margin-bottom: 0;
`;

const DimText = styled.Text`
  font-family: ${font.pretendardSemibold};
  font-size: 18px;
  line-height: 26px;
  letter-spacing: -0.36px;
  color: ${color.black};
  text-align: center;
`;
