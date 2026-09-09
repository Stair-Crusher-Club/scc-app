import React from 'react';
import {Text, View} from 'react-native';

interface ChallengeProgressBarProps {
  contributionsCount: number;
  goal: number;
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

const ChallengeProgressBar = ({
  contributionsCount,
  goal,
}: ChallengeProgressBarProps) => {
  const fillPercent = getChallengeProgressFillPercent(contributionsCount, goal);

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
        {/* ponytail: fill 폭은 props로 계산되는 런타임 값이라 Tailwind 정적 className으로
            표현 불가 — style 이 유일한 방법(Shadow 예외와 같은 성격). 눈금 dot 4개는 고정
            위치라 전부 className(left-1/4 등)으로 처리. */}
        <View
          className="h-[10px] rounded-full bg-brand-40"
          style={{width: `${fillPercent}%`}}
        />
        <View className="absolute top-1/2 -mt-[2px] left-1/4 -ml-[2px] w-[4px] h-[4px] rounded-full bg-[#D8D8DF]" />
        <View className="absolute top-1/2 -mt-[2px] left-1/2 -ml-[2px] w-[4px] h-[4px] rounded-full bg-[#D8D8DF]" />
        <View className="absolute top-1/2 -mt-[2px] left-3/4 -ml-[2px] w-[4px] h-[4px] rounded-full bg-[#D8D8DF]" />
        <View className="absolute top-1/2 -mt-[2px] right-0 w-[4px] h-[4px] rounded-full bg-[#D8D8DF]" />
      </View>
      <View className="flex-row justify-between">
        <Text className="text-[13px] leading-[18px] tracking-[-0.26px] text-gray-v2-50">
          0
        </Text>
        <Text className="text-[13px] leading-[18px] tracking-[-0.26px] text-gray-v2-50">
          25%
        </Text>
        <Text className="text-[13px] leading-[18px] tracking-[-0.26px] text-gray-v2-50">
          50%
        </Text>
        <Text className="text-[13px] leading-[18px] tracking-[-0.26px] text-gray-v2-50">
          75%
        </Text>
        <Text className="text-[13px] leading-[18px] tracking-[-0.26px] text-gray-v2-50">
          100%
        </Text>
      </View>
    </View>
  );
};

export default ChallengeProgressBar;
