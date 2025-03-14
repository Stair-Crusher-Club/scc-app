import React from 'react';
import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {ChallengeRankDto} from '@/generated-sources/openapi';

interface PropType {
  value: ChallengeRankDto;
  shouldShowUnderline?: boolean;
}

const ChallengeRank = ({value, shouldShowUnderline = true}: PropType) => {
  const shouldShowIcon = value.rank === 1;
  return (
    <Container>
      <IndexContainer>
        <Index>{`${value.rank}위`}</Index>
        {shouldShowIcon && <Icon>👑</Icon>}
      </IndexContainer>
      <Contents>
        <UserName>{value.nickname}</UserName>
        <Contributions>{`${value.contributionCount}개 정복`}</Contributions>
      </Contents>
      {shouldShowUnderline && <Underline />}
    </Container>
  );
};

export default ChallengeRank;

const Container = styled.View({
  width: '100%',
  flexDirection: 'row',
  paddingVertical: 10,
  paddingHorizontal: 20,
});

const IndexContainer = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
  marginRight: 20,
});

const Index = styled.Text({
  color: color.black,
  fontSize: 16,
  fontFamily: font.pretendardBold,
});

const Icon = styled.Text({
  fontSize: 16,
  fontFamily: font.pretendardBold,
  marginLeft: 8,
  marginBottom: 4, // 시각보정
});

const Contents = styled.View({
  flexDirection: 'column',
  alignItems: 'flex-end',
  flexGrow: 1,
});

const UserName = styled.Text({
  color: color.black,
  fontSize: 16,
  fontFamily: font.pretendardMedium,
});

const Contributions = styled.Text({
  color: color.gray80,
  fontSize: 14,
  fontFamily: font.pretendardRegular,
});

const Underline = styled.View({
  position: 'absolute',
  height: 1,
  left: 10,
  right: 10,
  bottom: 0,
  backgroundColor: color.gray10,
});
