import React from 'react';
import styled from 'styled-components/native';

import ChallengeRank from '@/components/ChallengeRank';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {ChallengeRankDto} from '@/generated-sources/openapi';

interface PropsType {
  ranks: ChallengeRankDto[];
}

const TopTenRank = ({ranks}: PropsType) => {
  return (
    <Container>
      <Title>챌린지 랭킹</Title>
      <Desc>랭킹 및 정복 개수는 10분마다 갱신됩니다.</Desc>
      <ListSection>
        {ranks.map((rank, index) => {
          return (
            <ChallengeRank
              key={rank.nickname}
              value={{...rank}}
              shouldShowUnderline={index < ranks.length - 1}
            />
          );
        })}
      </ListSection>
    </Container>
  );
};

export default TopTenRank;

const Container = styled.View({
  width: '100%',
  flexDirection: 'column',
  paddingHorizontal: 15,
});

const Title = styled.Text({
  color: color.black,
  fontSize: 20,
  fontFamily: font.pretendardBold,
  padding: 10,
});

const ListSection = styled.View({
  borderColor: color.gray10,
  borderWidth: 1,
  borderRadius: 12,
  marginTop: 10,
  paddingVertical: 5,
});

const Desc = styled.Text({
  color: color.gray40,
  fontFamily: font.pretendardRegular,
  padding: '0 10px 10px',
  fontSize: 13,
});
