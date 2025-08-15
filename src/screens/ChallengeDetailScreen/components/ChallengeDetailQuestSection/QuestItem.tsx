import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {ChallengeQuestDto} from '@/generated-sources/openapi';
import dayjs from 'dayjs';
import {Image, Text, View} from 'react-native';
import CurvedDateText from './CurvedDateText';

export type QuestStampType =
  | 'FLAG'
  | 'CAFE'
  | 'GOOD'
  | 'POTION'
  | 'RESTAURANT'
  | 'REVIEW';

export type QuestProgress =
  | 'COMPLETED' // 성공
  | 'NOT_STARTED' // 시작 전
  | 'IN_PROGRESS' // 진행 중
  | 'FAILED' // 실패
  | null;

export default function QuestItem({
  // id,
  type,
  title,
  description,
  startDate,
  endDate,
  targetCount,
  completedCount,
  completedAt,
}: ChallengeQuestDto & {
  type: QuestStampType;
}) {
  let progress: QuestProgress = null;

  if (completedCount === targetCount) {
    progress = 'COMPLETED';
  } else if (!isEnded(endDate?.value) && completedCount === 0) {
    progress = 'NOT_STARTED';
  } else if (!isEnded(endDate?.value) && completedCount !== targetCount) {
    progress = 'IN_PROGRESS';
  } else {
    progress = 'FAILED';
  }

  const progressbarRatio = completedCount / targetCount;

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: progress === 'IN_PROGRESS' ? color.brand50 : color.gray20,
        padding: 12,
        borderRadius: 8,
        backgroundColor:
          progress === 'COMPLETED'
            ? stampMap[type].backgroundColor
            : progress === 'FAILED'
              ? color.gray20
              : color.white,
        gap: 8,
        flex: 1,
      }}>
      <View
        style={{
          gap: 2,
        }}>
        <Text
          style={{
            color: progress === 'FAILED' ? color.gray40 : color.gray70,
            fontFamily: font.pretendardSemibold,
            fontSize: 16,
            lineHeight: 22,
          }}>
          {title}
        </Text>
        <Text
          style={{
            color: progress === 'IN_PROGRESS' ? color.brand50 : color.gray40,
            fontFamily: font.pretendardRegular,
            fontSize: 12,
            lineHeight: 16,
          }}>
          {getYYYYMM(startDate?.value)}~{getYYYYMM(endDate?.value)}
        </Text>
      </View>
      <Text
        style={{
          color: color.gray40,
          fontFamily: font.pretendardRegular,
          fontSize: 13,
        }}>
        {description}
      </Text>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          opacity: progress === 'IN_PROGRESS' || progress === 'FAILED' ? 1 : 0,
        }}>
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <View
            style={{
              backgroundColor:
                progress === 'FAILED' ? color.gray40 : color.brand50,
              flex: progressbarRatio,
              height: 6,
              borderTopLeftRadius: 100,
              borderBottomLeftRadius: 100,
            }}
          />
          <View
            style={{
              backgroundColor: color.gray25,
              flex: 1 - progressbarRatio,
              height: 6,
              borderTopRightRadius: 100,
              borderBottomRightRadius: 100,
            }}
          />
        </View>
        <Text
          style={{
            color: color.gray40,
            fontFamily: font.pretendardMedium,
            fontSize: 12,
          }}>
          <Text
            style={{
              color: progress === 'IN_PROGRESS' ? color.brand50 : color.gray40,
              fontSize: 12,
            }}>
            {completedCount}
          </Text>
          /{targetCount}
        </Text>
      </View>

      {progress === 'COMPLETED' && (
        <View
          style={{
            position: 'absolute',
            right: 10,
            bottom: 10,
          }}>
          <Image source={stampMap[type].uri} style={{width: 72, height: 72}} />
          <View
            pointerEvents="none"
            style={{position: 'absolute', left: 0, bottom: 0}}>
            <CurvedDateText
              date={getYYYYMMDD(completedAt?.value)}
              charColor={stampMap[type].color}
            />
          </View>
        </View>
      )}
    </View>
  );
}

const stampMap: Record<
  QuestStampType,
  {
    color: string;
    backgroundColor: string;
    uri: number;
  }
> = {
  FLAG: {
    color: '#4799E2',
    backgroundColor: '#F4FAFF',
    uri: require('@/assets/img/quest_stamp_flag.png'),
  },
  CAFE: {
    color: '#56BAF8',
    backgroundColor: '#56BAF81A',
    uri: require('@/assets/img/quest_stamp_cafe.png'),
  },
  RESTAURANT: {
    color: '#8096B5',
    backgroundColor: '#8096B51A',
    uri: require('@/assets/img/quest_stamp_restaurant.png'),
  },
  GOOD: {
    color: '#30BDCA',
    backgroundColor: '#30BDCA1A',
    uri: require('@/assets/img/quest_stamp_good.png'),
  },
  POTION: {
    color: '#7C95CF',
    backgroundColor: '#7C95CF1A',
    uri: require('@/assets/img/quest_stamp_potion.png'),
  },
  REVIEW: {
    color: '#038DBA',
    backgroundColor: '#038DBA1A',
    uri: require('@/assets/img/quest_stamp_review.png'),
  },
};

function getYYYYMM(v?: number) {
  if (!v) return '';
  return dayjs(v).format('MM.DD');
}

function getYYYYMMDD(v?: number) {
  if (!v) return '';
  return dayjs(v).format('YYYY.MM.DD');
}

function isEnded(endDateValue?: number) {
  if (!endDateValue) return false;
  const end = dayjs(endDateValue);
  const today = dayjs();
  return end.isBefore(today, 'day');
}
