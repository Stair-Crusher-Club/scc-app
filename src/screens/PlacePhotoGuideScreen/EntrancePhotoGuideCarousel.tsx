import React, {useState} from 'react';
import {Image} from 'react-native';
import styled from 'styled-components/native';

import {SccButton} from '@/components/atoms';
import {font} from '@/constant/font';

// ponytail: 스와이프 없이 버튼으로만 다음 페이지로 넘어간다 — Figma에 스와이프
// 인디케이터가 없고 "다음 >" 버튼만 있어, 캐러셀 라이브러리 없이 인덱스 state로 충분하다.
const PAGES = [
  {
    image: require('../../assets/img/guide_entrance_sample_1.jpg'),
    caption:
      '첫번째 사진은 간판부터 문 아래까지 \n가게 입구 전체적으로 보이도록 찍어주세요',
    buttonText: '다음 >',
  },
  {
    image: require('../../assets/img/guide_entrance_sample_2.jpg'),
    caption:
      '두번째 사진은 출입구의 계단/경사로 등\n진입로가 더 잘보이도록 찍어주세요',
    buttonText: '다음 >',
  },
  {
    image: require('../../assets/img/guide_entrance_sample_3.jpg'),
    caption: '세번째 사진은 그 외 도움이 될만한 \n사진을 찍어주세요',
    buttonText: '확인했어요!',
  },
];

export default function EntrancePhotoGuideCarousel({
  onDone,
}: {
  onDone: () => void;
}) {
  const [pageIndex, setPageIndex] = useState(0);
  const page = PAGES[pageIndex];
  const isLastPage = pageIndex === PAGES.length - 1;

  const handlePress = () => {
    if (isLastPage) {
      onDone();
    } else {
      setPageIndex(i => i + 1);
    }
  };

  return (
    <Root>
      <SampleImageWrapper>
        <Image
          style={{width: '100%', height: '100%'}}
          source={page.image}
          resizeMode="cover"
        />
      </SampleImageWrapper>
      <BottomArea>
        <Caption>{page.caption}</Caption>
        <SccButton
          text={page.buttonText}
          onPress={handlePress}
          width="100%"
          height={44}
          buttonColor="brand40"
          fontSize={15}
          fontFamily={font.pretendardMedium}
          style={{borderRadius: 8}}
          elementName="place_photo_guide_carousel_next"
          logParams={{page_index: pageIndex}}
        />
      </BottomArea>
    </Root>
  );
}

const Root = styled.View({
  flex: 1,
});

const SampleImageWrapper = styled.View({
  width: '100%',
  aspectRatio: '390/420',
});

const BottomArea = styled.View({
  flex: 1,
  justifyContent: 'flex-end',
  paddingHorizontal: 20,
  paddingBottom: 20,
  gap: 20,
});

const Caption = styled.Text({
  color: 'white',
  fontFamily: font.pretendardMedium,
  fontSize: 18,
  lineHeight: 26,
  textAlign: 'center',
});
