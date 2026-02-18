import React from 'react';
import styled from 'styled-components/native';

import {font} from '@/constant/font';
import {AccessibilityInfoDto} from '@/generated-sources/openapi';
import AstronautsBottomSheet from '@/modals/AstronautsBottomSheet/AstronautsBottomSheet';

interface RegisterCompleteBottomSheetProps {
  isVisible: boolean;
  accessibilityPost?: AccessibilityInfoDto;
  event?: 'submit-place' | 'submit-building';
  onPressConfirmButton: () => void;
}

const RegisterCompleteBottomSheet = ({
  isVisible,
  accessibilityPost,
  event,
  onPressConfirmButton,
}: RegisterCompleteBottomSheetProps) => {
  const conqueror =
    event === 'submit-place'
      ? accessibilityPost?.placeAccessibility?.registeredUserName
      : accessibilityPost?.buildingAccessibility?.registeredUserName;
  return (
    <AstronautsBottomSheet
      isVisible={isVisible}
      title="계단정보를 등록했어요!"
      subtitle={
        <Subtitle>
          정복자 <Conqueror>{conqueror ?? ''}</Conqueror>
        </Subtitle>
      }
      confirmButtonText="확인"
      onPressConfirmButton={onPressConfirmButton}>
      <Message>
        {'계단정복지도가 채워지는 중!🚩\n계단정복에 함께 해주셔서 감사합니다.'}
      </Message>
    </AstronautsBottomSheet>
  );
};

export default RegisterCompleteBottomSheet;

const Message = styled.Text({
  fontSize: 20,
  fontFamily: font.pretendardBold,
  color: 'black',
  lineHeight: '32px',
  fontWeight: 'bold',
  textAlign: 'center',
  letterSpacing: -0.5,
});
const Subtitle = styled.Text({
  fontSize: 20,
  fontFamily: font.pretendardMedium,
  color: 'white',
  textAlign: 'center',
  letterSpacing: -0.5,
});
const Conqueror = styled(Subtitle)({
  fontFamily: font.pretendardBold,
  marginLeft: 10,
});
