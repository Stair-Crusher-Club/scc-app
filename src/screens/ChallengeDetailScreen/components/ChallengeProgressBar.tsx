import React from 'react';
import {Text, View} from 'react-native';

interface ChallengeProgressBarProps {
  contributionsCount: number;
  goal: number;
  /** 중간목표. 비어있으면(또는 goal<=0) 25/50/75% 고정 눈금으로 폴백한다. */
  milestones?: number[] | null;
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
  /** 정확한 위치(소수 가능) — dot 배치에 사용 */
  percent: number;
  /** 반올림 표시값 ('0' 또는 'N%') */
  label: string;
  showLabel: boolean;
}

// Figma 원본(Frame648) 실측: 트랙 높이 10px, 점 지름 8px(r=4) — 트랙의 80%.
export const TICK_DOT_DIAMETER = 8;
const TICK_DOT_RADIUS = TICK_DOT_DIAMETER / 2;
// 라벨(짧은 %텍스트)의 근사 중앙정렬 오프셋 — 텍스트 폭 실측 대신 근사치(아래 참고).
const TICK_LABEL_CENTER_OFFSET = -14;

export interface TickPositionStyle {
  left?: number | `${number}%`;
  right?: number;
  marginLeft?: number;
}

/**
 * 0%/100% 눈금은 중앙(percent 그대로)에 놓으면 트랙 밖으로 절반이 삐져나온다
 * (Figma 원본도 x=1/x=331로 안쪽에 여유를 뒀다) — 양 끝은 트랙 안쪽에 딱 붙이고,
 * 중간 눈금만 `middleOffset`(보통 -지름/2 또는 라벨 폭 근사치)만큼 중앙정렬한다.
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

const FALLBACK_MIDDLE_PERCENTS = [25, 50, 75];
// ponytail: 텍스트 폭을 실측하지 않은 근사 임계값 — 이 간격보다 가까운 두 라벨은
// 겹칠 수 있다고 보고 뒤쪽 라벨을 생략한다(dot은 항상 그린다). 실제로 겹치는
// 신고가 오면 onLayout 측정으로 승격.
const MIN_LABEL_GAP_PERCENT = 6;

/**
 * 마일스톤 위치를 %로 환산해 진행바 눈금을 만든다. milestones가 비어있거나
 * goal<=0이면(0 나눗셈 방지) 기존 25/50/75% 고정 눈금으로 폴백한다.
 * 0%/100%는 항상 양 끝에 포함된다.
 */
export function getChallengeProgressTicks(
  milestones: number[] | undefined | null,
  goal: number,
): ChallengeProgressTick[] {
  const middlePercents = (() => {
    if (goal <= 0 || !milestones || milestones.length === 0) {
      return FALLBACK_MIDDLE_PERCENTS;
    }
    const percents = milestones
      // 데이터 오류 방어: 음수/goal 초과 마일스톤은 0~goal로 클램프
      .map(m => (Math.max(0, Math.min(m, goal)) / goal) * 100)
      // 0%/100%는 경계 눈금이 이미 담당 — 중복 방지를 위해 중간 구간만 남긴다
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

  const allPercents = [0, ...middlePercents, 100];

  let lastShownPercent = -Infinity;
  return allPercents.map((percent, index) => {
    const isEdge = index === 0 || index === allPercents.length - 1;
    const showLabel =
      isEdge || percent - lastShownPercent >= MIN_LABEL_GAP_PERCENT;
    if (showLabel) {
      lastShownPercent = percent;
    }
    return {
      percent,
      label: percent === 0 ? '0' : `${Math.round(percent)}%`,
      showLabel,
    };
  });
}

const ChallengeProgressBar = ({
  contributionsCount,
  goal,
  milestones,
}: ChallengeProgressBarProps) => {
  const fillPercent = getChallengeProgressFillPercent(contributionsCount, goal);
  const ticks = getChallengeProgressTicks(milestones, goal);

  return (
    <View className="px-[25px] h-[88px] justify-center gap-[10px]">
      <View className="flex-row items-baseline">
        <Text className="text-[28px] leading-[38px] font-pretendard-medium text-brand-40">
          {contributionsCount}
        </Text>
        <Text className="text-[18px] leading-[26px] tracking-[-0.36px] font-pretendard-medium text-gray-v2-50">
          {` /${goal} 곳`}
        </Text>
      </View>
      <View className="h-[10px] rounded-full bg-gray-v2-15">
        {/* ponytail: fill 폭 · 눈금 위치 전부 props/마일스톤에서 계산되는 런타임 값이라
            Tailwind 정적 className으로 표현 불가 — style이 유일한 방법(Shadow 예외와
            같은 성격). fill이 먼저, 점(dot)이 나중에 렌더돼 겹칠 때 점이 위에 보인다
            (RN은 나중에 그려진 형제가 위에 쌓인다 — zIndex 불필요). */}
        <View
          className="h-[10px] rounded-full bg-brand-40"
          style={{width: `${fillPercent}%`}}
        />
        {ticks.map(tick => (
          <View
            key={tick.percent}
            className="absolute top-1/2 -mt-[4px] w-[8px] h-[8px] rounded-full bg-[#D8D8DF]"
            style={getTickPositionStyle(tick.percent, -TICK_DOT_RADIUS)}
          />
        ))}
      </View>
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
