import ChevronRightIcon from '@/assets/icon/ic_chevron_right.svg';
import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';
import type {
  CrusherActivityHistorySummaryTypeDto,
  EpochMillisTimestamp,
} from '@/generated-sources/openapi';
import type {ScreenParams} from '@/navigation/Navigation.screens';
import {cn} from '@/utils/cn';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useCallback} from 'react';
import {Text, View} from 'react-native';
import {formatDateRange} from '../utils/date';

interface HistoryItemProps {
  title: string;
  crusherClubId?: string;
  startAt: EpochMillisTimestamp;
  endAt: EpochMillisTimestamp;
  historyType: CrusherActivityHistorySummaryTypeDto;
  isCurrentCrew?: boolean;
  isFirst?: boolean;
}

export default function HistoryItem({
  title,
  crusherClubId,
  startAt,
  endAt,
  historyType,
  isCurrentCrew,
  isFirst,
}: HistoryItemProps) {
  const navigation = useNavigation<NativeStackNavigationProp<ScreenParams>>();
  const dateText = formatDateRange(startAt.value, endAt.value);
  const isCrewType = historyType === 'CREW';

  const handlePress = useCallback(() => {
    if (!crusherClubId) {
      return;
    }
    navigation.navigate('PastSeasonDetail', {
      crusherClubId,
      title,
    });
  }, [navigation, crusherClubId, title]);

  const content = (
    <View
      className={cn(
        'flex-row items-center gap-3 border-b-[1px] border-gray-20 px-5 py-[15px]',
        !!isFirst && !isCurrentCrew && 'border-t-[1px]',
      )}>
      <View className="flex-1 gap-[6px]">
        <View className="gap-[6px]">
          <Text className="font-pretendard-medium text-[18px] leading-[26px] text-gray-90">
            {historyType === 'CONQUER_ACTIVITY_GUEST'
              ? '정복활동 게스트 참여'
              : title}
          </Text>
          <Text className="font-pretendard-regular text-[14px] leading-[20px] text-gray-50">
            {dateText}
          </Text>
        </View>
      </View>
      {isCrewType && <ChevronRightIcon color={color.gray80} />}
    </View>
  );

  if (isCrewType && crusherClubId) {
    return (
      <SccPressable onPress={handlePress} elementName="history-crew-item">
        {content}
      </SccPressable>
    );
  }

  return <View>{content}</View>;
}
