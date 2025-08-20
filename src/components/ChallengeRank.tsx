import React from 'react';
import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {ChallengeRankDto} from '@/generated-sources/openapi';

interface PropType {
  value: ChallengeRankDto;
  shouldShowUnderline?: boolean;
  visibleIcon?: boolean;
}

const ChallengeRank = ({
  value,
  shouldShowUnderline = true,
  visibleIcon = true,
}: PropType) => {
  const shouldShowIcon = value.rank < 4;
  // TODO: api 연결
  const affiliate = '';

  return (
    <Container>
      <IndexContainer>
        <Index>{`${value.rank}위`}</Index>
        {visibleIcon && shouldShowIcon && <Icon>{getIcon(value.rank)}</Icon>}
      </IndexContainer>
      <Contents>
        {affiliate && <Affiliate>{affiliate}</Affiliate>}
        <UserName>{value.nickname}</UserName>
      </Contents>
      <Contributions
        shouldShowIcon={
          shouldShowIcon
        }>{`${value.contributionCount}개 정복`}</Contributions>
      {shouldShowUnderline && <Underline />}
    </Container>
  );
};

export default ChallengeRank;

const Container = styled.View({
  width: '100%',
  flexDirection: 'row',
  paddingVertical: 19,
  paddingHorizontal: 20,
  alignItems: 'center',
  gap: 20,
});

const IndexContainer = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
  minWidth: 40,
});

const Index = styled.Text({
  color: color.black,
  fontSize: 16,
  fontFamily: font.pretendardBold,
});

const Icon = styled.Text({
  fontSize: 16,
  fontFamily: font.pretendardBold,
});

const Contents = styled.View({
  flexDirection: 'column',
  flexGrow: 1,
});

const Affiliate = styled.Text({
  color: color.gray80,
  fontSize: 11,
  fontFamily: font.pretendardRegular,
});

const UserName = styled.Text({
  color: color.black,
  fontSize: 16,
  fontFamily: font.pretendardMedium,
  lineHeight: 26,
});

const Contributions = styled.Text<{shouldShowIcon?: boolean}>(props => ({
  color: props.shouldShowIcon ? color.brand50 : color.gray80,
  fontSize: 14,
  fontFamily: font.pretendardRegular,
}));

const Underline = styled.View({
  position: 'absolute',
  height: 1,
  left: 10,
  right: 10,
  bottom: 0,
  backgroundColor: color.gray10,
});

function getIcon(rank: number) {
  switch (rank) {
    case 1:
      return '🥇';
    case 2:
      return '🥈';
    case 3:
      return '🥉';
    default:
      return null;
  }
}
