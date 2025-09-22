import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {EpochMillisTimestamp} from '@/generated-sources/openapi';
import React from 'react';
import {Text, View} from 'react-native';
import {formatDateKorean} from '../utils/date';

interface ActivityItemProps {
  activityDoneAt?: EpochMillisTimestamp;
  title: string;
  visibleLine?: boolean;
}

const ACTIVITY_ITEM_HEIGHT = 52;
const ACTIVITY_ITEM_GAP = 20;
const DOT_SIZE = 10;

export default function ActivityItem({
  activityDoneAt,
  title,
  visibleLine,
}: ActivityItemProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        height: ACTIVITY_ITEM_HEIGHT,
      }}>
      <View style={{gap: 12, flexDirection: 'row', alignItems: 'flex-start'}}>
        <View
          style={{
            height: 20,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          {visibleLine && (
            <View
              style={{
                position: 'absolute',
                left: 4,
                top: DOT_SIZE / 2,
                bottom: -Math.abs(
                  ACTIVITY_ITEM_HEIGHT + ACTIVITY_ITEM_GAP - DOT_SIZE,
                ),
                width: 2,
                backgroundColor: color.gray25,
              }}
            />
          )}

          <View
            style={{
              width: DOT_SIZE,
              height: DOT_SIZE,
              borderRadius: DOT_SIZE / 2,
              paddingVertical: 2,
              backgroundColor: color.gray50,
              borderWidth: 2,
              borderColor: color.gray20,
            }}
          />
        </View>
        <View style={{gap: 6}}>
          <Text
            style={{
              fontSize: 14,
              fontFamily: font.pretendardRegular,
              lineHeight: 20,
              color: color.gray50,
            }}>
            {formatDateKorean(activityDoneAt?.value)}
          </Text>
          <Text
            style={{
              fontSize: 18,
              fontFamily: font.pretendardMedium,
              lineHeight: 26,
              color: color.gray90,
            }}>
            {title}
          </Text>
        </View>
      </View>
    </View>
  );
}

function ActivityItemGap() {
  return <View style={{height: ACTIVITY_ITEM_GAP}} />;
}

ActivityItem.Gap = ActivityItemGap;
