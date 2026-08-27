import React, {useState} from 'react';
import {Image, StyleSheet} from 'react-native';
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
      <StatusBarSpacer />
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

// Figma(113:4962, Camera_example_1): CameraScreen 위에 얹히는 반투명 오버레이다
// (별도 화면 아님) — #24262b(color.gray80v2) 90% 스크림 뒤로 카메라 화면이 옅게
// 비친다. review/toilet의 PlacePhotoGuideScreen(별도 화면, 유지)과는 다른 패턴.
const Root = styled.View({
  ...StyleSheet.absoluteFillObject,
  backgroundColor: 'rgba(36, 38, 43, 0.9)',
});

// Figma: 상태바+헤더 영역(123/844 ≈ 14.6%)만큼 이미지 위에 여백을 둔다.
const StatusBarSpacer = styled.View({
  height: '14.6%',
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
