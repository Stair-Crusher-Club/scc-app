import React from 'react';
import {View} from 'react-native';

import {ChallengeQuestDto, ChallengeRankDto} from '@/generated-sources/openapi';

import ChallengeDetailQuestSection from '../ChallengeDetailQuestSection';
import LastMonthRankingSection from './LastMonthRankingSection';
import MyRank from './MyRank';
import TopTenRank from './TopTenRank';

interface PropsType {
  ranks: ChallengeRankDto[];
  myRank?: ChallengeRankDto;
  quests?: ChallengeQuestDto[];
  lastMonthRankImageUrl?: string;
}

const ChallengeDetailRankSection = ({
  ranks,
  myRank,
  quests,
  lastMonthRankImageUrl,
}: PropsType) => {
  const hasContent =
    (ranks && ranks.length > 0) ||
    myRank ||
    (quests && quests.length > 0) ||
    lastMonthRankImageUrl;

  if (!hasContent) {
    return null;
  }

  return (
    <View className="w-full bg-white">
      <View className="h-[6px] bg-gray-v2-15" />
      <View className="py-[32px] gap-[44px]">
        {quests && quests?.length > 0 && (
          <ChallengeDetailQuestSection quests={quests} />
        )}
        {myRank && <MyRank myRank={myRank} />}
        {ranks && ranks.length > 0 && <TopTenRank ranks={ranks} />}
        {lastMonthRankImageUrl && (
          <LastMonthRankingSection imageUrl={lastMonthRankImageUrl} />
        )}
      </View>
    </View>
  );
};

export default ChallengeDetailRankSection;
