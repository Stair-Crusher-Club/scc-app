import React from 'react';
import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {ChallengeRankDto} from '@/generated-sources/openapi';

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
  marginBottom: 33,
});

const Container = styled.View({
  width: '100%',
  backgroundColor: 'white',
});
