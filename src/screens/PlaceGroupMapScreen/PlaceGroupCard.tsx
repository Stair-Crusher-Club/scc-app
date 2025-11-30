import {useAtomValue} from 'jotai';
import React, {memo} from 'react';
import {View} from 'react-native';
import styled from 'styled-components/native';

import BookmarkIconOff from '@/assets/icon/ic_bookmark.svg';
import BookmarkIconOn from '@/assets/icon/ic_bookmark_on.svg';
import ShareIcon from '@/assets/icon/ic_share.svg';
import {currentLocationAtom} from '@/atoms/Location';
import {SccPressable} from '@/components/SccPressable';
import {SccTouchableOpacity} from '@/components/SccTouchableOpacity';
import Tags from '@/components/Tag';
import {MarkerItem} from '@/components/maps/MarkerItem';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {PlaceCategoryDto, PlaceListItem} from '@/generated-sources/openapi';
import {useToggleFavoritePlace} from '@/hooks/useToggleFavoritePlace';
import {LogParamsProvider} from '@/logging/LogParamsProvider';
import useNavigation from '@/navigation/useNavigation';
import ImageList from '@/screens/PlaceDetailScreen/components/PlaceDetailImageList';
import ScoreLabel from '@/screens/SearchScreen/components/ScoreLabel';
import {distanceInMeter, prettyFormatMeter} from '@/utils/DistanceUtils';
import ShareUtils from '@/utils/ShareUtils';
import {getPlaceAccessibilityScore} from '@/utils/accessibilityCheck';
import {useCheckAuth} from '@/utils/checkAuth';

function PlaceGroupCard({item}: {item: MarkerItem & PlaceListItem}) {
  const navigation = useNavigation();
  const checkAuth = useCheckAuth();
  const currentLocation = useAtomValue(currentLocationAtom);
  const isFavorite = item.place.isFavorite;
  const toggleFavorite = useToggleFavoritePlace();

  const tagTexts = (() => {
    let floorTag;
    let slopeTag;
    if (item.accessibilityInfo) {
      floorTag = item.accessibilityInfo.floors.length
        ? `${item.accessibilityInfo.floors[0]}층${
            item.accessibilityInfo.floors.length > 1 ? '+' : ''
          }`
        : undefined;
      slopeTag = !item.hasPlaceAccessibility
        ? undefined
        : item.accessibilityInfo.hasSlope
          ? '경사로있음'
          : !item.accessibilityInfo.hasSlope &&
              item.accessibilityInfo.accessibilityScore !== 0
            ? '경사로없음'
            : undefined;
    } else {
      floorTag = undefined;
      slopeTag = undefined;
    }
    return [floorTag, slopeTag].filter(tag => tag) as string[];
  })();

  const distanceText = (() => {
    let distance;
    if (currentLocation && item.place.location) {
      distance = distanceInMeter(currentLocation, {
        latitude: item.place.location.lat,
        longitude: item.place.location.lng,
      });
    } else {
      distance = undefined;
    }
    return prettyFormatMeter(distance);
  })();

  const onShare = () => {
    ShareUtils.sharePlace(item.place);
  };

  const onFavorite = () => {
    toggleFavorite({
      currentIsFavorite: isFavorite,
      placeId: item.place.id,
    });
  };

  const onCardPress = () => {
    navigation.navigate('PlaceDetail', {
      placeInfo: {placeId: item.place.id},
    });
  };

  const hasReview = !!(
    item.accessibilityInfo?.reviewCount &&
    item.accessibilityInfo.reviewCount > 0
  );

  return (
    <LogParamsProvider
      params={{
        place_id: item.place.id,
        place_name: item.place.name,
        place_accessibility_score: item.accessibilityInfo?.accessibilityScore,
      }}>
      <Container elementName="place_group_card" onPress={onCardPress}>
        <InfoArea>
          <LabelIconArea>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
              <ScoreLabel
                score={getPlaceAccessibilityScore({
                  score: item.accessibilityInfo?.accessibilityScore,
                  hasPlaceAccessibility: item.hasPlaceAccessibility,
                  hasBuildingAccessibility: item.hasBuildingAccessibility,
                })}
                isIconVisible
              />
            </View>
            <IconArea>
              <SccTouchableOpacity
                elementName="place_group_card_bookmark_button"
                logParams={{is_favorite: isFavorite}}
                style={{
                  paddingLeft: 5,
                  paddingRight: 5,
                  paddingBottom: 5,
                }}
                activeOpacity={0.6}
                onPress={() => checkAuth(onFavorite)}>
                {isFavorite ? (
                  <BookmarkIconOn
                    color={color.brandColor}
                    width={24}
                    height={24}
                  />
                ) : (
                  <BookmarkIconOff
                    color={color.gray70}
                    width={24}
                    height={24}
                  />
                )}
              </SccTouchableOpacity>
              <SccTouchableOpacity
                elementName="place_group_card_share_button"
                style={{
                  paddingLeft: 5,
                  paddingBottom: 5,
                }}
                activeOpacity={0.6}
                onPress={() => checkAuth(onShare)}>
                <ShareIcon color={color.gray70} width={24} height={24} />
              </SccTouchableOpacity>
            </IconArea>
          </LabelIconArea>
          <TitleArea>
            <TextWrapper>
              <TitleText>{item.place.name}</TitleText>
              <CategoryText>
                {getCategoryText(item.place.category)}
              </CategoryText>
            </TextWrapper>
            <LocationBox>
              <DistanceText>{distanceText}</DistanceText>
              <LocationDivider />
              <AddressText>{item.place.address}</AddressText>
            </LocationBox>
          </TitleArea>
          <ExtraArea>
            <Tags
              texts={tagTexts}
              hasReview={hasReview}
              reviewCount={item.accessibilityInfo?.reviewCount}
            />
          </ExtraArea>
        </InfoArea>
        <View
          style={{
            marginTop: 12,
            width: '100%',
            flexShrink: 2,
            overflow: 'hidden',
          }}>
          <ImageList images={item.accessibilityInfo?.images ?? []} />
        </View>
      </Container>
    </LogParamsProvider>
  );
}

function getCategoryText(category?: PlaceCategoryDto) {
  switch (category) {
    case PlaceCategoryDto.Restaurant:
      return '식당';
    case PlaceCategoryDto.Cafe:
      return '카페';
    case PlaceCategoryDto.Accomodation:
      return '숙소';
    case PlaceCategoryDto.Market:
      return '시장';
    case PlaceCategoryDto.ConvenienceStore:
      return '편의점';
    case PlaceCategoryDto.Kindergarten:
      return '유치원';
    case PlaceCategoryDto.School:
      return '학교';
    case PlaceCategoryDto.Academy:
      return '학원';
    case PlaceCategoryDto.ParkingLot:
      return '주차장';
    case PlaceCategoryDto.GasStation:
      return '주유소';
    case PlaceCategoryDto.SubwayStation:
      return '지하철역';
    case PlaceCategoryDto.Bank:
      return '은행';
    case PlaceCategoryDto.CulturalFacilities:
      return '문화시설';
    case PlaceCategoryDto.Agency:
      return '대행사';
    case PlaceCategoryDto.PublicOffice:
      return '공공기관';
    case PlaceCategoryDto.Attraction:
      return '관광명소';
    case PlaceCategoryDto.Hospital:
      return '병원';
    case PlaceCategoryDto.Pharmacy:
      return '약국';
    default:
      return '';
  }
}

const InfoArea = styled.View`
  overflow: visible;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const LabelIconArea = styled.View`
  overflow: visible;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 3px;
`;

const TitleArea = styled.View`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  margin-bottom: 8px;
`;

const ExtraArea = styled.View`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 8px;
`;

const IconArea = styled.View`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const Container = styled(SccPressable)`
  overflow: visible;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  height: 232px;
  justify-content: space-between;
`;

const TitleText = styled.Text`
  font-size: 16px;
  font-family: ${font.pretendardBold};
  color: ${color.black};
`;

const CategoryText = styled.Text`
  font-size: 12px;
  font-family: ${font.pretendardRegular};
  color: ${color.gray50};
`;

const TextWrapper = styled.View`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
`;

const DistanceText = styled.Text`
  font-size: 14px;
  font-family: ${font.pretendardMedium};
  color: ${color.gray80};
`;

const AddressText = styled.Text`
  font-size: 14px;
  font-family: ${font.pretendardRegular};
  color: ${color.gray80};
`;

const LocationBox = styled.View`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 4px;
`;

const LocationDivider = styled.View`
  width: 2px;
  height: 2px;
  border-radius: 1px;
  background-color: ${color.gray80};
`;

export default memo(PlaceGroupCard);
