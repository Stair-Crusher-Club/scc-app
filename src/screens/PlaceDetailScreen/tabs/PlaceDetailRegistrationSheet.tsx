import React from 'react';
import styled from 'styled-components/native';

import {SccTouchableOpacity} from '@/components/SccTouchableOpacity';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import BottomSheet from '@/modals/BottomSheet';

interface Props {
  isVisible: boolean;
  onClose: () => void;
  onPressPlaceRegister: () => void;
  onPressBuildingRegister: () => void;
  onPressReviewRegister: () => void;
  onPressToiletRegister: () => void;
  isAccessibilityRegistrable?: boolean;
}

export default function PlaceDetailRegistrationSheet({
  isVisible,
  onClose,
  onPressPlaceRegister,
  onPressBuildingRegister,
  onPressReviewRegister,
  onPressToiletRegister,
  isAccessibilityRegistrable,
}: Props) {
  return (
    <BottomSheet isVisible={isVisible} onPressBackground={onClose}>
      <Container>
        <Title>정보 등록하기</Title>
        <OptionList>
          <OptionItem
            elementName="place_detail_registration_sheet_place"
            onPress={() => {
              onClose();
              onPressPlaceRegister();
            }}
            disabled={!isAccessibilityRegistrable}>
            <OptionEmoji>🏪</OptionEmoji>
            <OptionTextContainer>
              <OptionTitle>매장 접근성 정보</OptionTitle>
              <OptionDescription>출입구, 계단, 경사로 등</OptionDescription>
            </OptionTextContainer>
          </OptionItem>
          <OptionItem
            elementName="place_detail_registration_sheet_building"
            onPress={() => {
              onClose();
              onPressBuildingRegister();
            }}
            disabled={!isAccessibilityRegistrable}>
            <OptionEmoji>🏢</OptionEmoji>
            <OptionTextContainer>
              <OptionTitle>건물 접근성 정보</OptionTitle>
              <OptionDescription>건물 입구, 엘리베이터 등</OptionDescription>
            </OptionTextContainer>
          </OptionItem>
          <OptionItem
            elementName="place_detail_registration_sheet_review"
            onPress={() => {
              onClose();
              onPressReviewRegister();
            }}
            disabled={!isAccessibilityRegistrable}>
            <OptionEmoji>📝</OptionEmoji>
            <OptionTextContainer>
              <OptionTitle>방문 리뷰</OptionTitle>
              <OptionDescription>
                좌석, 주문방법, 내부 공간 등
              </OptionDescription>
            </OptionTextContainer>
          </OptionItem>
          <OptionItem
            elementName="place_detail_registration_sheet_toilet"
            onPress={() => {
              onClose();
              onPressToiletRegister();
            }}
            disabled={!isAccessibilityRegistrable}>
            <OptionEmoji>🚻</OptionEmoji>
            <OptionTextContainer>
              <OptionTitle>장애인 화장실 정보</OptionTitle>
              <OptionDescription>화장실 위치, 시설 정보 등</OptionDescription>
            </OptionTextContainer>
          </OptionItem>
        </OptionList>
      </Container>
    </BottomSheet>
  );
}

const Container = styled.View`
  padding: 24px 20px;
  gap: 20px;
`;

const Title = styled.Text`
  font-family: ${font.pretendardBold};
  font-size: 18px;
  line-height: 26px;
  color: ${color.gray80};
`;

const OptionList = styled.View`
  gap: 8px;
`;

const OptionItem = styled(SccTouchableOpacity)`
  flex-direction: row;
  align-items: center;
  padding: 16px;
  border-radius: 12px;
  background-color: ${color.gray5};
  gap: 12px;
  opacity: ${({disabled}) => (disabled ? 0.5 : 1)};
`;

const OptionEmoji = styled.Text`
  font-size: 24px;
`;

const OptionTextContainer = styled.View`
  flex: 1;
  gap: 2px;
`;

const OptionTitle = styled.Text`
  font-family: ${font.pretendardSemibold};
  font-size: 16px;
  line-height: 24px;
  color: ${color.gray80};
`;

const OptionDescription = styled.Text`
  font-family: ${font.pretendardRegular};
  font-size: 13px;
  line-height: 18px;
  color: ${color.gray50};
`;
