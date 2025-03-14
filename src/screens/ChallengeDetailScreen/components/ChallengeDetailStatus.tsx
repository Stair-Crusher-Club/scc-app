import React from 'react';

import {ChallengeDto, ChallengeStatusDto} from '@/generated-sources/openapi';

import ChallengeDetailClosedStatus from './ChallengeDetailClosedStatus';
import ChallengeDetailInProgressStatus from './ChallengeDetailInProgressStatus';

interface PropsType {
  challenge: ChallengeDto;
}

const ChallengeDetailStatus = ({challenge}: PropsType) => {
  switch (challenge.status) {
    case ChallengeStatusDto.InProgress:
      return (
        <ChallengeDetailInProgressStatus
          numberOfContributions={challenge.contributionsCount}
          milestones={challenge.milestones}
          goal={challenge.goal}
        />
      );
    case ChallengeStatusDto.Closed:
      return <ChallengeDetailClosedStatus />;
    case ChallengeStatusDto.Upcoming:
      return null;
  }
};

export default ChallengeDetailStatus;
