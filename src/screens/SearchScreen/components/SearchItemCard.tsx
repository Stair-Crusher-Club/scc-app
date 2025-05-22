import {useAtom, useAtomValue} from 'jotai';
import React, {memo} from 'react';
import {TouchableOpacity, View} from 'react-native';
import styled from 'styled-components/native';

import BookmarkIconOff from '@/assets/icon/ic_bookmark.svg';
import BookmarkIconOn from '@/assets/icon/ic_bookmark_on.svg';
import ShareIcon from '@/assets/icon/ic_share.svg';
import {currentLocationAtom} from '@/atoms/Location';
import {hasBeenRegisteredAccessibilityAtom} from '@/atoms/User';
import Tags from '@/components/Tag';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {PlaceCategoryDto, PlaceListItem} from '@/generated-sources/openapi';
import {useToggleFavoritePlace} from '@/hooks/useToggleFavoritePlace';
import {LogClick} from '@/logging/LogClick';
import {LogParamsProvider} from '@/logging/LogParamsProvider';
import {LogViewAndClick} from '@/logging/LogViewAndClick';
import useNavigation from '@/navigation/useNavigation';
import ImageList from '@/screens/PlaceDetailScreen/components/PlaceDetailImageList';
import Button from '@/screens/SearchScreen/components/Button';
import ScoreLabel from '@/screens/SearchScreen/components/ScoreLabel';
import Tooltip from '@/screens/SearchScreen/components/Tooltip';
import {distanceInMeter, prettyFormatMeter} from '@/utils/DistanceUtils';
import ShareUtils from '@/utils/ShareUtils';
import {getPlaceAccessibilityScore} from '@/utils/accessibilityCheck';
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
  const navigation = useNavigation();
  const checkAuth = useCheckAuth();
  const currentLocation = useAtomValue(currentLocationAtom);
  const isFavorite = item.place.isFavorite;
  const [hasBeenRegisteredAccessibility, setHasBeenRegisteredAccessibility] =
    useAtom(hasBeenRegisteredAccessibilityAtom);
  const toggleFavorite = useToggleFavoritePlace();
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
          item.accessibilityInfo.accessibilityScore !== 0 // 접근성이 좋은 장소면(경사로 없이 충분히 진입 가능하면) 경사로 없음 태그 노출할 필요 없다.
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

  const onRegister = (isBuilding: boolean) => {
    checkAuth(() => {
      setHasBeenRegisteredAccessibility(true);
      if (isBuilding) {
        navigation.navigate('BuildingForm', {
          place: item.place,
          building: item.building,
        });
      } else {
        navigation.navigate('PlaceForm', {
          place: item.place,
          building: item.building,
        });
      }
    });
  };

  return (
    <LogParamsProvider
      params={{
        place_id: item.place.id,
        place_name: item.place.name,
        place_accessibility_score: item.accessibilityInfo?.accessibilityScore,
      }}>
      <LogViewAndClick elementName="place_search_item_card">
        <Container isHeightFlex={isHeightFlex} onPress={onPress}>
          <InfoArea>
            <LabelIconArea>
              <ScoreLabel
                score={getPlaceAccessibilityScore({
                  score: item.accessibilityInfo?.accessibilityScore,
                  hasPlaceAccessibility: item.hasPlaceAccessibility,
                  hasBuildingAccessibility: item.hasBuildingAccessibility,
                })}
                isIconVisible
              />
              <IconArea>
                <TouchableOpacity
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
                      color={color.gray80}
                      width={24}
                      height={24}
                    />
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.6}
                  onPress={() => checkAuth(onShare)}>
                  <ShareIcon width={24} height={24} />
                </TouchableOpacity>
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
              <Tags texts={tagTexts} />
              {registerStatus === 'PLACE_ONLY' && (
                <LogClick elementName="place_search_item_card_register_building_accessibility_button">
                  <Button
                    text="건물정보 등록 >"
                    size="xs"
                    onPress={() => checkAuth(() => onRegister(true))}
                  />
                </LogClick>
              )}
            </ExtraArea>
          </InfoArea>
          {registerStatus === 'UNAVAILABLE' ? (
            <View style={{width: '100%', gap: 4, marginTop: 12}}>
              <Button
                text="서비스지역이 아닙니다."
                size="lg"
                fillParent
                isDisabled
                onPress={() => {}}
              />
            </View>
          ) : registerStatus === 'NONE' ? (
            <View style={{width: '100%', gap: 8, marginTop: 12}}>
              {!hasBeenRegisteredAccessibility && (
                <Tooltip text="일상속의 계단 정보를 함께 모아주세요!" />
              )}
              <LogClick elementName="place_search_item_card_register_place_accessibility_button">
                <Button
                  text="등록하기 >"
                  size="lg"
                  fillParent
                  onPress={() => checkAuth(() => onRegister(false))}
                />
              </LogClick>
            </View>
          ) : (
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
      </LogViewAndClick>
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
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
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
  gap: 10px;
`;

const Container = styled.Pressable<{isHeightFlex?: boolean}>`
  overflow: visible;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
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
