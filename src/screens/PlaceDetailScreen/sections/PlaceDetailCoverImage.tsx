import React, {useRef, useState} from 'react';
import {Pressable, useWindowDimensions, View} from 'react-native';
import Carousel from 'react-native-reanimated-carousel';

import {AccessibilityInfoDto} from '@/generated-sources/openapi';
import {LogClick} from '@/logging/LogClick';
import PlaceDetailImageZoomViewer from '@/screens/PlaceDetailScreen/modals/PlaceDetailImageZoomViewer';

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
  const initialFocusedIndex = useRef(0); // 이미지 상세 들어갈 때 어떤 이미지를 보여줄지
  const [isImageModalVisible, setImageModalVisible] = useState(false);
  const buildingImages = (
    accessibility?.buildingAccessibility?.entranceImageUrls ?? []
  ).map(url => ({type: '건물 입구', url}));
  const elevatorImages = (
    accessibility?.buildingAccessibility?.elevatorImageUrls ?? []
  ).map(url => ({type: '엘리베이터', url}));
  const thumbnailImages = [
    ...placeImages,
    ...buildingImages,
    ...elevatorImages,
  ];
  const onPressImage = (index: number) => {
    initialFocusedIndex.current = index;
    setImageModalVisible(true);
  };

  function renderItem({item, index}: {item: SlideData; index: number}) {
    return (
      <LogClick elementName="place_detail_cover_image">
        <Pressable onPress={() => onPressImage(index)}>
          <S.CoverImage resizeMethod="resize" source={{uri: item.url}} />
          <S.ImageType>
            <S.SlideText>{item.type}</S.SlideText>
          </S.ImageType>
          <S.SlideIndex>
            <S.SlideText>{`${index + 1}/${
              thumbnailImages.length
            }`}</S.SlideText>
          </S.SlideIndex>
        </Pressable>
      </LogClick>
    );
  }

  const windowWidth = useWindowDimensions().width;

  return (
    <S.CoverImageContainer>
      <Carousel
        data={thumbnailImages}
        width={windowWidth}
        loop
        renderItem={renderItem}
        panGestureHandlerProps={{activeOffsetX: [-10, 10]}}
      />
      <PlaceDetailImageZoomViewer
        isVisible={isImageModalVisible}
        imageUrls={thumbnailImages.map(image => image.url)}
        index={initialFocusedIndex.current}
        onPressCloseButton={() => setImageModalVisible(false)}
      />
    </S.CoverImageContainer>
  );
};

export default PlaceDetailCoverImage;
