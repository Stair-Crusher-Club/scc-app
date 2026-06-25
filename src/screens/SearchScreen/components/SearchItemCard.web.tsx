import React, {memo} from 'react';
import {Image, View} from 'react-native';
import styled from 'styled-components/native';
import {useAtomValue} from 'jotai';

import {currentLocationAtom} from '@/atoms/Location';
import {SccPressable} from '@/components/SccPressable';
import {SccTouchableOpacity} from '@/components/SccTouchableOpacity';
import Tags from '@/components/Tag';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {
  BbucleRoadAccessibilityDtoBbucleRoadTypeEnum,
  PlaceListItem,
} from '@/generated-sources/openapi';
import {LogParamsProvider} from '@/logging/LogParamsProvider';
import {getPlaceCategoryLabel} from '@/models/Place';
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

  const bbucleRoadData = item.specialAccessibility?.bbucleRoadData;

  // Bbucle road card variant
  if (bbucleRoadData) {
    const bbucleRoadTypeText = ((): string => {
      switch (bbucleRoadData.bbucleRoadType) {
        case BbucleRoadAccessibilityDtoBbucleRoadTypeEnum.BaseballStadium:
          return '야구장';
        case BbucleRoadAccessibilityDtoBbucleRoadTypeEnum.ConcertHall:
          return '공연장';
        default: {
          const _exhaustiveCheck: never = bbucleRoadData.bbucleRoadType;
          return _exhaustiveCheck;
        }
      }
    })();
    const bbucleRoadEmoji = ((): string => {
      switch (bbucleRoadData.bbucleRoadType) {
        case BbucleRoadAccessibilityDtoBbucleRoadTypeEnum.BaseballStadium:
          return '⚾️';
        case BbucleRoadAccessibilityDtoBbucleRoadTypeEnum.ConcertHall:
          return '🎤';
        default: {
          const _exhaustiveCheck: never = bbucleRoadData.bbucleRoadType;
          return _exhaustiveCheck;
        }
      }
    })();

    return (
      <LogParamsProvider
        params={{
          place_id: item.place.id,
          place_name: item.place.name,
          is_bbucle_road: true,
          bbucle_road_type: bbucleRoadData.bbucleRoadType,
        }}>
        <Container
          elementName="place_search_item_card_bbucle"
          isHeightFlex={isHeightFlex}
          onPress={onPress}>
          <InfoArea>
            <BbucleRoadLabelIconRow>
              <BbucleRoadBadge>
                <BbucleRoadBadgeText>{`뿌클로드 ${bbucleRoadTypeText} ${bbucleRoadEmoji}`}</BbucleRoadBadgeText>
              </BbucleRoadBadge>
              <IconArea>
                <SccTouchableOpacity
                  elementName="bbucle_card_bookmark"
                  logParams={{is_favorite: isFavorite}}
                  style={{
                    paddingLeft: 5,
                    paddingRight: 5,
                    paddingBottom: 5,
                  }}
                  activeOpacity={0.6}
                  onPress={() =>
                    checkAuth(
                      onFavorite,
                      undefined,
                      '앱에서 마음에 드는 장소를 저장해보세요',
                    )
                  }>
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
                  elementName="bbucle_card_share"
                  style={{
                    paddingLeft: 5,
                    paddingBottom: 5,
                  }}
                  activeOpacity={0.6}
                  onPress={onShare}>
                  <ShareIcon width={24} height={24} color={color.gray70} />
                </SccTouchableOpacity>
              </IconArea>
            </BbucleRoadLabelIconRow>
            <TitleArea>
              <TextWrapper>
                <TitleText>{item.place.name}</TitleText>
              </TextWrapper>
              <LocationBox>
                <DistanceText>{distanceText}</DistanceText>
                <LocationDivider />
                <AddressText>{item.place.address}</AddressText>
              </LocationBox>
            </TitleArea>
          </InfoArea>
          {bbucleRoadData.thumbnailImageUrl ? (
            <BbucleThumbnailContainer>
              <BbucleThumbnailImage
                source={{uri: bbucleRoadData.thumbnailImageUrl}}
                resizeMode="cover"
              />
            </BbucleThumbnailContainer>
          ) : null}
        </Container>
      </LogParamsProvider>
    );
  }

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
                onPress={() =>
                  checkAuth(
                    onFavorite,
                    undefined,
                    '앱에서 마음에 드는 장소를 저장해보세요',
                  )
                }>
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
              <CategoryText>{getPlaceCategoryLabel(item.place)}</CategoryText>
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

const BbucleRoadLabelIconRow = styled.View`
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 4px;
`;

const BbucleRoadBadge = styled.View`
  background-color: rgba(162, 255, 32, 0.3);
  border-radius: 6px;
  padding: 4px 6px;
  align-self: flex-start;
`;

const BbucleRoadBadgeText = styled.Text`
  font-size: 12px;
  font-family: ${() => font.pretendardMedium};
  color: #305306;
  line-height: 15.6px;
`;

const BbucleThumbnailContainer = styled.View`
  width: 100%;
  height: 120px;
  border-radius: 8px;
  overflow: hidden;
  margin-top: 12px;
`;

const BbucleThumbnailImage = styled(Image)`
  width: 100%;
  height: 100%;
`;

export default memo(SearchItemCard);
