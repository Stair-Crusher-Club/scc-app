import React, {useState} from 'react';
import {ScrollView} from 'react-native';

import {SafeAreaWrapper} from '@/components/SafeAreaWrapper';
import {ListChallengesItemDto} from '@/generated-sources/openapi';

import ChallengeUpcomingBottomSheet from '../HomeScreen/ChallengeUpcomingBottomSheet';
import ChallengeSection from '../HomeScreen/sections/ChallengeSection';

export interface ChallengeScreenParams {}

const ChallengeScreen = () => {
  const [selectedUpcomingChallenge, setSelectedUpcomingChallenge] = useState<
    ListChallengesItemDto | undefined
  >();

  return (
    <ScrollView className="bg-white">
      <SafeAreaWrapper edges={['top']}>
        <ChallengeSection
          onPressUpcomingChallenge={challenge => {
            setSelectedUpcomingChallenge(challenge);
          }}
        />
      </SafeAreaWrapper>
      <ChallengeUpcomingBottomSheet
        selectedUpcomingChallenge={selectedUpcomingChallenge}
        onPressConfirmButton={() => {
          setSelectedUpcomingChallenge(undefined);
        }}
      />
    </ScrollView>
  );
};

export default ChallengeScreen;
