import {color} from '@/constant/color';
import {font} from '@/constant/font';
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
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          paddingTop: 168,
          gap: 12,
        }}>
        <Image
          source={require('@/assets/img/img_crusher_history_history_empty.png')}
          style={{
            width: 128,
            height: 60,
          }}
        />
        <Text
          style={{
            textAlign: 'center',
            lineHeight: 24,
            fontSize: 16,
            fontFamily: font.pretendardRegular,
            color: color.gray50,
          }}>
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
