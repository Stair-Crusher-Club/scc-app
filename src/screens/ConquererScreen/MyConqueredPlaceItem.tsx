import React from 'react';

import {PlaceListItem} from '@/generated-sources/openapi';

import {SccPressable} from '@/components/SccPressable';
import {Text, View} from 'react-native';

interface MyConqueredPlaceItemProps {
  item: PlaceListItem;
  onClick: () => void;
}

const MyConqueredPlaceItem = ({item, onClick}: MyConqueredPlaceItemProps) => {
  return (
    <SccPressable
      className="flex-row items-center"
      elementName="my_conquered_place_item"
      onPress={onClick}>
      <View className="flex-1 mr-4">
        <Text className="text-black font-pretendard-medium text-[18px] mb-2">
          {item.place.name}
        </Text>
        <Text className="text-gray-50 font-pretendard-medium text-[14px]">
          {item.place.address}
        </Text>
      </View>
    </SccPressable>
  );
};

export default MyConqueredPlaceItem;
