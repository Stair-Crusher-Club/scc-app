import React from 'react';
import {View} from 'react-native';

import PlaceListNameChip from '@/components/PlaceListNameChip';
import {PlaceTagDto, PlaceTagTypeDto} from '@/generated-sources/openapi';
import useNavigation from '@/navigation/useNavigation';

interface PlaceTagsProps {
  tags: PlaceTagDto[];
}

export default function PlaceTags({tags}: PlaceTagsProps) {
  const navigation = useNavigation();

  if (tags.length === 0) {
    return null;
  }

  // 스크롤은 부모(접근레벨 배지까지 포함한 한 줄)가 담당 — 여기선 배지들만 나열.
  return <>{tags.map((tag, index) => renderTag(tag, index, navigation))}</>;
}

function renderTag(
  tag: PlaceTagDto,
  index: number,
  navigation: ReturnType<typeof useNavigation>,
): React.ReactElement {
  switch (tag.type) {
    case PlaceTagTypeDto.PlaceList: {
      const placeListId = tag.placeListId;
      return (
        <View key={index} style={{marginRight: 4}}>
          <PlaceListNameChip
            {...tag.nameChip}
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
    }
    default: {
      const _exhaustiveCheck: never = tag.type;
      return _exhaustiveCheck;
    }
  }
}
