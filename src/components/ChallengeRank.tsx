import React from 'react';
import {Text, View} from 'react-native';

import {ChallengeRankDto} from '@/generated-sources/openapi';
import {cn} from '@/utils/cn';

interface PropType {
  value: ChallengeRankDto;
  shouldShowUnderline?: boolean;
  visibleIcon?: boolean;
  /** 호출부별 카드/행 패딩 오버라이드 (예: MyRank 는 카드 자체가 p-[20px] 를 이미 주므로 여기선 0). */
  containerClassName?: string;
}

const ChallengeRank = ({
  value,
  shouldShowUnderline = true,
  visibleIcon = true,
  containerClassName,
}: PropType) => {
  const isTopThree = value.rank < 4;

  return (
    <View
      className={cn(
        'flex-row items-center px-[20px] py-[14px] gap-[16px]',
        containerClassName,
      )}>
      <View className="flex-row items-center min-w-[40px] gap-[4px]">
        <Text
          className={cn(
            'text-[16px]',
            isTopThree
              ? 'font-pretendard-bold text-brand-50'
              : 'font-pretendard-medium text-gray-60',
          )}>
          {`${value.rank}위`}
        </Text>
        {visibleIcon && isTopThree && (
          <Text className="text-[16px] font-pretendard-bold">
            {getMedalEmoji(value.rank)}
          </Text>
        )}
      </View>
      <View className="flex-1">
        {value.companyName && (
          <Text className="text-[11px] font-pretendard-regular text-gray-80">
            {value.companyName}
          </Text>
        )}
        <Text
          numberOfLines={1}
          className="text-[16px] leading-[24px] tracking-[-0.32px] font-pretendard-medium text-black">
          {value.nickname}
        </Text>
      </View>
      <Text
        className={cn(
          'text-[14px] tracking-[-0.07px] font-pretendard-regular',
          isTopThree ? 'text-brand-50' : 'text-gray-v2-50',
        )}>
        {`${value.contributionCount}개 정복`}
      </Text>
      {shouldShowUnderline && (
        <View className="absolute left-[10px] right-[10px] bottom-0 h-px bg-gray-v2-15" />
      )}
    </View>
  );
};

export default ChallengeRank;

function getMedalEmoji(rank: number): string | null {
  switch (rank) {
    case 1:
      return '🥇';
    case 2:
      return '🥈';
    case 3:
      return '🥉';
    default:
      return null;
  }
}
