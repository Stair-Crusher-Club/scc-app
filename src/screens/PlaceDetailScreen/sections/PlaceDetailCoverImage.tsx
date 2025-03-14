import React from 'react';
import {useWindowDimensions, View} from 'react-native';
import Carousel from 'react-native-reanimated-carousel';

import {AccessibilityInfoDto} from '@/generated-sources/openapi';
import {LogClick} from '@/logging/LogClick';

import * as S from './PlaceDetailCoverImage.style';

interface SlideData {
  type: string;
  url: string;
}
interface Props {
  accessibility?: AccessibilityInfoDto;
}
const PlaceDetailCoverImage = ({accessibility}: Props) => {
  const placeImages = (accessibility?.placeAccessibility?.images ?? []).map(
    image => ({type: '장소 입구', url: image.imageUrl}),
  );
  const buildingImages = (
    accessibility?.buildingAccessibility?.entranceImageUrls ?? []
  ).map(url => ({type: '건물 입구', url}));
  const elevatorImages = (
    accessibility?.buildingAccessibility?.elevatorImageUrls ?? []
  ).map(url => ({type: '엘리베이터', url}));
  const images = [...placeImages, ...buildingImages, ...elevatorImages];

  function renderItem({item, index}: {item: SlideData; index: number}) {
    return (
      <LogClick elementName="place_detail_cover_image">
        <View>
          <S.CoverImage resizeMethod="resize" source={{uri: item.url}} />
          <S.ImageType>
            <S.SlideText>{item.type}</S.SlideText>
          </S.ImageType>
          <S.SlideIndex>
            <S.SlideText>{`${index + 1}/${images.length}`}</S.SlideText>
          </S.SlideIndex>
        </View>
      </LogClick>
    );
  }

  const windowWidth = useWindowDimensions().width;

  return (
    <S.CoverImageContainer>
      <Carousel
        data={images}
        width={windowWidth}
        loop
        renderItem={renderItem}
        panGestureHandlerProps={{activeOffsetX: [-10, 10]}}
      />
    </S.CoverImageContainer>
  );
};

export default PlaceDetailCoverImage;
