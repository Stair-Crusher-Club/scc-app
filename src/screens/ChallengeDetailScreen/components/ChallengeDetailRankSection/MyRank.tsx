import React from 'react';
import styled from 'styled-components/native';

import ChallengeRank from '@/components/ChallengeRank';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {ChallengeRankDto} from '@/generated-sources/openapi';

interface PropsType {
  myRank: ChallengeRankDto;
}

const MyRank = ({myRank}: PropsType) => {
  const shouldShowBubble = myRank.rank === 1;
  return (
    <Container>
      <Title>나의 랭킹</Title>
      <ChallengeRankContainer>
        <ChallengeRank value={myRank} shouldShowUnderline={false} />
      </ChallengeRankContainer>
      {shouldShowBubble && (
        <BubbleContainer>
          <BubbleTail
            source={require('../../../../assets/img/img_challenge_bubble_tail.png')}
          />
          <BubbleContents>
            <BubbleText>
              {'내가 바로 이 구역의\n'}
              <BubbleText style={{fontFamily: font.pretendardBold}}>
                계단정복왕!
              </BubbleText>
            </BubbleText>
            <Spacer />
            <BubbleImage
              source={require('../../../../assets/img/img_challenge_my_rank.png')}
            />
          </BubbleContents>
        </BubbleContainer>
      )}
    </Container>
  );
};

export default MyRank;

const Container = styled.View({
  width: '100%',
  flexDirection: 'column',
  paddingHorizontal: 15,
  paddingBottom: 30,
});

const Title = styled.Text({
  color: color.black,
  fontSize: 20,
  fontFamily: font.pretendardBold,
  padding: 10,
});

const ChallengeRankContainer = styled.View({
  borderWidth: 1,
  borderColor: color.gray10,
  borderRadius: 12,
  paddingVertical: 5,
});

const BubbleContainer = styled.View({
  width: '100%',
  flexDirection: 'column',
  alignItems: 'flex-start',
  marginTop: 2,
});

const BubbleTail = styled.Image({
  width: 16,
  height: 8,
  transform: 'rotateZ(180deg)',
  tintColor: color.brandColor,
  marginLeft: 30,
});

const BubbleContents = styled.View({
  widtH: '100%',
  flexDirection: 'row',
  alignItems: 'center',
  borderRadius: 12,
  backgroundColor: color.brandColor,
});

const BubbleText = styled.Text({
  color: color.white,
  fontSize: 14,
  fontFamily: font.pretendardRegular,
  marginLeft: 20,
});

const Spacer = styled.View({
  flex: 1,
});

const BubbleImage = styled.Image({
  height: '100%',
  aspectRatio: '130/72',
  marginRight: 10,
});
