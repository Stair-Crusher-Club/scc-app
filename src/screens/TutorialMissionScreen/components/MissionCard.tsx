import {BlurView} from '@sbaiahmed1/react-native-blur';
import React from 'react';
import {Image, View} from 'react-native';
import styled from 'styled-components/native';

import CheckBoldBlueIcon from '@/assets/icon/ic_check_bold_blue.svg';
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
        <ItemImage
          source={meta.itemImage}
          resizeMode="contain"
          style={{width: meta.itemImageWidth, height: meta.itemImageHeight}}
        />
        {isCompleted && (
          <ItemDim>
            <CheckBoldBlueIcon width={32.5} height={24.5} />
          </ItemDim>
        )}
      </ItemBox>

      <CardBody>
        <SubtitleBlock>
          <Subtitle>
            {meta.subtitle}
            <SubtitleBold>{meta.subtitleBoldSuffix}</SubtitleBold>
          </Subtitle>
          <Title>{meta.title}</Title>
        </SubtitleBlock>
        <StartButton
          elementName="tutorial_mission_start_button"
          logParams={{mission_type: missionType}}
          onPress={isCompleted || isDimmed ? undefined : onStart}
          disabled={isCompleted || isDimmed}
          inactive={isCompleted || isDimmed}>
          <StartButtonText>
            {isCompleted ? '미션 완료' : '미션 시작'}
          </StartButtonText>
        </StartButton>
      </CardBody>

      {isDimmed && (
        <DimOverlay
          blurType="light"
          blurAmount={6}
          reducedTransparencyFallbackColor="rgba(255,255,255,0.92)">
          <View
            style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <DimText>{`🔒\n${dimText ?? '이전 미션을 먼저 완료해주세요!'}`}</DimText>
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

const ItemImage = styled(Image)``;

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
  flex-direction: column;
  gap: 14px;
  align-items: flex-start;
`;

const SubtitleBlock = styled.View`
  flex-direction: column;
  gap: 2px;
  width: 100%;
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

const StartButton = styled(SccPressable)<{inactive: boolean}>`
  align-self: flex-start;
  background-color: ${({inactive}) => (inactive ? '#a0a2ae' : color.brand40)};
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

// Figma quest_card_dim: backdrop-blur 5.5px + bg rgba(255,255,255,0.5).
const DimOverlay = styled(BlurView)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.5);
`;

const DimText = styled.Text`
  font-family: ${font.pretendardSemibold};
  font-size: 18px;
  line-height: 26px;
  letter-spacing: -0.36px;
  color: ${color.black};
  text-align: center;
`;
