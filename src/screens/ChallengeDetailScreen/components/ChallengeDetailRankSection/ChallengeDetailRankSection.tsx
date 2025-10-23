import React from 'react';
import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {ChallengeQuestDto, ChallengeRankDto} from '@/generated-sources/openapi';

import ChallengeDetailQuestSection from '../ChallengeDetailQuestSection';
import MyRank from './MyRank';
import TopTenRank from './TopTenRank';
import LastMonthRankingSection from './LastMonthRankingSection';

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
    <Container>
      <Separator />
      {quests && quests?.length > 0 && (
        <ChallengeDetailQuestSection quests={quests} />
      )}
      {myRank && <MyRank myRank={myRank} />}
      {ranks && ranks.length > 0 && <TopTenRank ranks={ranks} />}
      {lastMonthRankImageUrl && (
        <LastMonthRankingSection imageUrl={lastMonthRankImageUrl} />
      )}
    </Container>
  );
};

export default ChallengeDetailRankSection;

const Separator = styled.View({
  width: '100%',
  height: 8,
  backgroundColor: color.gray10,
});

const Container = styled.View({
  width: '100%',
  backgroundColor: 'white',
  gap: 36,
});
