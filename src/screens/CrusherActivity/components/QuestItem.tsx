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
    <View
      style={{
        alignItems: 'center',
        gap: 6,
      }}>
      <View
        style={[
          {
            width: 84,
            height: 84,
            borderRadius: 42,
            overflow: 'hidden',
          },
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
            : {},
        ]}>
        <Image
          source={source}
          style={{
            width: 84,
            height: 84,
          }}
        />
      </View>

      <View
        style={{
          gap: 2,
          alignItems: 'center',
        }}>
        <Text
          style={{
            fontSize: 14,
            fontFamily: font.pretendardMedium,
            lineHeight: 20,
          }}>
          {title}
        </Text>
        <Text
          style={{
            fontSize: 12,
            fontFamily: font.pretendardRegular,
            lineHeight: 16,
            color: color.gray50,
          }}>
          {completedAt?.value
            ? `${formatDateDot(completedAt?.value)} 획득`
            : ''}
        </Text>
      </View>
    </View>
  );
}

function QuestItemGap() {
  return <View style={{height: 16}} />;
}

QuestItem.Gap = QuestItemGap;
