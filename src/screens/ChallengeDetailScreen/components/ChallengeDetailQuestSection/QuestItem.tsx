import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {
  ChallengeQuestCompleteStampTypeDto,
  ChallengeQuestDto,
} from '@/generated-sources/openapi';
import dayjs from 'dayjs';
import React from 'react';
import {Image} from 'react-native';
import styled from 'styled-components/native';
import CurvedDateText from './CurvedDateText';

export type QuestProgress =
  | 'COMPLETED'
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'FAILED'
  | null;

export default function QuestItem({
  completeStampType,
  title,
  description,
  startDate,
  endDate,
  targetCount,
  completedCount,
  completedAt,
}: ChallengeQuestDto) {
  let progress: QuestProgress = null;

  if (completedCount === targetCount && targetCount !== 0) {
    progress = 'COMPLETED';
  } else if (!isEnded(endDate?.value) && completedCount === 0) {
    progress = 'NOT_STARTED';
  } else if (!isEnded(endDate?.value) && completedCount !== targetCount) {
    progress = 'IN_PROGRESS';
  } else {
    progress = 'FAILED';
  }

  const progressbarRatio = safeRatio(completedCount, targetCount);

  return (
    <Container
      progress={progress}
      stampBg={
        progress === 'COMPLETED'
          ? stampMap[completeStampType].backgroundColor
          : undefined
      }>
      <Header>
        <Title progress={progress}>{title}</Title>
        <Period progress={progress}>
          {getMMDD(startDate?.value)}~{getMMDD(endDate?.value)}
        </Period>
      </Header>

      {!!description && <Desc>{description}</Desc>}

      <ProgressRow
        visible={progress === 'IN_PROGRESS' || progress === 'FAILED'}>
        <ProgressTrack>
          <ProgressFill progress={progress} flex={progressbarRatio} />
          <ProgressRest flex={1 - progressbarRatio} />
        </ProgressTrack>
        <Count>
          <CountStrong progress={progress}>{completedCount}</CountStrong>/
          {targetCount}
        </Count>
      </ProgressRow>

      {progress === 'COMPLETED' && (
        <StampWrap>
          <Image
            source={stampMap[completeStampType].uri}
            style={{width: 72, height: 72}}
          />
          <StampDate pointerEvents="none">
            <CurvedDateText
              date={getYYYYMMDD(completedAt?.value)}
              charColor={stampMap[completeStampType].color}
            />
          </StampDate>
        </StampWrap>
      )}
    </Container>
  );
}

/* ---------- styled ---------- */

const Container = styled.View<{progress: QuestProgress; stampBg?: string}>(
  ({progress, stampBg}) => ({
    borderWidth: 1,
    borderColor: progress === 'IN_PROGRESS' ? color.brand50 : color.gray20,
    padding: 12,
    borderRadius: 8,
    backgroundColor:
      progress === 'COMPLETED'
        ? (stampBg ?? color.white)
        : progress === 'FAILED'
          ? color.gray20
          : color.white,
    gap: 8,
    flex: 1,
  }),
);

const Header = styled.View({
  gap: 2,
});

const Title = styled.Text<{progress: QuestProgress}>(({progress}) => ({
  color: progress === 'FAILED' ? color.gray40 : color.gray70,
  fontFamily: font.pretendardSemibold,
  fontSize: 16,
  lineHeight: 22,
}));

const Period = styled.Text<{progress: QuestProgress}>(({progress}) => ({
  color: progress === 'IN_PROGRESS' ? color.brand50 : color.gray40,
  fontFamily: font.pretendardRegular,
  fontSize: 12,
  lineHeight: 16,
}));

const Desc = styled.Text({
  color: color.gray40,
  fontFamily: font.pretendardRegular,
  fontSize: 13,
});

const ProgressRow = styled.View<{visible: boolean}>(({visible}) => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 4,
  opacity: visible ? 1 : 0,
}));

const ProgressTrack = styled.View({
  flex: 1,
  flexDirection: 'row',
  alignItems: 'center',
});

const ProgressFill = styled.View<{progress: QuestProgress; flex: number}>(
  ({progress, flex}) => ({
    backgroundColor: progress === 'FAILED' ? color.gray40 : color.brand50,
    flex: clamp01(flex),
    height: 6,
    borderTopLeftRadius: 100,
    borderBottomLeftRadius: 100,
  }),
);

const ProgressRest = styled.View<{flex: number}>(({flex}) => ({
  backgroundColor: color.gray25,
  flex: clamp01(flex),
  height: 6,
  borderTopRightRadius: 100,
  borderBottomRightRadius: 100,
}));

const Count = styled.Text({
  color: color.gray40,
  fontFamily: font.pretendardMedium,
  fontSize: 12,
});

const CountStrong = styled.Text<{progress: QuestProgress}>(({progress}) => ({
  color: progress === 'IN_PROGRESS' ? color.brand50 : color.gray40,
  fontSize: 12,
}));

const StampWrap = styled.View({
  position: 'absolute',
  right: 10,
  bottom: 10,
});

const StampDate = styled.View({
  position: 'absolute',
  left: 0,
  bottom: 0,
});

/* ---------- constants ---------- */

const stampMap: Record<
  ChallengeQuestCompleteStampTypeDto,
  {
    color: string;
    backgroundColor: string;
    uri: number;
  }
> = {
  FLAG: {
    color: '#4BA5F4',
    backgroundColor: '#F4FAFF',
    uri: require('@/assets/img/stamp/quest_stamp_flag.png'),
  },
  CAFE: {
    color: '#56BAF8',
    backgroundColor: '#56BAF81A',
    uri: require('@/assets/img/stamp/quest_stamp_cafe.png'),
  },
  RESTAURANT: {
    color: '#78ACF6',
    backgroundColor: '#8096B51A',
    uri: require('@/assets/img/stamp/quest_stamp_restaurant.png'),
  },
  THUMBS_UP: {
    color: '#15CADA',
    backgroundColor: '#30BDCA1A',
    uri: require('@/assets/img/stamp/quest_stamp_good.png'),
  },
  POTION: {
    color: '#6588D8',
    backgroundColor: '#7C95CF1A',
    uri: require('@/assets/img/stamp/quest_stamp_potion.png'),
  },
  REVIEW: {
    color: '#00A5DB',
    backgroundColor: '#038DBA1A',
    uri: require('@/assets/img/stamp/quest_stamp_review.png'),
  },
};

/* ---------- utils ---------- */

function getMMDD(v?: number) {
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

function safeRatio(n: number, d: number) {
  if (!d || d <= 0) return 0;
  return Math.min(1, Math.max(0, n / d));
}

function clamp01(x: number) {
  if (Number.isNaN(x)) return 0;
  return Math.min(1, Math.max(0, x));
}
