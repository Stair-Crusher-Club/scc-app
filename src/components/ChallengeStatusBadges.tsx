import React from 'react';
import {StyleProp, View, ViewStyle} from 'react-native';

import {ChallengeStatusDto} from '@/generated-sources/openapi';

import {ChallengeStatusBadge, MyChallengeBadge} from './ChallengeStatusBadge';

interface PropsType {
  style?: StyleProp<ViewStyle>;
  status: ChallengeStatusDto[];
  isMyChallenge: boolean;
}

const ChallengeStatusBadges = ({style, status, isMyChallenge}: PropsType) => {
  return (
    <View style={style} className="flex-row gap-[8px]">
      {status.map(s => (
        <ChallengeStatusBadge status={s} key={s} />
      ))}
      {isMyChallenge && <MyChallengeBadge />}
    </View>
  );
};

export default ChallengeStatusBadges;
