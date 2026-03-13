import React from 'react';
import {Text, View} from 'react-native';

import IcBuilding from '@/assets/icon/ic_building.svg';
import IcPlace from '@/assets/icon/ic_place.svg';
import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';

interface PlaceInfoSectionProps {
  name?: string;
  address?: string;
  target?: 'place' | 'building';
  onGuidePress?: () => void;
}

export default function PlaceInfoSection({
  name,
  address,
  target,
  onGuidePress,
}: PlaceInfoSectionProps) {
  const Icon = target === 'place' ? IcPlace : IcBuilding;
  const badgeText =
    target === 'place' ? '새로운 장소 발견!' : '새로운 건물 발견!';
  const badgeColor = target === 'place' ? color.orange40 : color.brand50;

  return (
    <View className="p-5 bg-white items-start gap-2">
      {target && (
        <View className="flex-row items-center gap-1">
          <Icon width={16} height={16} />
          <Text
            className="font-pretendard-bold text-[14px] leading-[20px]"
            style={{color: badgeColor}}>
            {badgeText}
          </Text>
        </View>
      )}
      <View className="gap-0.5">
        <Text className="font-pretendard-semibold text-[20px] leading-[28px] text-gray-90">
          {name}
        </Text>
        <Text className="font-pretendard-regular text-[15px] leading-[22px] text-gray-60">
          {address}
        </Text>
      </View>
      {onGuidePress && (
        <SccPressable
          elementName="place_info_guide_reopen"
          onPress={onGuidePress}>
          <Text className="font-pretendard-medium text-[14px] leading-[20px] text-gray-60 underline">
            {'가이드 보기 >'}
          </Text>
        </SccPressable>
      )}
    </View>
  );
}
