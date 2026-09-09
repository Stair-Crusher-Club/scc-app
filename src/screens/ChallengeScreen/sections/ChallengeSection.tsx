import React, {useCallback, useState} from 'react';
import {ScrollView, Text, View} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';

import ChallengeStatusBadges from '@/components/ChallengeStatusBadges';
import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';
import {cn} from '@/utils/cn';

import RightArrowIcon from '@/assets/icon/ic_angle_bracket_right.svg';
import {
  ChallengeStatusDto,
  ListChallengesItemDto,
} from '@/generated-sources/openapi';
import useAppComponents from '@/hooks/useAppComponents';
import useNavigation from '@/navigation/useNavigation';
import {useCheckAuth} from '@/utils/checkAuth';

interface PropsType {
  onPressUpcomingChallenge: (challenge: ListChallengesItemDto) => void;
}

export default function ChallengeSection({
  onPressUpcomingChallenge,
}: PropsType) {
  const navigation = useNavigation();
  const {api} = useAppComponents();
  const checkAuth = useCheckAuth();
  const [activeFilter, setActiveFilter] = useState<'all' | ChallengeStatusDto>(
    'all',
  );
  const [challenges, setChallenges] = useState<ListChallengesItemDto[]>([]);

  const fetchChallenges = useCallback(() => {
    api
      .listChallengesPost({
        statuses: activeFilter === 'all' ? undefined : [activeFilter],
      })
      .then(res => {
        setChallenges(res.data.items);
      });
  }, [api, activeFilter]);

  useFocusEffect(
    useCallback(() => {
      fetchChallenges();
    }, [fetchChallenges]),
  );

  const handleChallengePress = (challenge: ListChallengesItemDto) => {
    if (challenge.status === 'Upcoming') {
      onPressUpcomingChallenge(challenge);
    }
    if (challenge.status === 'InProgress' || challenge.status === 'Closed') {
      navigation.navigate('ChallengeDetail', {challengeId: challenge.id});
    }
  };

  return (
    <View className="bg-white">
      <View className="px-[20px] pt-[24px] pb-[8px] gap-[8px]">
        <Text className="text-[24px] leading-[32px] font-pretendard-bold text-black">
          계단 챌린지
        </Text>
        <Text className="text-[14px] leading-[20px] tracking-[-0.28px] font-pretendard-regular text-gray-v2-60">
          진행 중인 챌린지에 참여해 보세요!
        </Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row items-center px-[20px] py-[8px] gap-[6px]">
          <FilterChip
            elementName="challenge_filter_all"
            label="전체보기"
            active={activeFilter === 'all'}
            onPress={() => setActiveFilter('all')}
          />
          <FilterChip
            elementName="challenge_filter_in_progress"
            label="진행 중"
            active={activeFilter === 'InProgress'}
            onPress={() => setActiveFilter('InProgress')}
          />
          <FilterChip
            elementName="challenge_filter_upcoming"
            label="오픈 예정"
            active={activeFilter === 'Upcoming'}
            onPress={() => setActiveFilter('Upcoming')}
          />
          <FilterChip
            elementName="challenge_filter_closed"
            label="종료된 챌린지"
            active={activeFilter === 'Closed'}
            onPress={() => setActiveFilter('Closed')}
          />
        </View>
      </ScrollView>
      {/* pb-[80px]: 시안 프레임 밖 영역 — 탭바에 마지막 카드가 가리지 않도록 하는 기존 여백 유지 */}
      <View className="px-[20px] pt-[4px] pb-[80px] gap-[12px]">
        {challenges.map(challenge => (
          <ChallengeCard
            key={challenge.id}
            challenge={challenge}
            onPress={() => checkAuth(() => handleChallengePress(challenge))}
          />
        ))}
      </View>
    </View>
  );
}

const filterChipVariantClassName = {
  active: 'bg-brand-5 border-brand-50',
  inactive: 'bg-white border-gray-v2-20',
};

const filterChipTextVariantClassName = {
  active: 'font-pretendard-medium text-brand-50',
  inactive: 'font-pretendard-regular text-gray-v2-90',
};

function FilterChip({
  elementName,
  label,
  active,
  onPress,
}: {
  elementName: string;
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <SccPressable
      elementName={elementName}
      onPress={onPress}
      className={cn(
        'px-[12px] py-[6px] rounded-full border',
        active
          ? filterChipVariantClassName.active
          : filterChipVariantClassName.inactive,
      )}>
      <Text
        className={cn(
          'text-[14px] leading-[20px] tracking-[-0.28px]',
          active
            ? filterChipTextVariantClassName.active
            : filterChipTextVariantClassName.inactive,
        )}>
        {label}
      </Text>
    </SccPressable>
  );
}

function ChallengeCard({
  challenge,
  onPress,
}: {
  challenge: ListChallengesItemDto;
  onPress: (challenge: ListChallengesItemDto) => void;
}) {
  const date = stringifyChallengeDate(challenge);

  return (
    <SccPressable
      elementName="challenge_card"
      logParams={{challenge_id: challenge.id}}
      onPress={() => {
        onPress(challenge);
      }}
      className="flex-row items-center gap-[12px] pl-[20px] pr-[16px] py-[16px] rounded-[8px] border border-gray-v2-20 bg-white">
      <View className="flex-1 gap-[8px]">
        <ChallengeStatusBadges
          status={[challenge.status]}
          isMyChallenge={challenge.hasJoined}
        />
        <View className="gap-[2px]">
          <Text className="text-[20px] leading-[28px] tracking-[-0.4px] font-pretendard-semibold text-black">
            {challenge.name}
          </Text>
          {date && (
            <Text className="text-[14px] leading-[20px] tracking-[-0.28px] font-pretendard-regular text-gray-v2-50">
              {date}
            </Text>
          )}
        </View>
      </View>
      <RightArrowIcon color={color.black} width={24} height={24} />
    </SccPressable>
  );
}

function stringifyChallengeDate(challenge: ListChallengesItemDto) {
  if (challenge.startsAt.value > Date.now()) {
    const d = new Date(challenge.startsAt.value);
    return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}부터`;
  }

  if (!challenge.endsAt) {
    return null;
  }
  const d = new Date(challenge.endsAt.value);
  return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}까지`;
}
