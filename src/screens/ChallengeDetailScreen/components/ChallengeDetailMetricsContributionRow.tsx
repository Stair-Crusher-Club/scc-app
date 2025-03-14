import React from 'react';
import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';

interface ChallengeDetailMetricsRowProps {
  title: string;
  numberOfContributions: number;
  goalOfContributiuons: number;
}

const ChallengeDetailMetricsContributionRow = ({
  title,
  numberOfContributions,
  goalOfContributiuons,
}: ChallengeDetailMetricsRowProps) => {
  return (
    <Container>
      <Title numberOfLines={1}>{title}</Title>
      <Value numberOfLines={1} ellipsizeMode="tail">
        <Contribution>{numberOfContributions}</Contribution>
        {` / ${goalOfContributiuons}`}
      </Value>
    </Container>
  );
};

export default ChallengeDetailMetricsContributionRow;

const Container = styled.View({
  flexDirection: 'row',
});

const Title = styled.Text({
  flex: 1,
  color: color.gray90,
  fontSize: 16,
  fontFamily: font.pretendardRegular,
});

const Contribution = styled.Text({
  color: color.brandColor,
  fontFamily: font.pretendardBold,
});

const Value = styled.Text({
  color: color.gray90,
  fontSize: 16,
  fontFamily: font.pretendardRegular,
});
