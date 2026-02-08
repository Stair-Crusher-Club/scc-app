import React from 'react';
import {View} from 'react-native';
import styled from 'styled-components/native';

import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
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
    <View>
      <RequestButton
        elementName="accessibility_info_request_button"
        logParams={{
          place_id: placeId,
          is_requested: isRequested,
        }}
        onPress={handlePress}>
        <RequestText isRequested={isRequested}>
          {isRequested ? '정보 요청됨' : '정보 요청하기'}
        </RequestText>
      </RequestButton>
    </View>
  );
}

const RequestButton = styled(SccPressable)`
  padding-horizontal: 8px;
  padding-vertical: 4px;
  border-radius: 4px;
  background-color: ${color.gray10};
`;

const RequestText = styled.Text<{isRequested?: boolean}>`
  font-size: 12px;
  font-family: ${font.pretendardMedium};
  color: ${({isRequested}) => (isRequested ? color.brandColor : color.gray70)};
`;
