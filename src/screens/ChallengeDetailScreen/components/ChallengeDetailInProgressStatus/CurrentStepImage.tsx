import React from 'react';
import styled from 'styled-components/native';

interface CurrentStepImageProps {
  style?: any;
  step: number;
}

export const getCurrentStepImageSize = (
  step: number,
): {width: number; height: number} => {
  switch (step) {
    case 1:
      return {width: 60, height: 60};
    case 2:
      return {width: 70, height: 60};
  }
  return {width: 84, height: 60};
};

const CurrentStepImage = ({style, step}: CurrentStepImageProps) => {
  switch (step) {
    case 1:
      return (
        <StepImage
          style={style}
          step={step}
          source={require('../../../../assets/img/img_challenge_step1.png')}
        />
      );
    case 2:
      return (
        <StepImage
          style={style}
          step={step}
          source={require('../../../../assets/img/img_challenge_step2.png')}
        />
      );
    default:
      return (
        <StepImage
          style={style}
          step={step}
          source={require('../../../../assets/img/img_challenge_step3.png')}
        />
      );
  }
};

export default CurrentStepImage;

const StepImage = styled.Image<{step: number}>`
  width: ${({step}) => getCurrentStepImageSize(step).width}px;
  height: 60px;
`;
