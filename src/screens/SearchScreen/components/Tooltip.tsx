import React from 'react';
import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';

export default function Tooltip({
  text,
  tailPosition = 'center',
}: {
  text: string;
  tailPosition?: 'center' | number;
}) {
  return (
    <Wrapper isCenter={tailPosition === 'center'}>
      <Container>
        <Text>{text}</Text>
      </Container>
      <TooltipTail
        tailOffset={tailPosition === 'center' ? undefined : tailPosition}
      />
    </Wrapper>
  );
}

const Wrapper = styled.View<{isCenter: boolean}>`
  width: 100%;
  flex-direction: column;
  align-items: center;
  ${({isCenter}) =>
    isCenter &&
    `
    align-items: center;
  `}
`;

const Container = styled.View`
  background-color: ${color.brandColor};
  align-items: center;
  border-radius: 8px;
  padding: 6px 8px;
`;

const Text = styled.Text`
  font-size: 12px;
  font-family: ${font.pretendardMedium};
  color: ${color.white};
`;

const TooltipTail = styled.View<{tailOffset: number | undefined}>`
  width: 10px;
  height: 10px;
  background-color: ${() => color.brandColor};
  transform: rotate(45deg);
  position: absolute;
  ${({tailOffset}) =>
    tailOffset !== undefined &&
    `
    left: ${tailOffset - 5}px;
  `}
  bottom: -5px;
`;
