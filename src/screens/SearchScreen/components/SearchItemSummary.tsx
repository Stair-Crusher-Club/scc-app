import {useAtomValue} from 'jotai';
import React from 'react';
import styled from 'styled-components/native';

import {currentLocationAtom} from '@/atoms/Location';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {PlaceListItem} from '@/generated-sources/openapi';
import ScoreLabel from '@/screens/SearchScreen/components/ScoreLabel';
import {distanceInMeter, prettyFormatMeter} from '@/utils/DistanceUtils';

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

  return (
    <Container onPress={onPress}>
      {item.accessibilityInfo?.accessibilityScore === undefined ? (
        <NoInfoText>
          {item.hasPlaceAccessibility
            ? '건물 입구정보가 필요해요!'
            : '등록된 정보가 없어요!'}
        </NoInfoText>
      ) : (
        <ScoreLabel
          score={item.accessibilityInfo?.accessibilityScore}
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

const Container = styled.Pressable`
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
