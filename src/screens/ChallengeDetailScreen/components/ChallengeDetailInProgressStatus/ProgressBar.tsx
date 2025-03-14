import React from 'react';
import styled from 'styled-components/native';

import {color} from '@/constant/color';

interface ProgressBarProps {
  progressPx: number;
  style?: any;
}

const ProgressBar = ({progressPx, style}: ProgressBarProps) => {
  return (
    <Container style={style}>
      <InProgressBar progress={progressPx} />
    </Container>
  );
};

export default ProgressBar;

const Container = styled.View({
  width: '100%',
  height: 6,
  background: color.gray20,
  borderRadius: 3,
});

const InProgressBar = styled.View<{progress: number}>`
  width: ${({progress}) => progress}px;
  height: 6px;
  background: ${color.brandColor};
  border-radius: 3px;
`;
