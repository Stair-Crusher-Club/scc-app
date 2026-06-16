import React from 'react';
import {Platform, ScrollView} from 'react-native';
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
    case PlaceTagTypeDto.SavedList: {
      const placeListId = tag.placeListId;
      return (
        <SavedListTag
          key={index}
          elementName="place_tag_saved_list"
          logParams={{placeListId}}
          onPress={() => {
            if (placeListId) {
              navigation.navigate('PlaceListDetail', {placeListId});
            }
          }}>
          <SavedListTagText>{tag.name}</SavedListTagText>
        </SavedListTag>
      );
    }
    default: {
      const _exhaustiveCheck: never = tag.type;
      return _exhaustiveCheck;
    }
  }
}

const SavedListTag = styled(SccTouchableOpacity)`
  background-color: ${color.brand5};
  border-radius: 4px;
  padding-horizontal: 4px;
  height: 20px;
  margin-right: 4px;
  ${Platform.select({
    ios: {
      'padding-vertical': '4px',
    },
    android: {
      'padding-top': '3px',
      'padding-bottom': '4px',
    },
  })}
`;

const SavedListTagText = styled.Text`
  font-size: 10px;
  font-family: ${font.pretendardRegular};
  color: ${color.gray80};
`;
