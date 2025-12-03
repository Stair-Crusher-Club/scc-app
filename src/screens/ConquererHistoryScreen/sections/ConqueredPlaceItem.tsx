import dayjs from 'dayjs';
import React from 'react';
import {Text} from 'react-native';

import {SccPressable} from '@/components/SccPressable';
import {PlaceListItem} from '@/generated-sources/openapi';
import useNavigation from '@/navigation/useNavigation';

export default function ConqueredPlaceItem({p}: {p: PlaceListItem}) {
  const navigation = useNavigation();
  return (
    <SccPressable
      className="p-[20px] border-b-[1px] border-b-gray-20"
      elementName="conquered_place_item"
      logParams={{place_id: p.place.id}}
      key={p.place.id}
      onPress={() =>
        navigation.navigate('PlaceDetail', {
          placeInfo: {placeId: p.place.id},
        })
      }>
      <Text
        className="mb-[4px] font-pretendard-semibold text-black"
        style={{fontSize: 16}}>
        {p.place.name}
      </Text>
      <Text className="mb-[4px] text-gray-50" style={{fontSize: 14}}>
        {p.place.address}
      </Text>
      <Text className="text-gray-50" style={{fontSize: 12}}>
        {dayjs(p.accessibilityInfo?.createdAt?.value).format('YYYY.MM.DD')}
      </Text>
    </SccPressable>
  );
}
