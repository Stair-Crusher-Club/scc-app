import React from 'react';
import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {ChallengeRankDto} from '@/generated-sources/openapi';

import ChallengeDetailQuestSection from '../ChallengeDetailQuestSection';
import MyRank from './MyRank';
import TopTenRank from './TopTenRank';

interface PropsType {
  ranks: ChallengeRankDto[];
  myRank?: ChallengeRankDto;
}

const ChallengeDetailRankSection = ({ranks, myRank}: PropsType) => {
  return (
    <Container>
      <Separator />
      <ChallengeDetailQuestSection />
      {myRank && <MyRank myRank={myRank} />}
      <TopTenRank ranks={ranks} />
    </Container>
  );
};

export default ChallengeDetailRankSection;

const Separator = styled.View({
  width: '100%',
  height: 13,
  backgroundColor: color.gray10,
});

const Container = styled.View({
  width: '100%',
  backgroundColor: 'white',
  gap: 36,
});
