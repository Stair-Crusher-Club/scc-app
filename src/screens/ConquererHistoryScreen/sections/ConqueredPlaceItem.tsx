import dayjs from 'dayjs';
import React from 'react';
import {SccPressable} from '@/components/SccPressable';
import {Text} from 'react-native';
import {usePlaceDetailScreenName} from '@/hooks/useFeatureFlags';
import {PlaceListItem} from '@/generated-sources/openapi';
import useNavigation from '@/navigation/useNavigation';

export default function ConqueredPlaceItem({p}: {p: PlaceListItem}) {
  const navigation = useNavigation();
  const pdpScreen = usePlaceDetailScreenName();
  return (
    <SccPressable
      className="p-5 border-b-[1px] border-b-gray-20"
      elementName="conquered_place_item"
      logParams={{place_id: p.place.id}}
      key={p.place.id}
      onPress={() =>
        navigation.navigate(pdpScreen, {
          placeInfo: {placeId: p.place.id},
        })
      }>
      <Text className="text-[16px] font-pretendard-semibold text-black mb-1">
        {p.place.name}
      </Text>
      <Text className="text-[14px] text-gray-50 mb-1">{p.place.address}</Text>
      <Text className="text-[12px] text-gray-50">
        {dayjs(p.accessibilityInfo?.createdAt?.value).format('YYYY.MM.DD')}
      </Text>
    </SccPressable>
  );
}
