import {useQuery} from '@tanstack/react-query';
import {useAtomValue} from 'jotai';
import React from 'react';
import {ScrollView, View} from 'react-native';
import styled from 'styled-components/native';

import {currentLocationAtom} from '@/atoms/Location';
import {SccTouchableOpacity} from '@/components/SccTouchableOpacity';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {
  PlaceSearchRecommendationDto,
  PlaceSearchRecommendationTypeDto,
} from '@/generated-sources/openapi';
import useAppComponents from '@/hooks/useAppComponents';
import {draftCameraRegionAtom} from '@/screens/SearchScreen/atoms';
import useNavigation from '@/navigation/useNavigation';
import {Region} from '@/components/maps/Types';

export default function PlaceSearchRecommendationChips() {
  const {api} = useAppComponents();
  const navigation = useNavigation();
  const draftCameraRegion = useAtomValue(draftCameraRegionAtom);
  const currentLocation = useAtomValue(currentLocationAtom);

  const rectangleRegion = draftCameraRegion
    ? {
        leftTopLocation: {
          lat: draftCameraRegion.northEast.latitude,
          lng: draftCameraRegion.southWest.longitude,
        },
        rightBottomLocation: {
          lat: draftCameraRegion.southWest.latitude,
          lng: draftCameraRegion.northEast.longitude,
        },
      }
    : undefined;

  const centerLocation = draftCameraRegion
    ? {
        lat:
          (draftCameraRegion.northEast.latitude +
            draftCameraRegion.southWest.latitude) /
          2,
        lng:
          (draftCameraRegion.northEast.longitude +
            draftCameraRegion.southWest.longitude) /
          2,
      }
    : currentLocation
      ? {lat: currentLocation.latitude, lng: currentLocation.longitude}
      : null;

  const {data} = useQuery({
    enabled: centerLocation != null,
    queryKey: [
      'PlaceSearchRecommendations',
      draftCameraRegion as Region | null,
    ],
    queryFn: async () => {
      if (!centerLocation) {
        return [];
      }
      const response = await api.listPlaceSearchRecommendations({
        currentLocation: centerLocation,
        rectangleRegion,
      });
      return response.data.items;
    },
  });

  const items = data ?? [];
  if (items.length === 0) {
    return null;
  }

  const handleChipPress = (item: PlaceSearchRecommendationDto) => {
    switch (item.type) {
      case PlaceSearchRecommendationTypeDto.RegionBased: {
        if (item.placeListId) {
          navigation.navigate('PlaceListDetail', {
            placeListId: item.placeListId,
          });
        }
        return;
      }
      default: {
        const _exhaustiveCheck: never = item.type;
        return _exhaustiveCheck;
      }
    }
  };

  return (
    <Container>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{overflow: 'visible'}}>
        <View style={{flexDirection: 'row', gap: 6}}>
          {items.map(item => (
            <Chip
              key={item.id}
              elementName="place_search_recommendation_chip"
              logParams={{
                recommendationId: item.id,
                placeListId: item.placeListId,
              }}
              onPress={() => handleChipPress(item)}>
              <ChipText>{item.name}</ChipText>
            </Chip>
          ))}
        </View>
      </ScrollView>
    </Container>
  );
}

const Container = styled.View`
  padding-horizontal: 16px;
  padding-top: 8px;
`;

const Chip = styled(SccTouchableOpacity)`
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 8px 18px;
  border-width: 1px;
  border-color: ${color.gray20};
  background-color: ${color.white};
  border-radius: 56px;
`;

const ChipText = styled.Text`
  font-size: 15px;
  font-family: ${font.pretendardMedium};
  color: ${color.gray90};
`;
