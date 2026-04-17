import {useAtomValue} from 'jotai';
import React from 'react';
import styled from 'styled-components/native';

import {currentLocationAtom} from '@/atoms/Location';
import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {
  BbucleRoadAccessibilityDtoBbucleRoadTypeEnum,
  PlaceListItem,
} from '@/generated-sources/openapi';
import ScoreLabel from '@/screens/SearchScreen/components/ScoreLabel';
import {distanceInMeter, prettyFormatMeter} from '@/utils/DistanceUtils';
import {getPlaceAccessibilityScore} from '@/utils/accessibilityCheck';

export default function SearchItemSummary({
  item,
  onPress,
}: {
  item: PlaceListItem;
  onPress: () => void;
}) {
  const currentLocation = useAtomValue(currentLocationAtom);
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

  const bbucleRoadData = item.specialAccessibility?.bbucleRoadData;
  const bbucleRoadBadgeText = ((): string | undefined => {
    if (!bbucleRoadData) return undefined;
    switch (bbucleRoadData.bbucleRoadType) {
      case BbucleRoadAccessibilityDtoBbucleRoadTypeEnum.BaseballStadium:
        return '뿌클로드 야구장 ⚾️';
      case BbucleRoadAccessibilityDtoBbucleRoadTypeEnum.ConcertHall:
        return '뿌클로드 공연장 🎤';
      default: {
        const _exhaustiveCheck: never = bbucleRoadData.bbucleRoadType;
        return _exhaustiveCheck;
      }
    }
  })();

  return (
    <Container elementName="search_item_summary" onPress={onPress}>
      {bbucleRoadBadgeText ? (
        <BbucleRoadBadge>
          <BbucleRoadBadgeText>{bbucleRoadBadgeText}</BbucleRoadBadgeText>
        </BbucleRoadBadge>
      ) : item.accessibilityInfo?.accessibilityScore === undefined ? (
        <NoInfoText>
          {item.hasPlaceAccessibility
            ? '건물 입구정보가 필요해요!'
            : '등록된 정보가 없어요!'}
        </NoInfoText>
      ) : (
        <ScoreLabel
          score={getPlaceAccessibilityScore({
            score: item.accessibilityInfo?.accessibilityScore,
            hasPlaceAccessibility: item.hasPlaceAccessibility,
            hasBuildingAccessibility: item.hasBuildingAccessibility,
          })}
          isIconVisible={false}
        />
      )}
      <TitleArea>
        <TitleText>{item.place.name}</TitleText>
        <LocationBox>
          <DistanceText>{distanceText}</DistanceText>
          <LocationDivider />
          <AddressText>{item.place.address}</AddressText>
        </LocationBox>
      </TitleArea>
    </Container>
  );
}

const NoInfoText = styled.Text`
  font-size: 12px;
  font-family: ${() => font.pretendardRegular};
  color: ${() => color.gray50};
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

const Container = styled(SccPressable)`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
`;

const TitleText = styled.Text`
  font-size: 16px;
  font-family: ${() => font.pretendardBold};
  color: ${() => color.black};
`;

const DistanceText = styled.Text`
  font-size: 14px;
  font-family: ${() => font.pretendardRegular};
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

const TitleArea = styled.View`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  margin-bottom: 8px;
`;
