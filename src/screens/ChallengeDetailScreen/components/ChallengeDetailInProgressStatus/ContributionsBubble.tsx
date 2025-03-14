import React from 'react';
import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';

interface ContributionsBubbleProps {
  style?: any;
  numberOfContributions: number;
  isComplete: boolean;
  onSizeChanged: ({width, height}: {width: number; height: number}) => void;
}

const ContributionsBubble = ({
  style,
  numberOfContributions,
  isComplete,
  onSizeChanged,
}: ContributionsBubbleProps) => {
  return (
    <BubbleContainer
      style={style}
      isVisible={numberOfContributions > 0}
      onLayout={event => {
        onSizeChanged({
          width: event.nativeEvent.layout.width,
          height: event.nativeEvent.layout.width,
        });
      }}>
      {/* Text 에 borderRadius 가 동작하지 않아 View 로 한번 감싼다 */}
      <BubbleTextContainer>
        <BubbleText allowFontScaling={false}>
          {isComplete ? '정복완료!' : `${numberOfContributions}개`}
        </BubbleText>
      </BubbleTextContainer>
      <BubbleTail
        source={require('../../../../assets/img/img_challenge_bubble_tail.png')}
      />
    </BubbleContainer>
  );
};

export default ContributionsBubble;

// 안보이더라도 영역은 차지하기 위해 opacity 를 조절한다.
const BubbleContainer = styled.View<{isVisible: boolean}>`
  flex-direction: column;
  align-items: center;
  opacity: ${({isVisible}) => (isVisible ? 1 : 0)};
`;

const BubbleTextContainer = styled.View({
  backgroundColor: color.brandColor,
  paddingHorizontal: 10,
  paddingVertical: 5,
  borderRadius: 8,
});

const BubbleTail = styled.Image({
  width: 16,
  height: 8,
  tintColor: color.brandColor,
});

const BubbleText = styled.Text({
  color: color.white,
  fontSize: 16,
  fontFamily: font.pretendardBold,
});
