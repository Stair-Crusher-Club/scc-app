import React from 'react';
import styled from 'styled-components/native';

import {font} from '@/constant/font';

export default function AvailableLabel({
  availableState,
  text,
}: {
  availableState: 'AVAILABLE' | 'UNAVAILABLE' | 'UNKNOWN';
  text: string;
}) {
  return (
    <Label availableState={availableState}>
      <LabelText availableState={availableState}>{text}</LabelText>
    </Label>
  );
}

const Label = styled.View<{
  availableState: 'AVAILABLE' | 'UNAVAILABLE' | 'UNKNOWN';
}>`
  border-radius: 8px;
  background-color: ${({availableState}) =>
    availableState === 'AVAILABLE'
      ? '#D9FFE6'
      : availableState === 'UNAVAILABLE'
        ? '#FEECEC'
        : '#EFF0F2'};
  padding: 4px 8px 4px 8px;
`;

const LabelText = styled.Text<{
  availableState: 'AVAILABLE' | 'UNAVAILABLE' | 'UNKNOWN';
}>`
  font-size: 12px;
  font-family: ${() => font.pretendardMedium};
  color: ${({availableState}) =>
    availableState === 'AVAILABLE'
      ? '#009632'
      : availableState === 'UNAVAILABLE'
        ? '#E52222'
        : '#24262B'};
`;
