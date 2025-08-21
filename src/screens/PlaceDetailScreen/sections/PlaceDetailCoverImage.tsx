import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useRef, useState} from 'react';
import {Image, Pressable, useWindowDimensions, View} from 'react-native';
import Carousel from 'react-native-reanimated-carousel';

import {
  AccessibilityInfoDto,
  PlaceReviewDto,
  ToiletReviewDto,
} from '@/generated-sources/openapi';
import {LogClick} from '@/logging/LogClick';
import {ScreenParams} from '@/navigation/Navigation.screens';

import * as S from './PlaceDetailCoverImage.style';

interface SlideData {
  type: string;
  url: string;
  thumbnailUrl: string | undefined;
}
interface Props {
  accessibility?: AccessibilityInfoDto;
  placeIndoorReviews?: PlaceReviewDto[];
  toiletReviews?: ToiletReviewDto[];
}
const PlaceDetailCoverImage = ({
  accessibility,
  placeIndoorReviews,
  toiletReviews,
}: Props) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const navigation = useNavigation<NativeStackNavigationProp<ScreenParams>>();
  const placeImages = (accessibility?.placeAccessibility?.images ?? []).map(
    image => ({
      type: '장소 입구',
      url: image.imageUrl,
      thumbnailUrl: image.thumbnailUrl,
    }),
  );
  const initialFocusedIndex = useRef(0); // 이미지 상세 들어갈 때 어떤 이미지를 보여줄지
  const buildingImages = (
    accessibility?.buildingAccessibility?.entranceImages ?? []
  ).map(image => ({
    type: '건물 입구',
    url: image.imageUrl,
    thumbnailUrl: image.thumbnailUrl,
  }));
  const elevatorImages = (
    accessibility?.buildingAccessibility?.elevatorImages ?? []
  ).map(image => ({
    type: '엘리베이터',
    url: image.imageUrl,
    thumbnailUrl: image.thumbnailUrl,
  }));

  const placeIndoorReviewImages = placeIndoorReviews
    ?.filter(review => review?.images && review?.images?.length > 0)
    ?.flatMap(review => review.images)
    ?.filter(
      (image): image is {imageUrl: string; thumbnailUrl?: string} =>
        typeof image?.imageUrl === 'string',
    );
  const placeIndoorImages = (placeIndoorReviewImages ?? []).map(image => ({
    type: '장소 내부',
    url: image?.imageUrl,
    thumbnailUrl: image?.thumbnailUrl,
  }));

  const toiletReviewImages = toiletReviews
    ?.filter(review => review?.images && review?.images?.length > 0)
    ?.flatMap(review => review.images)
    ?.filter(
      (image): image is {imageUrl: string; thumbnailUrl?: string} =>
        typeof image?.imageUrl === 'string',
    );
  const toiletImages = (toiletReviewImages ?? []).map(image => ({
    type: '장애인 화장실',
    url: image?.imageUrl,
    thumbnailUrl: image?.thumbnailUrl,
  }));
  const thumbnailImages = [
    ...placeImages,
    ...placeIndoorImages,
    ...buildingImages,
    ...elevatorImages,
    ...toiletImages,
  ];
  const onPressImage = (index: number) => {
    initialFocusedIndex.current = index;
    navigation.navigate('ImageZoomViewer', {
      imageUrls: thumbnailImages
        .map(image => image.url)
        .filter(image => image !== undefined),
      index: index,
      types: thumbnailImages.map(t => t.type),
    });
  };

  function renderItem({item, index}: {item: SlideData; index: number}) {
    return (
      <LogClick elementName="place_detail_cover_image">
        <Pressable onPress={() => onPressImage(index)}>
          <S.CoverImage
            resizeMethod="resize"
            source={{uri: item.thumbnailUrl ?? item.url}}
          />
        </Pressable>
      </LogClick>
    );
  }

  const windowWidth = useWindowDimensions().width;

  return (
    <S.CoverImageContainer>
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
            autoPlay={true}
            autoPlayInterval={5000}
          />
          <View>
            <S.ImageType>
              <S.SlideText>{thumbnailImages[currentIndex].type}</S.SlideText>
            </S.ImageType>
            <S.SlideIndex>
              <S.SlideText>{`${currentIndex + 1}/${thumbnailImages.length}`}</S.SlideText>
            </S.SlideIndex>
          </View>
        </>
      )}
    </S.CoverImageContainer>
  );
};

export default PlaceDetailCoverImage;
