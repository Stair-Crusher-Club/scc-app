import React, {useMemo} from 'react';
import {Dimensions, Image} from 'react-native';
import styled from 'styled-components/native';

const SCREEN_WIDTH = Dimensions.get('window').width;

const slides = [
  require('@/assets/img/tutorial_1.png'),
  require('@/assets/img/tutorial_2.png'),
  require('@/assets/img/tutorial_3.png'),
];

/**
 * 튜토리얼 이미지 프리디코딩 전용 컴포넌트.
 * HomeScreenV2와 같은 뷰 계층에서 풀사이즈로 렌더하여 iOS 이미지 캐시에 올린다.
 * navigate('Tutorial') 시 TutorialScreen에서 같은 이미지 소스를 사용하면 캐시 히트.
 */
export default function TutorialOverlay() {
  const scaledHeight = useMemo(() => {
    const source = Image.resolveAssetSource(slides[0]);
    return SCREEN_WIDTH * (source.height / source.width);
  }, []);

  return (
    <Container>
      {slides.map((source, i) => (
        <Image
          key={i}
          source={source}
          style={{width: SCREEN_WIDTH, height: scaledHeight}}
        />
      ))}
    </Container>
  );
}

const Container = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  z-index: -1;
`;
