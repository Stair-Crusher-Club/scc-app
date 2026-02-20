import React from 'react';
import styled from 'styled-components/native';

import FlagIcon from '@/assets/icon/ic_flag_colored.svg';
import PencilIcon from '@/assets/icon/ic_pencil_colored.svg';
import WheelchairIcon from '@/assets/icon/ic_wheelchair_colored.svg';
import {SccPressable} from '@/components/SccPressable';
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
        <MenuItem
          elementName="place_detail_registration_sheet_place"
          onPress={() => {
            onClose();
            onPressPlaceRegister();
          }}
          disabled={!isAccessibilityRegistrable}>
          <FlagIcon width={16} height={16} />
          <MenuItemText>매장 접근성 등록하기</MenuItemText>
        </MenuItem>
        <Divider />
        <MenuItem
          elementName="place_detail_registration_sheet_building"
          onPress={() => {
            onClose();
            onPressBuildingRegister();
          }}
          disabled={!isAccessibilityRegistrable}>
          <FlagIcon width={16} height={16} />
          <MenuItemText>건물 접근성 등록하기</MenuItemText>
        </MenuItem>
        <Divider />
        <MenuItem
          elementName="place_detail_registration_sheet_review"
          onPress={() => {
            onClose();
            onPressReviewRegister();
          }}
          disabled={!isAccessibilityRegistrable}>
          <PencilIcon width={16} height={16} />
          <MenuItemText>내부 리뷰 등록하기</MenuItemText>
        </MenuItem>
        <Divider />
        <MenuItem
          elementName="place_detail_registration_sheet_toilet"
          onPress={() => {
            onClose();
            onPressToiletRegister();
          }}
          disabled={!isAccessibilityRegistrable}>
          <WheelchairIcon width={16} height={16} />
          <MenuItemText>화장실 정보 등록하기</MenuItemText>
        </MenuItem>
      </Container>
    </BottomSheet>
  );
}

const Container = styled.View`
  background-color: ${color.white};
`;

const MenuItem = styled(SccPressable)`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  height: 60px;
  padding: 0 20px;
  gap: 10px;
  opacity: ${({disabled}: {disabled?: boolean | null}) => (disabled ? 0.5 : 1)};
`;

const MenuItemText = styled.Text`
  font-family: ${font.pretendardMedium};
  font-size: 15px;
  line-height: 22px;
  letter-spacing: -0.3px;
  color: ${color.black};
`;

const Divider = styled.View`
  height: 1px;
  background-color: ${color.gray15};
`;
