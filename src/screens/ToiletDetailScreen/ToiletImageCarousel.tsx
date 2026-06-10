import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useEffect, useRef, useState} from 'react';
import {useWindowDimensions, View} from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import styled from 'styled-components/native';

import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {ImageDto} from '@/generated-sources/openapi';
import {ScreenParams} from '@/navigation/Navigation.screens';

interface Props {
  images: ImageDto[];
}

/**
 * 화장실 상세(TDP) 상단 이미지 캐러셀.
 * 여러 소스(accessibilities[])의 이미지를 하나로 합쳐 가로 캐러셀로 보여준다.
 * 재설계 이전 ExternalAccessibilityDetailScreen의 CoverImage(aspect-ratio 375/300)
 * 스타일을 복원하고, PDP V2CoverImage와 동일한 react-native-reanimated-carousel를 사용한다.
 */
export default function ToiletImageCarousel({images}: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigation = useNavigation<NativeStackNavigationProp<ScreenParams>>();
  const initialFocusedIndex = useRef(0);
  const windowWidth = useWindowDimensions().width;

  useEffect(() => {
    if (currentIndex >= images.length) {
      setCurrentIndex(0);
    }
  }, [images.length, currentIndex]);

  const currentIndexForUI = currentIndex < images.length ? currentIndex : 0;

  const onPressImage = (index: number) => {
    initialFocusedIndex.current = index;
    navigation.navigate('ImageZoomViewer', {
      imageUrls: images.map(image => image.imageUrl),
      index,
    });
  };

  function renderItem({item, index}: {item: ImageDto; index: number}) {
    return (
      <SccPressable
        elementName="toilet_detail_cover_image"
        logParams={{index}}
        onPress={() => onPressImage(index)}>
        <CoverImage
          resizeMethod="resize"
          source={{uri: item.thumbnailUrl ?? item.imageUrl}}
        />
      </SccPressable>
    );
  }

  return (
    <CoverImageContainer>
      <Carousel
        data={images}
        width={windowWidth}
        loop
        renderItem={renderItem}
        onConfigurePanGesture={gestureChain => {
          gestureChain.activeOffsetX([-10, 10]);
        }}
        onScrollEnd={setCurrentIndex}
        autoPlay={images.length > 1}
        autoPlayInterval={5000}
      />
      {images.length > 1 && (
        <View>
          <SlideIndex>
            <SlideText>{`${currentIndexForUI + 1}/${images.length}`}</SlideText>
          </SlideIndex>
        </View>
      )}
    </CoverImageContainer>
  );
}

const CoverImageContainer = styled.View`
  width: 100%;
  background-color: ${color.gray50};
  aspect-ratio: ${375 / 300};
`;

const CoverImage = styled.Image`
  width: 100%;
  aspect-ratio: ${375 / 300};
`;

const SlideIndex = styled.View`
  position: absolute;
  bottom: 20px;
  right: 20px;
  padding-horizontal: 10px;
  padding-vertical: 4px;
  background-color: ${color.blacka70};
  border-radius: 50px;
`;

const SlideText = styled.Text`
  font-family: ${font.pretendardRegular};
  font-size: 14px;
  line-height: 22px;
  color: ${color.white};
`;
