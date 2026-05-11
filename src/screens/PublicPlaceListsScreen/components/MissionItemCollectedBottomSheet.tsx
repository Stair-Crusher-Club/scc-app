import React from 'react';
import {Image} from 'react-native';
import styled from 'styled-components/native';

import {SccButton} from '@/components/atoms';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {TutorialMissionTypeDto} from '@/generated-sources/openapi';
import BottomSheet from '@/modals/BottomSheet/BottomSheet';
import {TUTORIAL_MISSION_META} from '@/screens/TutorialMissionScreen/constants';

interface MissionItemCollectedBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
}

/**
 * 미션 2 (관심있는 저장리스트 저장하기) 완료 시 외출템 2 수집 팝업.
 */
export default function MissionItemCollectedBottomSheet({
  isVisible,
  onClose,
}: MissionItemCollectedBottomSheetProps) {
  const meta = TUTORIAL_MISSION_META[TutorialMissionTypeDto.SavePlaceList];
  return (
    <BottomSheet isVisible={isVisible} onPressBackground={onClose}>
      <ContentsContainer>
        <ItemImageWrapper>
          <Image
            source={meta.itemImage}
            style={{width: 120, height: 120}}
            resizeMode="contain"
          />
        </ItemImageWrapper>
        <Title>{meta.collectPopupTitle}</Title>
        <Description>{meta.collectPopupDescription}</Description>
        <SccButton
          text="다음 미션 보러 가기"
          elementName="tutorial_mission_2_collected_confirm"
          onPress={onClose}
          buttonColor="brand40"
          textColor="white"
          fontFamily={font.pretendardSemibold}
          height={48}
          style={{borderRadius: 14, marginTop: 12}}
        />
      </ContentsContainer>
    </BottomSheet>
  );
}

const ContentsContainer = styled.View`
  padding: 20px 20px 32px;
`;

const ItemImageWrapper = styled.View`
  align-items: center;
  padding-top: 16px;
  padding-bottom: 12px;
`;

const Title = styled.Text`
  font-family: ${font.pretendardBold};
  font-size: 20px;
  line-height: 28px;
  letter-spacing: -0.4px;
  color: ${color.black};
  text-align: center;
`;

const Description = styled.Text`
  margin-top: 6px;
  font-family: ${font.pretendardRegular};
  font-size: 16px;
  line-height: 24px;
  letter-spacing: -0.32px;
  color: ${color.gray70};
  text-align: center;
`;
