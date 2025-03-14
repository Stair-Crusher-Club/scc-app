import React from 'react';
import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';

import MilestoneSuccess from './MilestoneSuccess';

interface Props {
  style?: any;
  numberOfContributions: number;
  step: number;
  isComplete: boolean; // 처음(0)과 목표 숫자에는 달성했는지 여부를 보여주지 않는다.
  onSizeChanged?: ({width, height}: {width: number; height: number}) => void;
}

const ContributionMilestone = ({
  style,
  numberOfContributions,
  step,
  isComplete,
  onSizeChanged,
}: Props) => {
  return (
    <Container
      style={style}
      onLayout={event => {
        if (onSizeChanged) {
          onSizeChanged({
            width: event.nativeEvent.layout.width,
            height: event.nativeEvent.layout.width,
          });
        }
      }}>
      <MilestoneText allowFontScaling={false}>
        {`${numberOfContributions}개`}
      </MilestoneText>
      {isComplete && <MilestoneSuccess step={step} />}
    </Container>
  );
};

export default ContributionMilestone;

const Container = styled.View({
  flexDirection: 'column',
  alignItems: 'center',
});

const MilestoneText = styled.Text({
  color: color.gray90,
  fontSize: 16,
  fontFamily: font.pretendardMedium,
});
