import React from 'react';
import {Image} from 'react-native';
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
  /** dim 시 노출할 텍스트 (e.g. "외출템1을 먼저 모아주세요!") */
  dimText?: string;
  onStart: () => void;
}

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
        <Subtitle>
          {meta.subtitle}
          <SubtitleBold>{meta.subtitleBoldSuffix}</SubtitleBold>
        </Subtitle>
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
          <DimText>{dimText ?? '이전 미션을 먼저 완료해주세요!'}</DimText>
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
  margin-bottom: 8px;
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
  gap: 8px;
`;

const Subtitle = styled.Text`
  font-family: ${font.pretendardMedium};
  font-size: 15px;
  line-height: 22px;
  letter-spacing: -0.3px;
  color: #0e64d3;
`;

const SubtitleBold = styled.Text`
  font-family: ${font.pretendardBold};
  font-size: 15px;
  line-height: 22px;
  letter-spacing: -0.3px;
  color: #0e64d3;
`;

const Title = styled.Text`
  font-family: ${font.pretendardSemibold};
  font-size: 18px;
  line-height: 26px;
  letter-spacing: -0.36px;
  color: #16181c;
`;

const StartButton = styled(SccPressable)<{completed: boolean}>`
  margin-top: 6px;
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
  background-color: rgba(255, 255, 255, 0.5);
  align-items: center;
  justify-content: center;
`;

const DimText = styled.Text`
  font-family: ${font.pretendardSemibold};
  font-size: 18px;
  line-height: 26px;
  letter-spacing: -0.36px;
  color: ${color.black};
`;
