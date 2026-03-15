import {color} from '@/constant/color';
import {EpochMillisTimestamp} from '@/generated-sources/openapi';
import React from 'react';
import {Text, View} from 'react-native';
import {cn} from '@/utils/cn';
import {formatDateKorean} from '../utils/date';

interface ActivityItemProps {
  activityDoneAt?: EpochMillisTimestamp;
  title: string;
  visibleLine?: boolean;
  isFirst?: boolean;
  canceledAt?: EpochMillisTimestamp;
}

const ACTIVITY_ITEM_HEIGHT = 52;
const ACTIVITY_ITEM_GAP = 20;
const DOT_SIZE = 10;

export default function ActivityItem({
  activityDoneAt,
  title,
  visibleLine,
  isFirst,
  canceledAt,
}: ActivityItemProps) {
  const isCanceled = !!canceledAt;
  return (
    <View className="h-[52px] flex-row justify-between">
      <View className="flex-row items-start gap-3">
        <View className="h-5 items-center justify-center">
          {visibleLine && (
            <View
              className="absolute left-1 top-[5px] w-[2px] bg-gray-25"
              style={{
                bottom: -Math.abs(
                  ACTIVITY_ITEM_HEIGHT + ACTIVITY_ITEM_GAP - DOT_SIZE,
                ),
              }}
            />
          )}

          <View
            className={cn(
              'h-[10px] w-[10px] rounded-[5px] border-[2px]',
              isFirst
                ? 'border-brand-10 bg-brand-50'
                : 'border-gray-20 bg-gray-50',
            )}
          />
        </View>
        <View className="gap-[6px]">
          <Text
            className={cn(
              'font-pretendard-regular text-[14px] leading-[20px]',
              isCanceled ? 'text-gray-30 line-through' : 'text-gray-50',
            )}>
            {formatDateKorean(activityDoneAt?.value)}
          </Text>
          <Text
            className={cn(
              'font-pretendard-medium text-[18px] leading-[26px]',
              isCanceled ? 'text-gray-30 line-through' : 'text-gray-90',
            )}>
            {title}
          </Text>
        </View>
      </View>
    </View>
  );
}

function ActivityItemGap() {
  return <View className="h-[20px]" />;
}

ActivityItem.Gap = ActivityItemGap;
