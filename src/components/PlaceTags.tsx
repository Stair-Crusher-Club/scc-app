import React from 'react';
import {View} from 'react-native';

import PlaceListNameChip from '@/components/PlaceListNameChip';
import {PlaceListNameChipDto} from '@/generated-sources/openapi';
import useNavigation from '@/navigation/useNavigation';

interface PlaceTagsProps {
  chips: PlaceListNameChipDto[];
}

export default function PlaceTags({chips}: PlaceTagsProps) {
  const navigation = useNavigation();

  if (chips.length === 0) {
    return null;
  }

  // 스크롤은 부모(접근레벨 배지까지 포함한 한 줄)가 담당 — 여기선 배지들만 나열.
  return (
    <>
      {chips.map((chip, index) => {
        const placeListId = chip.placeListId;
        return (
          <View key={placeListId ?? index} style={{marginRight: 4}}>
            <PlaceListNameChip
              {...chip}
              elementName="place_tag_place_list"
              logParams={{placeListId}}
              trackView
              onPress={() => {
                if (placeListId) {
                  navigation.navigate('PlaceListDetail', {
                    placeListId,
                    initialViewMode: 'list',
                  });
                }
              }}
            />
          </View>
        );
      })}
    </>
  );
}
