import dayjs from 'dayjs';
import React from 'react';
import styled from 'styled-components/native';

import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';
import {PlaceListItem} from '@/generated-sources/openapi';
import useNavigation from '@/navigation/useNavigation';

export default function ConqueredPlaceItem({p}: {p: PlaceListItem}) {
  const navigation = useNavigation();
  return (
    <PlaceRow
      elementName="conquered_place_item"
      key={p.place.id}
      onPress={() =>
        navigation.navigate('PlaceDetail', {
          placeInfo: {placeId: p.place.id},
        })
      }>
      <PlaceName>{p.place.name}</PlaceName>
      <PlaceAddress>{p.place.address}</PlaceAddress>
      <ConqueredDate>
        {dayjs(p.accessibilityInfo?.createdAt?.value).format('YYYY.MM.DD')}
      </ConqueredDate>
    </PlaceRow>
  );
}

const PlaceRow = styled(SccPressable)`
  padding: 20px;
  border-bottom-width: 1px;
  border-bottom-color: ${color.gray20};
`;

const PlaceName = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: ${color.black};
  margin-bottom: 4px;
`;

const PlaceAddress = styled.Text`
  font-size: 14px;
  color: ${color.gray50};
  margin-bottom: 4px;
`;

const ConqueredDate = styled.Text`
  font-size: 12px;
  color: ${color.gray50};
`;
