import React from 'react';

import {ChallengeDto, ChallengeStatusDto} from '@/generated-sources/openapi';

import ChallengeDetailClosedStatus from './ChallengeDetailClosedStatus';
import ChallengeProgressBar from './ChallengeProgressBar';

interface PropsType {
  challenge: ChallengeDto;
}

const ChallengeDetailStatus = ({challenge}: PropsType) => {
  switch (challenge.status) {
    case ChallengeStatusDto.InProgress:
      return (
        <ChallengeProgressBar
          contributionsCount={challenge.contributionsCount}
          goal={challenge.goal}
          milestones={challenge.milestones}
        />
      );
    case ChallengeStatusDto.Closed:
      return <ChallengeDetailClosedStatus />;
    case ChallengeStatusDto.Upcoming:
      return null;
    default:
      return challenge.status satisfies never;
  }
};

export default ChallengeDetailStatus;
