import React from 'react';
import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';
import AstronautsBottomSheet from '@/modals/AstronautsBottomSheet/AstronautsBottomSheet';

interface RequireBuildingAccessibilityBottomSheetProps {
  isVisible: boolean;
  onPressCloseButton: () => void;
  onPressConfirmButton: () => void;
  isFirstFloor: boolean | undefined;
}

const RequireBuildingAccessibilityBottomSheet = ({
  isVisible,
  onPressCloseButton,
  onPressConfirmButton,
  isFirstFloor,
}: RequireBuildingAccessibilityBottomSheetProps) => {
  return (
    <AstronautsBottomSheet
      isVisible={isVisible}
      title={
        isFirstFloor
          ? '정복할 수 있는\n건물을 발견했어요!'
          : '높은 곳에 있는 장소를\n정복했어요!'
      }
      confirmButtonText={isFirstFloor ? '건물 정복하기' : '정보 등록하기'}
      onPressConfirmButton={onPressConfirmButton}
      closeButtonText="나중에"
      onPressCloseButton={onPressCloseButton}>
      {isFirstFloor ? (
        <Message>이 건물도 지금 바로 정복할까요?</Message>
      ) : (
        <Message>
          {'이 장소에 가려면\n'}
          <Emphasis>엘리베이터, 입구 정보</Emphasis>
          {'가 꼭 필요해요.\n'}
          지금 바로등록할까요?
        </Message>
      )}
    </AstronautsBottomSheet>
  );
};

export default RequireBuildingAccessibilityBottomSheet;

const Message = styled.Text({
  fontSize: 20,
  fontFamily: font.pretendardBold,
  color: 'black',
  lineHeight: '32px',
  fontWeight: 'bold',
  textAlign: 'center',
  letterSpacing: -0.5,
});
const Emphasis = styled(Message)({
  color: color.brandColor,
});
