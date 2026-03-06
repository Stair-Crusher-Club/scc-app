import React, {useCallback, useState} from 'react';
import {ScrollView} from 'react-native';
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

import * as S from './ChallengeSection.style';

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
    <S.ChallengeSection>
      <S.TitleArea>
        <S.Title>계단뿌셔 챌린지</S.Title>
        <S.Subtitle>진행 중인 챌린지에 참여해 보세요!</S.Subtitle>
      </S.TitleArea>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <S.Filters>
          <S.FilterButton
            elementName="challenge_filter_all"
            active={activeFilter === 'all'}
            onPress={() => setActiveFilter('all')}>
            <S.FilterButtonText active={activeFilter === 'all'}>
              전체보기
            </S.FilterButtonText>
          </S.FilterButton>
          <S.FilterButton
            elementName="challenge_filter_in_progress"
            active={activeFilter === 'InProgress'}
            onPress={() => setActiveFilter('InProgress')}>
            <S.FilterButtonText active={activeFilter === 'InProgress'}>
              진행 중
            </S.FilterButtonText>
          </S.FilterButton>
          <S.FilterButton
            elementName="challenge_filter_upcoming"
            active={activeFilter === 'Upcoming'}
            onPress={() => setActiveFilter('Upcoming')}>
            <S.FilterButtonText active={activeFilter === 'Upcoming'}>
              오픈 예정
            </S.FilterButtonText>
          </S.FilterButton>
          <S.FilterButton
            elementName="challenge_filter_closed"
            active={activeFilter === 'Closed'}
            onPress={() => setActiveFilter('Closed')}>
            <S.FilterButtonText active={activeFilter === 'Closed'}>
              종료된 챌린지
            </S.FilterButtonText>
          </S.FilterButton>
        </S.Filters>
      </ScrollView>
      <S.ChallengeList>
        {challenges.map(challenge => (
          <ChallengeCard
            key={challenge.id}
            challenge={challenge}
            onPress={() => checkAuth(() => handleChallengePress(challenge))}
          />
        ))}
      </S.ChallengeList>
    </S.ChallengeSection>
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
      <S.ChallengeCard>
        <ChallengeStatusBadges
          status={[challenge.status]}
          isMyChallenge={challenge.hasJoined}
        />
        <S.ChallengeName>{challenge.name}</S.ChallengeName>
        <S.ChallengeDate>{stringifyChallengeDate(challenge)}</S.ChallengeDate>
        <S.ArrowWrapper>
          <RightArrowIcon color="black" />
        </S.ArrowWrapper>
      </S.ChallengeCard>
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
