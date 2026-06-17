import React from 'react';
import {ScrollView} from 'react-native';

import {BadgeShell, BadgeText} from '@/components/BadgeShell';
import {color} from '@/constant/color';
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

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{overflow: 'visible'}}
      contentContainerStyle={{alignItems: 'center'}}>
      {tags.map((tag, index) => renderTag(tag, index, navigation))}
    </ScrollView>
  );
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
        <BadgeShell
          key={index}
          backgroundColor={color.brand5}
          textColor={color.gray80}
          elementName="place_tag_place_list"
          logParams={{placeListId}}
          onPress={() => {
            if (placeListId) {
              navigation.navigate('PlaceListDetail', {
                placeListId,
                initialViewMode: 'map',
              });
            }
          }}
          style={{marginRight: 4}}>
          <BadgeText textColor={color.gray80}>{tag.name}</BadgeText>
        </BadgeShell>
      );
    }
    default: {
      const _exhaustiveCheck: never = tag.type;
      return _exhaustiveCheck;
    }
  }
}
