import React, {useState} from 'react';
import {ScrollView} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {ListChallengesItemDto} from '@/generated-sources/openapi';

import ChallengeUpcomingBottomSheet from '../HomeScreen/ChallengeUpcomingBottomSheet';
import ChallengeSection from '../HomeScreen/sections/ChallengeSection';

export interface ChallengeScreenParams {}

const ChallengeScreen = () => {
  const [selectedUpcomingChallenge, setSelectedUpcomingChallenge] = useState<
    ListChallengesItemDto | undefined
  >();

  return (
    <ScrollView style={{backgroundColor: 'white'}}>
      <SafeAreaView edges={['top']}>
        <ChallengeSection
          onPressUpcomingChallenge={challenge => {
            setSelectedUpcomingChallenge(challenge);
          }}
        />
      </SafeAreaView>
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
