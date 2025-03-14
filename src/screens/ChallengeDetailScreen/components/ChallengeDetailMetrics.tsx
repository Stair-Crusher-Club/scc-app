import React from 'react';
import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {EpochMillisTimestamp} from '@/generated-sources/openapi';
import {ChallengeDateFormat} from '@/utils/ChallengeDateFormat';

import ChallengeDetailMetricsContributionRow from './ChallengeDetailMetricsContributionRow';
import ChallengeDetailMetricsRow from './ChallengeDetailMetricsRow';

interface ChallengeDetailMetricsProps {
  endsAt?: EpochMillisTimestamp;
  numberOfParticipations: number;
  goalOfContributions: number;
  numberOfContributions: number;
}

const ChallengeDetailMetrics = ({
  endsAt,
  numberOfParticipations,
  goalOfContributions,
  numberOfContributions,
}: ChallengeDetailMetricsProps) => {
  return (
    <Container>
      <ChallengeDetailMetricsRow
        title="진행기간"
        value={ChallengeDateFormat.formatChallengeDetailEndsAt(endsAt)}
      />
      <RowSpacer />
      <ChallengeDetailMetricsRow
        title="참여자"
        value={`${numberOfParticipations}명`}
      />
      <RowSpacer />
      <ChallengeDetailMetricsContributionRow
        title="정복한 장소"
        numberOfContributions={numberOfContributions}
        goalOfContributiuons={goalOfContributions}
      />
    </Container>
  );
};

export default ChallengeDetailMetrics;

const Container = styled.View({
  flexDirection: 'column',
  background: color.gray10,
  padding: 20,
  borderRadius: 8,
  marginHorizontal: 25,
});

const RowSpacer = styled.View({
  height: 8,
});
