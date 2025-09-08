import React, {useState} from 'react';
import styled from 'styled-components/native';

import {SccTouchableHighlight} from '@/components/SccTouchableHighlight';
import {color} from '@/constant/color';
import {font} from '@/constant/font';

export default function LGButton({
  text,
  isDisabled,
  onPress,
  fillParent,
  elementName,
}: {
  text: string;
  isDisabled?: boolean;
  onPress: () => void;
  fillParent?: boolean;
  elementName: string;
}) {
  const [touchStatus, setStatus] = useState<'normal' | 'focus' | 'disabled'>(
    'normal',
  );
  const status = isDisabled ? 'disabled' : touchStatus;

  return (
    <Container
      elementName={elementName}
      activeOpacity={1}
      underlayColor={'transparent'}
      fillParent={fillParent}
      onPress={isDisabled ? undefined : onPress}
      status={status}
      onHideUnderlay={() => {
        setStatus('normal');
      }}
      onShowUnderlay={() => {
        setStatus('focus');
      }}>
      <ButtonText status={status}>{text}</ButtonText>
    </Container>
  );
}

const Container = styled(SccTouchableHighlight)<{
  status: 'normal' | 'focus' | 'disabled';
  fillParent?: boolean;
}>`
  ${({fillParent}) => fillParent && 'width: 100%;'}
  justify-content: center;
  align-items: center;
  background-color: ${({status}) =>
    status === 'normal' || status === 'focus' ? 'transparent' : color.gray10};
  border-color: ${({status}) =>
    status === 'normal'
      ? color.brandColor
      : status === 'focus'
        ? color.link
        : 'transparent'};
  border-width: ${({status}) =>
    status === 'normal' || status === 'focus' ? '1px' : '0'};
  border-radius: 14px;
  padding: 12px 24px;
`;

const ButtonText = styled.Text<{
  status: 'normal' | 'focus' | 'disabled';
}>`
  font-family: ${font.pretendardMedium};
  font-size: 16px;
  color: ${({status}) =>
    status === 'normal'
      ? color.brandColor
      : status === 'focus'
        ? color.link
        : color.gray70};
`;
