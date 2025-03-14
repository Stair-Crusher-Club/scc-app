import React from 'react';
import {View} from 'react-native';
import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';

const ChallengeDetailClosedStatus = () => {
  return (
    <Container>
      <View style={{flexGrow: 1}} />
      <BubbleContainer>
        {/* Text 에 borderRadius 가 동작하지 않아 View 로 한번 감싼다 */}
        <BubbleTextContainer>
          <BubbleText allowFontScaling={false}>
            챌린지가 종료되었습니다
          </BubbleText>
        </BubbleTextContainer>
        <BubbleTail
          source={require('../../../assets/img/img_challenge_bubble_tail.png')}
        />
      </BubbleContainer>
      <AstronutImage
        source={require('../../../assets/img/img_challenge_closed_astronut.png')}
      />
    </Container>
  );
};

export default ChallengeDetailClosedStatus;

const Container = styled.View({
  flexDirection: 'row',
  paddingTop: 46,
});

const BubbleContainer = styled.View({
  flexDirection: 'row',
  flexShrink: 1,
  alignItems: 'center',
  justifyContent: 'flex-end',
  marginLeft: 7,
});

const BubbleTextContainer = styled.View({
  backgroundColor: color.brandColor,
  paddingHorizontal: 10,
  paddingVertical: 5,
  borderRadius: 8,
});

const BubbleTail = styled.Image({
  width: 16,
  height: 8,
  transform: 'rotateZ(270deg)',
  marginLeft: -4,
  tintColor: color.brandColor,
});

const BubbleText = styled.Text({
  color: color.white,
  fontSize: 16,
  fontFamily: font.pretendardBold,
});

const AstronutImage = styled.Image({
  width: 108,
  height: 88,
  marginRight: 15,
});
