import React, {memo} from 'react';
import {View} from 'react-native';
import styled from 'styled-components/native';
import {useAtomValue} from 'jotai';

import {currentLocationAtom} from '@/atoms/Location';
import {SccPressable} from '@/components/SccPressable';
import {SccTouchableOpacity} from '@/components/SccTouchableOpacity';
import Tags from '@/components/Tag';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {PlaceListItem, PlaceCategoryDto} from '@/generated-sources/openapi';
import {LogParamsProvider} from '@/logging/LogParamsProvider';
import ImageList from '@/screens/PlaceDetailScreen/components/PlaceDetailImageList';
import ScoreLabel from '@/screens/SearchScreen/components/ScoreLabel';
import {distanceInMeter, prettyFormatMeter} from '@/utils/DistanceUtils';
import {getPlaceAccessibilityScore} from '@/utils/accessibilityCheck';
import BookmarkIcon from '@/assets/icon/ic_v2_bookmark.svg';
import BookmarkOnIcon from '@/assets/icon/ic_v2_bookmark_on.svg';
import ShareIcon from '@/assets/icon/ic_v2_share.svg';
import ShareUtils from '@/utils/ShareUtils';
import {useToggleFavoritePlace} from '@/hooks/useToggleFavoritePlace';
import {useCheckAuth} from '@/utils/checkAuth';

function SearchItemCard({
  item,
  isHeightFlex,
  onPress,
}: {
  item: PlaceListItem;
  isHeightFlex?: boolean;
  onPress?: () => void;
}) {
  const checkAuth = useCheckAuth();
  const currentLocation = useAtomValue(currentLocationAtom);
  const isFavorite = item.place.isFavorite;
  const toggleFavorite = useToggleFavoritePlace();

  // 거리 계산
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

  // 태그 텍스트 (층수, 경사로 정보)
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

  const hasReview = !!(
    item.accessibilityInfo?.reviewCount &&
    item.accessibilityInfo.reviewCount > 0
  );

  const onShare = () => {
    ShareUtils.sharePlace(item.place);
  };

  const onFavorite = () => {
    toggleFavorite({
      currentIsFavorite: isFavorite,
      placeId: item.place.id,
    });
  };

  const registerStatus: 'UNAVAILABLE' | 'NONE' | 'BOTH' | 'PLACE_ONLY' =
    (() => {
      if (!item.isAccessibilityRegistrable) {
        return 'UNAVAILABLE';
      }
      if (!item.hasPlaceAccessibility) {
        return 'NONE';
      }
      if (item.hasBuildingAccessibility) {
        return 'BOTH';
      }
      return 'PLACE_ONLY';
    })();

  return (
    <LogParamsProvider
      params={{
        place_id: item.place.id,
        place_name: item.place.name,
        place_accessibility_score: item.accessibilityInfo?.accessibilityScore,
      }}>
      <Container
        elementName="place_search_item_card"
        isHeightFlex={isHeightFlex}
        onPress={onPress}>
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
                elementName="place_search_item_card_bookmark_button"
                logParams={{is_favorite: isFavorite}}
                style={{
                  paddingLeft: 5,
                  paddingRight: 5,
                  paddingBottom: 5,
                }}
                activeOpacity={0.6}
                onPress={() => checkAuth(onFavorite)}>
                {isFavorite ? (
                  <BookmarkOnIcon
                    width={24}
                    height={24}
                    color={color.brandColor}
                  />
                ) : (
                  <BookmarkIcon width={24} height={24} color={color.gray70} />
                )}
              </SccTouchableOpacity>
              <SccTouchableOpacity
                elementName="place_search_item_card_share_button"
                style={{
                  paddingLeft: 5,
                  paddingBottom: 5,
                }}
                activeOpacity={0.6}
                onPress={onShare}>
                <ShareIcon width={24} height={24} color={color.gray70} />
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
        {registerStatus !== 'UNAVAILABLE' && registerStatus !== 'NONE' && (
          <View
            style={{
              marginTop: 12,
              width: '100%',
              flexShrink: 2,
              overflow: 'hidden',
            }}>
            <ImageList images={item.accessibilityInfo?.images ?? []} />
          </View>
        )}
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

// Styled components from original
const InfoArea = styled.View`
  overflow: visible;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
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
  width: 100%;
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

const Container = styled(SccPressable)<{isHeightFlex?: boolean}>`
  overflow: visible;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  height: ${({isHeightFlex}) => (isHeightFlex ? 'auto' : '232px')};
  justify-content: space-between;
`;

const TitleText = styled.Text`
  font-size: 16px;
  font-family: ${() => font.pretendardBold};
  color: ${() => color.black};
`;

const CategoryText = styled.Text`
  font-size: 12px;
  font-family: ${() => font.pretendardRegular};
  color: ${() => color.gray50};
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
  font-family: ${() => font.pretendardMedium};
  color: ${() => color.gray80};
`;

const AddressText = styled.Text`
  font-size: 14px;
  font-family: ${() => font.pretendardRegular};
  color: ${() => color.gray80};
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
  background-color: ${() => color.gray80};
`;

export default memo(SearchItemCard);
