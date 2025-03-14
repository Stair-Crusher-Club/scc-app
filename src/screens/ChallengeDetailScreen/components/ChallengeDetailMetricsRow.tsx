import React from 'react';
import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';

interface ChallengeDetailMetricsRowProps {
  title: string;
  value: string;
}

const ChallengeDetailMetricsRow = ({
  title,
  value,
}: ChallengeDetailMetricsRowProps) => {
  return (
    <Container>
      <Title numberOfLines={1}>{title}</Title>
      <Value numberOfLines={1} ellipsizeMode="tail">
        {value}
      </Value>
    </Container>
  );
};

export default ChallengeDetailMetricsRow;

const Container = styled.View({
  flexDirection: 'row',
});

const Title = styled.Text({
  flex: 1,
  color: color.gray90,
  fontSize: 16,
  fontFamily: font.pretendardRegular,
});

const Value = styled.Text({
  color: color.gray90,
  fontSize: 16,
  fontFamily: font.pretendardRegular,
});
