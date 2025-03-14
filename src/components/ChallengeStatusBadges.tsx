import React from 'react';
import styled from 'styled-components/native';

import {ChallengeStatusDto} from '@/generated-sources/openapi';

import {ChallengeStatusBadge, MyChallengeBadge} from './ChallengeStatusBadge';

interface PropsType {
  style?: any;
  status: ChallengeStatusDto[];
  isMyChallenge: boolean;
}

const ChallengeStatusBadges = ({style, status, isMyChallenge}: PropsType) => {
  return (
    <Container style={style}>
      {status.map(s => (
        <ChallengeStatusBadge status={s} key={s} />
      ))}
      {isMyChallenge && <MyChallengeBadge />}
    </Container>
  );
};

export default ChallengeStatusBadges;

const Container = styled.View({
  flexDirection: 'row',
  gap: 10,
});
