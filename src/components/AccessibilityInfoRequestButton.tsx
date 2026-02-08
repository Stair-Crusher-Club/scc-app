import React from 'react';
import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {SccTouchableOpacity} from '@/components/SccTouchableOpacity';
import {useToggleAccessibilityInfoRequest} from '@/hooks/useToggleAccessibilityInfoRequest';
import {useCheckAuth} from '@/utils/checkAuth';

interface Props {
  placeId: string;
  isRequested?: boolean;
}

export default function AccessibilityInfoRequestButton({
  placeId,
  isRequested,
}: Props) {
  const checkAuth = useCheckAuth();
  const toggleRequest = useToggleAccessibilityInfoRequest();

  const handlePress = () => {
    checkAuth(() => {
      toggleRequest({
        currentIsRequested: isRequested,
        placeId,
      });
    });
  };

  return (
    <ButtonContainer
      elementName="accessibility_info_request_button"
      logParams={{placeId, isRequested}}
      activeOpacity={0.6}
      onPress={handlePress}
      isRequested={isRequested}>
      <RequestText isRequested={isRequested}>
        {isRequested ? '접근성 정보 요청한 장소' : '이 장소의 접근성 정보 요청하기'}
      </RequestText>
    </ButtonContainer>
  );
}

const ButtonContainer = styled(SccTouchableOpacity)<{isRequested?: boolean}>`
  padding: 5px 8px;
  border-radius: 8px;
  border-width: 1px;
  border-color: ${({isRequested}) =>
    isRequested ? color.brandColor : color.brandColor};
  background-color: ${({isRequested}) =>
    isRequested ? color.brandColor : 'transparent'};
`;

const RequestText = styled.Text<{isRequested?: boolean}>`
  font-size: 12px;
  font-family: ${font.pretendardMedium};
  color: ${({isRequested}) => (isRequested ? color.white : color.brandColor)};
`;
