import React from 'react';
import {Text, View} from 'react-native';

import {cn} from '@/utils/cn';

import {ListChallengesItemDto} from '@/generated-sources/openapi';

export function MyChallengeBadge() {
  return (
    <Badge className="bg-brand-25" textClassName="text-white">
      나의 챌린지
    </Badge>
  );
}

export function ChallengeStatusBadge({
  status,
}: {
  status: ListChallengesItemDto['status'];
}) {
  switch (status) {
    case 'InProgress':
      return (
        <Badge className="bg-[#E5F1FF]" textClassName="text-brand-30">
          진행 중
        </Badge>
      );
    case 'Upcoming':
      return (
        <Badge className="bg-success-10" textClassName="text-success-30">
          오픈 예정
        </Badge>
      );
    case 'Closed':
      return (
        <Badge className="bg-gray-v2-20" textClassName="text-gray-v2-60">
          종료된 챌린지
        </Badge>
      );
    default:
      return status satisfies never;
  }
}

function Badge({
  className,
  textClassName,
  children,
}: {
  className: string;
  textClassName: string;
  children: string;
}) {
  return (
    <View className={cn('px-[6px] py-[4px] rounded-[4px]', className)}>
      <Text
        className={cn(
          'text-[12px] leading-[16px] tracking-[-0.24px] font-pretendard-medium',
          textClassName,
        )}>
        {children}
      </Text>
    </View>
  );
}
