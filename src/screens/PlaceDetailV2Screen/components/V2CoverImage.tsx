import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useEffect, useRef, useState} from 'react';
import {Image, useWindowDimensions, View} from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import styled from 'styled-components/native';

import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {
  AccessibilityInfoV2Dto,
  PlaceReviewDto,
  ToiletReviewDto,
} from '@/generated-sources/openapi';
import {ScreenParams} from '@/navigation/Navigation.screens';

interface SlideData {
  type: string;
  url: string;
  thumbnailUrl: string | undefined;
}

interface Props {
  accessibility?: AccessibilityInfoV2Dto;
  reviews?: PlaceReviewDto[];
  toiletReviews?: ToiletReviewDto[];
}

export default function V2CoverImage({
  accessibility,
  reviews,
  toiletReviews,
}: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigation = useNavigation<NativeStackNavigationProp<ScreenParams>>();
  const initialFocusedIndex = useRef(0);

  // V2: plural 배열 대응 (하위 호환 fallback)
  const placeAccessibilities =
    accessibility?.placeAccessibilities ??
    (accessibility?.placeAccessibility
      ? [accessibility.placeAccessibility]
      : []);
  const buildingAccessibilities =
    accessibility?.buildingAccessibilities ??
    (accessibility?.buildingAccessibility
      ? [accessibility.buildingAccessibility]
      : []);

  const placeImages: SlideData[] = placeAccessibilities.flatMap(pa =>
    (pa.images ?? []).map(image => ({
      type: '장소 입구',
      url: image.imageUrl,
      thumbnailUrl: image.thumbnailUrl,
    })),
  );

  const buildingImages: SlideData[] = buildingAccessibilities.flatMap(ba =>
    (ba.entranceImages ?? []).map(image => ({
      type: '건물 입구',
      url: image.imageUrl,
      thumbnailUrl: image.thumbnailUrl,
    })),
  );

  const elevatorImages: SlideData[] = buildingAccessibilities.flatMap(ba =>
    (ba.elevatorImages ?? []).map(image => ({
      type: '엘리베이터',
      url: image.imageUrl,
      thumbnailUrl: image.thumbnailUrl,
    })),
  );

  const placeIndoorReviewImages = (reviews ?? [])
    .filter(review => review?.images && review.images.length > 0)
    .flatMap(review => review.images)
    .filter(
      (image): image is {imageUrl: string; thumbnailUrl?: string} =>
        typeof image?.imageUrl === 'string',
    );
  const placeIndoorImages: SlideData[] = placeIndoorReviewImages.map(image => ({
    type: '장소 내부',
    url: image.imageUrl,
    thumbnailUrl: image.thumbnailUrl,
  }));

  const toiletReviewImages = (toiletReviews ?? [])
    .filter(review => review?.images && review.images.length > 0)
    .flatMap(review => review.images)
    .filter(
      (image): image is {imageUrl: string; thumbnailUrl?: string} =>
        typeof image?.imageUrl === 'string',
    );
  const toiletImagesData: SlideData[] = toiletReviewImages.map(image => ({
    type: '장애인 화장실',
    url: image.imageUrl,
    thumbnailUrl: image.thumbnailUrl,
  }));

  const thumbnailImages = [
    ...placeImages,
    ...placeIndoorImages,
    ...buildingImages,
    ...elevatorImages,
    ...toiletImagesData,
  ];

  useEffect(() => {
    if (currentIndex >= thumbnailImages.length) {
      setCurrentIndex(0);
    }
  }, [thumbnailImages.length]);

  const currentIndexForUI =
    currentIndex < thumbnailImages.length ? currentIndex : 0;

  const onPressImage = (index: number) => {
    initialFocusedIndex.current = index;
    navigation.navigate('ImageZoomViewer', {
      imageUrls: thumbnailImages
        .map(image => image.url)
        .filter(image => image !== undefined),
      index,
      types: thumbnailImages.map(t => t.type),
    });
  };

  function renderItem({item, index}: {item: SlideData; index: number}) {
    return (
      <SccPressable
        elementName="place_detail_v2_cover_image"
        logParams={{index}}
        onPress={() => onPressImage(index)}>
        <CoverImage
          resizeMethod="resize"
          source={{uri: item.thumbnailUrl ?? item.url}}
        />
      </SccPressable>
    );
  }

  const windowWidth = useWindowDimensions().width;

  return (
    <CoverImageContainer>
      {thumbnailImages.length === 0 ? (
        <Image
          source={require('@/assets/img/place_detail_example.png')}
          style={{width: '100%', height: '100%'}}
        />
      ) : (
        <>
          <Carousel
            data={thumbnailImages}
            width={windowWidth}
            loop
            renderItem={renderItem}
            onConfigurePanGesture={gestureChain => {
              gestureChain.activeOffsetX([-10, 10]);
            }}
            onScrollEnd={setCurrentIndex}
            autoPlay={thumbnailImages.length > 1}
            autoPlayInterval={5000}
          />
          <View>
            <ImageTypeLabel>
              <SlideText>{thumbnailImages[currentIndexForUI].type}</SlideText>
            </ImageTypeLabel>
            <SlideIndex>
              <SlideText>{`${currentIndexForUI + 1}/${thumbnailImages.length}`}</SlideText>
            </SlideIndex>
          </View>
        </>
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

const ImageTypeLabel = styled.View`
  position: absolute;
  bottom: 20px;
  left: 20px;
  padding-horizontal: 10px;
  padding-vertical: 4px;
  background-color: ${color.blacka70};
  border-radius: 4px;
`;

const SlideText = styled.Text`
  font-family: ${font.pretendardRegular};
  font-size: 14px;
  line-height: 22px;
  color: ${color.white};
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
