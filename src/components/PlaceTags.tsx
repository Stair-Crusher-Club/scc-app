import React from 'react';
import {ScrollView} from 'react-native';
import styled from 'styled-components/native';

import {SccTouchableOpacity} from '@/components/SccTouchableOpacity';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
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
      style={{overflow: 'visible'}}>
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
        <PlaceListTag
          key={index}
          elementName="place_tag_place_list"
          logParams={{placeListId}}
          onPress={() => {
            if (placeListId) {
              navigation.navigate('PlaceListDetail', {placeListId});
            }
          }}>
          <PlaceListTagText>{tag.name}</PlaceListTagText>
        </PlaceListTag>
      );
    }
    default: {
      const _exhaustiveCheck: never = tag.type;
      return _exhaustiveCheck;
    }
  }
}

const PlaceListTag = styled(SccTouchableOpacity)`
  background-color: ${color.brand5};
  border-radius: 4px;
  padding-horizontal: 6px;
  padding-vertical: 4px;
  margin-right: 4px;
`;

const PlaceListTagText = styled.Text`
  font-size: 12px;
  font-family: ${font.pretendardMedium};
  color: ${color.gray80};
`;
