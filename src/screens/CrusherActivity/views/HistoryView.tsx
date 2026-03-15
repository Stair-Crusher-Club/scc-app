import type {CrusherActivityHistorySummaryDto} from '@/generated-sources/openapi';
import React from 'react';
import {Image, ScrollView, Text, View} from 'react-native';
import HistoryItem from '../components/HistoryItem';

interface HistoryViewProps {
  crusherActivityHistories?: CrusherActivityHistorySummaryDto[];
  isCurrentCrew: boolean;
}

export default function HistoryView({
  crusherActivityHistories,
  isCurrentCrew,
}: HistoryViewProps) {
  if (!crusherActivityHistories || crusherActivityHistories.length === 0) {
    return (
      <View className="items-center justify-center gap-3 pt-[168px]">
        <Image
          source={require('@/assets/img/img_crusher_history_history_empty.png')}
          className="h-[60px] w-[128px]"
        />
        <Text className="text-center font-pretendard-regular text-[16px] leading-[24px] text-gray-50">
          준비중입니다.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView>
      {crusherActivityHistories.map((history, index) => (
        <HistoryItem
          key={index}
          title={history.title}
          crusherClubId={history.crusherClubId}
          startAt={history.startAt}
          endAt={history.endAt}
          historyType={history.historyType}
          isCurrentCrew={isCurrentCrew}
          isFirst={index === 0}
        />
      ))}
    </ScrollView>
  );
}
