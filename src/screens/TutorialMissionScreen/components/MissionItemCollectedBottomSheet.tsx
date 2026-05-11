import React from 'react';
import {Image} from 'react-native';
import styled from 'styled-components/native';

import {SccButton} from '@/components/atoms';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {TutorialMissionTypeDto} from '@/generated-sources/openapi';
import BottomSheet from '@/modals/BottomSheet/BottomSheet';

import {TUTORIAL_MISSION_META} from '../constants';

interface MissionItemCollectedBottomSheetProps {
  isVisible: boolean;
  missionType: TutorialMissionTypeDto;
  onClose: () => void;
}

/**
 * 메인 미션 외출템 수집 팝업 (TutorialMissionScreen 내부에서 progress diff로 트리거).
 * 미션 1, 2는 각 화면에서도 표시되지만, TutorialMissionScreen으로 돌아왔을 때
 * 미션 3 (도움이 돼요), 미션 4 (리뷰)의 외출템 수집은 이 컴포넌트에서 노출한다.
 */
export default function MissionItemCollectedBottomSheet({
  isVisible,
  missionType,
  onClose,
}: MissionItemCollectedBottomSheetProps) {
  const meta = TUTORIAL_MISSION_META[missionType];
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
          text="확인"
          elementName="tutorial_mission_item_collected_confirm"
          logParams={{mission_type: missionType}}
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
