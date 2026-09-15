import React from 'react';
import {Text, View} from 'react-native';

import IcMilestone1Off from '@/assets/icon/ic_milestone_1_off.svg';
import IcMilestone1On from '@/assets/icon/ic_milestone_1_on.svg';
import IcMilestone2Off from '@/assets/icon/ic_milestone_2_off.svg';
import IcMilestone2On from '@/assets/icon/ic_milestone_2_on.svg';
import {cn} from '@/utils/cn';

interface ChallengeProgressBarProps {
  contributionsCount: number;
  goal: number;
  /** 중간목표. 비어있으면(또는 goal<=0) 100% 마커만 렌더한다. */
  milestones?: number[] | null;
  /** 'detail': 숫자행+라벨 포함(챌린지 상세). 'home': 트랙+마커만(홈 카드 내장용). */
  size?: 'detail' | 'home';
}

/** goal=0(ctpl 비어있음) 0 나눗셈 가드. 정복수>goal 은 100% 로 클램프. */
export function getChallengeProgressFillPercent(
  contributionsCount: number,
  goal: number,
): number {
  if (goal <= 0) {
    return 0;
  }
  return Math.min(contributionsCount / goal, 1) * 100;
}

export interface ChallengeProgressTick {
  /** 정확한 위치(소수 가능) — 마커 배치에 사용 */
  percent: number;
  /** 반올림 표시값 ('N%') */
  label: string;
  showLabel: boolean;
}

// Figma 실측(166:7646/166:7834): 트랙 높이 12px. 마커 원 지름 32px(detail)/30px(home),
// 내부 아이콘 20px(detail)/18px(home) — 원과 아이콘 모두 중앙정렬.
const TRACK_HEIGHT = 12;
const MARKER_DIAMETER: Record<'detail' | 'home', number> = {
  detail: 32,
  home: 30,
};
const MARKER_ICON_SIZE: Record<'detail' | 'home', number> = {
  detail: 20,
  home: 18,
};
// 라벨(짧은 %텍스트)의 근사 중앙정렬 오프셋 — 텍스트 폭 실측 대신 근사치(아래 참고).
const TICK_LABEL_CENTER_OFFSET = -14;

/** 눈금이 달성 구간 안에 있는지. fill이 0이면 어떤 눈금도 달성이 아니다. */
export function isReached(tickPercent: number, fillPercent: number): boolean {
  return fillPercent > 0 && tickPercent <= fillPercent;
}

export interface TickPositionStyle {
  left?: number | `${number}%`;
  right?: number;
  marginLeft?: number;
}

/**
 * 100% 눈금을 중앙(percent 그대로)에 놓으면 트랙 밖으로 절반이 삐져나온다
 * (Figma 원본도 x=331로 안쪽에 여유를 뒀다) — 마지막 눈금은 트랙 안쪽에 딱 붙이고,
 * 중간 눈금만 `middleOffset`(마커 반지름)만큼 중앙정렬한다.
 */
export function getTickPositionStyle(
  percent: number,
  middleOffset: number,
): TickPositionStyle {
  if (percent === 0) {
    return {left: 0};
  }
  if (percent === 100) {
    return {right: 0};
  }
  return {left: `${percent}%`, marginLeft: middleOffset};
}

// ponytail: 텍스트 폭을 실측하지 않은 근사 임계값 — 이 간격보다 가까운 두 라벨은
// 겹칠 수 있다고 보고 뒤쪽 라벨을 생략한다(마커는 항상 그린다). 실제로 겹치는
// 신고가 오면 onLayout 측정으로 승격.
const MIN_LABEL_GAP_PERCENT = 6;

/**
 * 마일스톤 위치를 %로 환산해 진행바 눈금을 만든다. 0% 눈금은 없다(항상 마커가
 * 필요한 것은 100% 뿐). milestones가 비어있거나 goal<=0이면(0 나눗셈 방지)
 * 100% 마커만 반환한다.
 */
export function getChallengeProgressTicks(
  milestones: number[] | undefined | null,
  goal: number,
): ChallengeProgressTick[] {
  const middlePercents = (() => {
    if (goal <= 0 || !milestones || milestones.length === 0) {
      return [];
    }
    const percents = milestones
      // 데이터 오류 방어: 음수/goal 초과 마일스톤은 0~goal로 클램프
      .map(m => (Math.max(0, Math.min(m, goal)) / goal) * 100)
      // 100%는 마지막 눈금이 이미 담당 — 중복 방지를 위해 중간 구간만 남긴다
      .filter(p => p > 0 && p < 100);
    // 반올림 기준 중복 제거 + 정렬 (비정렬/중복 마일스톤 방어)
    const dedup = new Map<number, number>();
    for (const p of percents) {
      const key = Math.round(p);
      if (!dedup.has(key)) {
        dedup.set(key, p);
      }
    }
    return Array.from(dedup.values()).sort((a, b) => a - b);
  })();

  const allPercents = [...middlePercents, 100];

  let lastShownPercent = -Infinity;
  return allPercents.map((percent, index) => {
    const isLast = index === allPercents.length - 1;
    const showLabel =
      isLast || percent - lastShownPercent >= MIN_LABEL_GAP_PERCENT;
    if (showLabel) {
      lastShownPercent = percent;
    }
    return {
      percent,
      label: `${Math.round(percent)}%`,
      showLabel,
    };
  });
}

const ChallengeProgressBar = ({
  contributionsCount,
  goal,
  milestones,
  size = 'detail',
}: ChallengeProgressBarProps) => {
  const fillPercent = getChallengeProgressFillPercent(contributionsCount, goal);
  const ticks = getChallengeProgressTicks(milestones, goal);
  const diameter = MARKER_DIAMETER[size];
  const iconSize = MARKER_ICON_SIZE[size];
  const radius = diameter / 2;
  // 마커(32/30)가 트랙(12)보다 굵어서 행 높이를 마커 지름에 맞춘다 — 이러면
  // 마커를 top:0 으로 그냥 채우면 되고(오버플로 계산 불필요), 트랙만 그 행
  // 안에서 세로 중앙(topOffset)에 놓으면 된다. Figma의 "Group 1437258217" 행이
  // 실제로 마커 지름과 같은 높이다(166:7654 h32 / 166:7841 h30).
  const trackTopOffset = (diameter - TRACK_HEIGHT) / 2;

  const track = (
    <View className="relative" style={{height: diameter}}>
      {/* ponytail: fill 폭 · 마커 위치 전부 props/마일스톤에서 계산되는 런타임 값이라
          Tailwind 정적 className으로 표현 불가 — style이 유일한 방법(Shadow 예외와
          같은 성격). */}
      <View
        className="absolute left-0 right-0 rounded-full bg-gray-v2-20"
        style={{top: trackTopOffset, height: TRACK_HEIGHT}}
      />
      <View
        className="absolute left-0 rounded-full bg-brand-40"
        style={{
          top: trackTopOffset,
          height: TRACK_HEIGHT,
          width: `${fillPercent}%`,
        }}
      />
      {ticks.map((tick, index) => {
        const reached = isReached(tick.percent, fillPercent);
        // 마지막 눈금(100%)은 최종 마일스톤 아이콘(_2), 그 외 중간 마일스톤은 _1.
        // 마커/라벨 겹침은 milestone 3개 이상일 때 허용한다(위 MIN_LABEL_GAP_PERCENT
        // 는 라벨에만 적용 — 마커는 항상 전부 렌더). 마커가 행 높이와 같으므로
        // top:0 이면 바로 세로 중앙(=트랙 중앙)에 맞는다.
        const isFinal = index === ticks.length - 1;
        const Icon = isFinal
          ? reached
            ? IcMilestone2On
            : IcMilestone2Off
          : reached
            ? IcMilestone1On
            : IcMilestone1Off;
        return (
          <View
            key={tick.percent}
            className={cn(
              'absolute top-0 rounded-full border-2 border-white items-center justify-center',
              reached ? 'bg-brand-40' : 'bg-gray-v2-20',
            )}
            style={[
              {width: diameter, height: diameter},
              getTickPositionStyle(tick.percent, -radius),
            ]}>
            <Icon width={iconSize} height={iconSize} />
          </View>
        );
      })}
    </View>
  );

  if (size === 'home') {
    return track;
  }

  return (
    <View className="px-[25px] justify-center">
      <View className="flex-row items-baseline">
        <Text className="text-[28px] leading-[38px] font-pretendard-medium text-brand-40">
          {contributionsCount}
        </Text>
        <Text className="text-[18px] leading-[26px] tracking-[-0.36px] font-pretendard-medium text-gray-v2-50">
          {` /${goal} 곳`}
        </Text>
      </View>
      {track}
      <View className="h-[18px]">
        {/* 라벨은 텍스트 폭을 실측하지 않은 근사 중앙정렬(-14px)로 배치한다. */}
        {ticks.map(tick =>
          !tick.showLabel ? null : (
            <Text
              key={tick.percent}
              className="absolute text-[13px] leading-[18px] tracking-[-0.26px] text-gray-v2-50"
              style={getTickPositionStyle(
                tick.percent,
                TICK_LABEL_CENTER_OFFSET,
              )}>
              {tick.label}
            </Text>
          ),
        )}
      </View>
    </View>
  );
};

export default ChallengeProgressBar;
