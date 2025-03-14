import React from 'react';
import styled from 'styled-components/native';

import CheckIcon from '@/assets/icon/ic_circle_check.svg';
import {color} from '@/constant/color';
import {font} from '@/constant/font';

interface Props {
  step: number;
}

const MilestoneSuccess = ({step}: Props) => {
  return (
    <Container>
      <CheckIcon width={14} height={14} />
      <SuccessText allowFontScaling={false}>{`${step}차 달성`}</SuccessText>
    </Container>
  );
};

export default MilestoneSuccess;

const Container = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
});

const SuccessText = styled.Text({
  color: color.brandColor,
  fontSize: 12,
  fontFamily: font.pretendardMedium,
  marginLeft: 2,
});
