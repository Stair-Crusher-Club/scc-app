import React from 'react';
import {Text, View} from 'react-native';

import MarqueeText from '@/components/MarqueeText';
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
      {/* Figma(Frame 584~618): 순위 칸은 전 행 폭 40 고정이고 메달까지 그 안에 들어가
          닉네임 시작 x가 모든 행에서 같다(dx=76 = pl20 + 40 + gap16) — 메달을 별도
          Text로 두면 1~3위만 칸이 넓어져 닉네임이 밀린다. h-26 은 Figma 순위 텍스트
          높이로, 행 높이 54(pt14 + 26 + pb14)를 결정한다. */}
      <View className="w-[40px] h-[26px] justify-center">
        <Text
          numberOfLines={1}
          className={cn(
            // absolute + 명시 폭 46: RN 은 absolute 자식에게도 부모 폭을 max-width 로
            // 물려서, 폭을 안 주면 이모지 advance(글리프 잉크 11pt 보다 넓다) 때문에
            // '1위🥇' 가 '1위…' 로 잘린다. 46 은 최장 케이스('1위🥇' 실측 35.81pt,
            // '10위' 약 29pt)를 담으면서 닉네임 시작(dx 76)과 겹치지 않는 값이다.
            'absolute w-[46px] text-[16px] leading-[26px]',
            isTopThree
              ? 'font-pretendard-bold text-brand-50'
              : 'font-pretendard-medium text-gray-60',
          )}>
          {`${value.rank}위${
            visibleIcon && isTopThree ? getMedalEmoji(value.rank) : ''
          }`}
        </Text>
      </View>
      <View className="flex-1">
        {value.companyName && (
          <Text className="text-[11px] font-pretendard-regular text-gray-80">
            {value.companyName}
          </Text>
        )}
        {/* 닉네임은 최대 32자(scc_user.nickname varchar(32))라 칸을 넘칠 수 있다 —
            말줄임 대신 좌우로 왕복시켜 전체를 읽게 한다. */}
        <MarqueeText className="text-[16px] leading-[24px] tracking-[-0.32px] font-pretendard-medium text-black">
          {value.nickname}
        </MarqueeText>
      </View>
      <Text
        className={cn(
          'text-[14px] leading-[22px] tracking-[-0.07px] font-pretendard-regular',
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

function getMedalEmoji(rank: number): string {
  switch (rank) {
    case 1:
      return '🥇';
    case 2:
      return '🥈';
    case 3:
      return '🥉';
    default:
      return '';
  }
}
