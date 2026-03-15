import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {EpochMillisTimestamp} from '@/generated-sources/openapi';
import React from 'react';
import {Image, ImageSourcePropType, Text, View} from 'react-native';
import {formatDateDot} from '../utils/date';

interface QuestItemProps {
  source?: ImageSourcePropType;
  title: string;
  completedAt?: EpochMillisTimestamp;
}

export default function QuestItem({
  source,
  title,
  completedAt,
}: QuestItemProps) {
  return (
    <View className="items-center gap-[6px]">
      <View
        className="h-[84px] w-[84px] overflow-hidden rounded-[42px]"
        style={
          completedAt?.value
            ? {
                boxShadow: [
                  {
                    offsetX: 0,
                    offsetY: 0,
                    blurRadius: 5,
                    spreadDistance: 0,
                    color: 'rgba(0, 0, 0, 0.05)',
                  },
                ],
              }
            : undefined
        }>
        <Image
          source={source}
          className="h-[84px] w-[84px]"
        />
      </View>

      <View className="items-center gap-[2px]">
        <Text className="font-pretendard-medium text-[14px] leading-[20px] text-black">
          {title}
        </Text>
        <Text className="font-pretendard-regular text-[12px] leading-[16px] text-gray-50">
          {completedAt?.value
            ? `${formatDateDot(completedAt?.value)} 획득`
            : ''}
        </Text>
      </View>
    </View>
  );
}

function QuestItemGap() {
  return <View className="h-4" />;
}

QuestItem.Gap = QuestItemGap;
