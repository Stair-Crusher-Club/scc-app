import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React from 'react';
import {FlatList} from 'react-native';
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

export default function V2ThumbnailRow({
  accessibility,
  reviews,
  toiletReviews,
}: Props) {
  const navigation = useNavigation<NativeStackNavigationProp<ScreenParams>>();

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

  const placeIndoorImages: SlideData[] = (reviews ?? [])
    .filter(review => review?.images && review.images.length > 0)
    .flatMap(review => review.images)
    .filter(
      (image): image is {imageUrl: string; thumbnailUrl?: string} =>
        typeof image?.imageUrl === 'string',
    )
    .map(image => ({
      type: '장소 내부',
      url: image.imageUrl,
      thumbnailUrl: image.thumbnailUrl,
    }));

  const toiletImagesData: SlideData[] = (toiletReviews ?? [])
    .filter(review => review?.images && review.images.length > 0)
    .flatMap(review => review.images)
    .filter(
      (image): image is {imageUrl: string; thumbnailUrl?: string} =>
        typeof image?.imageUrl === 'string',
    )
    .map(image => ({
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

  if (thumbnailImages.length === 0) {
    return null;
  }

  const onPressImage = (index: number) => {
    navigation.navigate('ImageZoomViewer', {
      imageUrls: thumbnailImages.map(image => image.url),
      index,
      types: thumbnailImages.map(t => t.type),
    });
  };

  return (
    <FlatList
      horizontal
      data={thumbnailImages}
      keyExtractor={(_, index) => String(index)}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{paddingLeft: 20, paddingRight: 20, gap: 8}}
      renderItem={({item, index}) => (
        <SccPressable
          elementName="place_detail_v2_thumbnail"
          logParams={{index}}
          onPress={() => onPressImage(index)}>
          <ThumbnailCard>
            <ThumbnailImage source={{uri: item.thumbnailUrl ?? item.url}} />
            <TypeLabel>
              <TypeLabelText>{item.type}</TypeLabelText>
            </TypeLabel>
          </ThumbnailCard>
        </SccPressable>
      )}
    />
  );
}

const ThumbnailCard = styled.View`
  width: 200px;
  height: 200px;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
`;

const ThumbnailImage = styled.Image`
  width: 200px;
  height: 200px;
`;

const GradientOverlay = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 40px;
  background-color: rgba(0, 0, 0, 0.15);
`;

const TypeLabel = styled.View`
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: rgba(0, 0, 0, 0.4);
  border-radius: 100px;
  padding-horizontal: 8px;
  padding-vertical: 2px;
`;

const TypeLabelText = styled.Text`
  font-family: ${font.pretendardRegular};
  font-size: 12px;
  line-height: 16px;
  letter-spacing: -0.24px;
  color: ${color.white};
`;
