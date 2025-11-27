import React, {useCallback, useState} from 'react';
import {ScrollView, Text, View} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';

import {SccPressable} from '@/components/SccPressable';

import RightArrowIcon from '@/assets/icon/ic_angle_bracket_right.svg';
import ChallengeStatusBadges from '@/components/ChallengeStatusBadges';
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
      <View className="pt-10 px-[25px]">
        <Text className="font-pretendard-bold text-[28px] text-black">
          계단뿌셔 챌린지
        </Text>
        <Text className="text-gray-80 font-pretendard-regular text-base">
          진행 중인 챌린지에 참여해 보세요!
        </Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row items-center my-[21px] gap-[6px] px-[25px]">
          <SccPressable
            elementName="challenge_filter_all"
            onPress={() => setActiveFilter('all')}
            className={`py-[9px] px-[18px] border rounded-[56px] ${
              activeFilter === 'all'
                ? 'border-brand-20 bg-brand-10'
                : 'border-gray-20 bg-white'
            }`}>
            <Text
              className={`font-pretendard-regular text-sm ${
                activeFilter === 'all' ? 'text-brand' : 'text-gray-90'
              }`}
              style={{letterSpacing: -0.005}}>
              전체보기
            </Text>
          </SccPressable>
          <SccPressable
            elementName="challenge_filter_in_progress"
            onPress={() => setActiveFilter('InProgress')}
            className={`py-[9px] px-[18px] border rounded-[56px] ${
              activeFilter === 'InProgress'
                ? 'border-brand-20 bg-brand-10'
                : 'border-gray-20 bg-white'
            }`}>
            <Text
              className={`font-pretendard-regular text-sm ${
                activeFilter === 'InProgress' ? 'text-brand' : 'text-gray-90'
              }`}
              style={{letterSpacing: -0.005}}>
              진행 중
            </Text>
          </SccPressable>
          <SccPressable
            elementName="challenge_filter_upcoming"
            onPress={() => setActiveFilter('Upcoming')}
            className={`py-[9px] px-[18px] border rounded-[56px] ${
              activeFilter === 'Upcoming'
                ? 'border-brand-20 bg-brand-10'
                : 'border-gray-20 bg-white'
            }`}>
            <Text
              className={`font-pretendard-regular text-sm ${
                activeFilter === 'Upcoming' ? 'text-brand' : 'text-gray-90'
              }`}
              style={{letterSpacing: -0.005}}>
              오픈 예정
            </Text>
          </SccPressable>
          <SccPressable
            elementName="challenge_filter_closed"
            onPress={() => setActiveFilter('Closed')}
            className={`py-[9px] px-[18px] border rounded-[56px] ${
              activeFilter === 'Closed'
                ? 'border-brand-20 bg-brand-10'
                : 'border-gray-20 bg-white'
            }`}>
            <Text
              className={`font-pretendard-regular text-sm ${
                activeFilter === 'Closed' ? 'text-brand' : 'text-gray-90'
              }`}
              style={{letterSpacing: -0.005}}>
              종료된 챌린지
            </Text>
          </SccPressable>
        </View>
      </ScrollView>
      <View className="px-[25px] mb-20 gap-[15px]">
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

function ChallengeCard({
  challenge,
  onPress,
}: {
  challenge: ListChallengesItemDto;
  onPress: (challenge: ListChallengesItemDto) => void;
}) {
  return (
    <SccPressable
      elementName="challenge_card"
      logParams={{challenge_id: challenge.id}}
      onPress={() => {
        onPress(challenge);
      }}
      key={challenge.id}>
      <View className="border-2 border-gray-20 rounded-[20px] pt-5 pl-5 pr-12 pb-4">
        <ChallengeStatusBadges
          status={[challenge.status]}
          isMyChallenge={challenge.hasJoined}
        />
        <Text className="font-pretendard-bold text-xl text-black mt-3">
          {challenge.name}
        </Text>
        <Text className="font-pretendard-regular text-sm text-gray-90 mt-0.5">
          {stringifyChallengeDate(challenge)}
        </Text>
        <View className="absolute top-14 right-4">
          <RightArrowIcon color="black" />
        </View>
      </View>
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
