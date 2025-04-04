import React, {useState} from 'react';
import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';

export default function Button({
  text,
  isDisabled,
  size,
  onPress,
  fillParent,
}: {
  text: string;
  size: 'xs' | 'sm' | 'md' | 'lg';
  isDisabled?: boolean;
  onPress: () => void;
  fillParent?: boolean;
}) {
  const [touchStatus, setStatus] = useState<'normal' | 'focus' | 'disabled'>(
    'normal',
  );
  const status = isDisabled ? 'disabled' : touchStatus;

  return (
    <Container
      activeOpacity={1}
      underlayColor={'transparent'}
      fillParent={fillParent}
      size={size}
      onPress={isDisabled ? undefined : onPress}
      status={status}
      onHideUnderlay={() => {
        setStatus('normal');
      }}
      onShowUnderlay={() => {
        setStatus('focus');
      }}>
      <ButtonText size={size} status={status}>
        {text}
      </ButtonText>
    </Container>
  );
}

const Container = styled.TouchableHighlight<{
  status: 'normal' | 'focus' | 'disabled';
  size: 'xs' | 'sm' | 'md' | 'lg';
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
  border-radius: ${({size}) => (size === 'xs' ? '10px' : '14px')};
  padding: ${({size}) =>
    size === 'xs'
      ? '7px 12px'
      : size === 'sm'
      ? '8px 12px'
      : size === 'md'
      ? '10px 20px'
      : '12px 24px'};
`;

const ButtonText = styled.Text<{
  size: 'xs' | 'sm' | 'md' | 'lg';
  status: 'normal' | 'focus' | 'disabled';
}>`
  font-family: ${font.pretendardMedium};
  font-size: ${({size}) =>
    size === 'xs'
      ? '12px'
      : size === 'sm'
      ? '14px'
      : size === 'md'
      ? '16px'
      : '16px'};
  color: ${({status}) =>
    status === 'normal'
      ? color.brandColor
      : status === 'focus'
      ? color.link
      : color.gray70};
`;
