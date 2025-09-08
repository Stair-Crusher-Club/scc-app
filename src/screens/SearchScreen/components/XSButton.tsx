import React, {useState} from 'react';
import styled from 'styled-components/native';

import PlusIcon from '@/assets/icon/ic_small_plus.svg';
import {SccTouchableHighlight} from '@/components/SccTouchableHighlight';
import {color} from '@/constant/color';
import {font} from '@/constant/font';

export default function XSButton({
  text,
  isDisabled,
  onPress,
  elementName,
  hasPlusButton,
}: {
  text: string;
  isDisabled?: boolean;
  onPress: () => void;
  elementName: string;
  hasPlusButton?: boolean;
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
      onPress={isDisabled ? undefined : onPress}
      status={status}
      onHideUnderlay={() => {
        setStatus('normal');
      }}
      onShowUnderlay={() => {
        setStatus('focus');
      }}>
      <ButtonContent>
        {hasPlusButton && (
          <PlusIcon
            width={14}
            height={14}
            color={
              status === 'normal'
                ? color.brandColor
                : status === 'focus'
                  ? color.link
                  : color.gray70
            }
          />
        )}
        <ButtonText status={status}>{text}</ButtonText>
      </ButtonContent>
    </Container>
  );
}

const Container = styled(SccTouchableHighlight)<{
  status: 'normal' | 'focus' | 'disabled';
}>`
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
  width: 60px;
  border-width: ${({status}) =>
    status === 'normal' || status === 'focus' ? '1px' : '0'};
  border-radius: 8px;
  padding: 5px 8px;
`;

const ButtonContent = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 0px;
`;

const ButtonText = styled.Text<{
  status: 'normal' | 'focus' | 'disabled';
}>`
  font-family: ${font.pretendardMedium};
  padding-light: 3px;
  font-size: 12px;
  color: ${({status}) =>
    status === 'normal'
      ? color.brandColor
      : status === 'focus'
        ? color.link
        : color.gray70};
`;
