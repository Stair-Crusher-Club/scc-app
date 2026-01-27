import React, { useMemo } from 'react';
import { View, ScrollView, Linking } from 'react-native';
import styled from 'styled-components/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { WebStackParamList } from '../../navigation/WebNavigation';
import { LogParamsProvider } from '@/logging/LogParamsProvider';
import {
  ResponsiveProvider,
  useResponsive,
} from '../BbucleRoadScreen/context/ResponsiveContext';
import { getAllBbucleRoadList } from '../BbucleRoadScreen/config/bbucleRoadData';

import ListHeader from './components/ListHeader';
import BbucleRoadCard, {
  type UpcomingCardData,
} from './components/BbucleRoadCard';

const CONTENTS_ALARM_FORM_URL = 'https://forms.staircrusher.club/contents-alarm';

// 공개 예정 카드 데이터
const UPCOMING_CARDS: UpcomingCardData[] = [
  {
    id: 'upcoming-1',
    title: '새로운 공연장 정보가 곧 공개됩니다',
    subtitle: '알림 신청하고 먼저 소식 받아보세요',
  },
];

type BbucleRoadListScreenRouteProp = RouteProp<
  WebStackParamList,
  'BbucleRoadList'
>;
type BbucleRoadListScreenNavigationProp = NativeStackNavigationProp<
  WebStackParamList,
  'BbucleRoadList'
>;

interface Props {
  route: BbucleRoadListScreenRouteProp;
  navigation: BbucleRoadListScreenNavigationProp;
}

function BbucleRoadListContent({
  navigation,
}: {
  navigation: BbucleRoadListScreenNavigationProp;
}) {
  const { isDesktop } = useResponsive();

  // createdAt descending 정렬
  const sortedBbucleRoadList = useMemo(() => {
    return getAllBbucleRoadList().sort((a, b) => {
      const dateA = a.createdAt || '1970-01-01';
      const dateB = b.createdAt || '1970-01-01';
      return dateB.localeCompare(dateA);
    });
  }, []);

  const handleCardPress = (bbucleRoadId: string) => {
    navigation.navigate('BbucleRoad', { bbucleRoadId });
  };

  const handleUpcomingCardPress = () => {
    Linking.openURL(CONTENTS_ALARM_FORM_URL);
  };

  return (
    <LogParamsProvider
      params={{ displayScreenName: 'BbucleRoadList', isDesktop }}>
      <ScrollView style={{ flex: 1 }}>
        <ListHeader />

        <CardListContainer isDesktop={isDesktop}>
          {/* 공개 예정 카드 */}
          {UPCOMING_CARDS.map(upcomingItem => (
            <BbucleRoadCard
              key={upcomingItem.id}
              upcomingData={upcomingItem}
              onPress={handleUpcomingCardPress}
              isDesktop={isDesktop}
            />
          ))}

          {/* 실제 뿌클로드 목록 (최신순) */}
          {sortedBbucleRoadList.map(item => (
            <BbucleRoadCard
              key={item.id}
              data={item}
              onPress={() => handleCardPress(item.id)}
              isDesktop={isDesktop}
            />
          ))}
        </CardListContainer>

        <FooterSpacer />
      </ScrollView>
    </LogParamsProvider>
  );
}

export default function BbucleRoadListScreen({ navigation }: Props) {
  return (
    <Container data-testid="bbucle-road-list">
      <ResponsiveProvider>
        <BbucleRoadListContent navigation={navigation} />
      </ResponsiveProvider>
    </Container>
  );
}

const Container = styled(View)`
  flex: 1;
  background-color: #ffffff;
  overflow: hidden;
`;

const CardListContainer = styled(View)<{ isDesktop: boolean }>`
  width: 100%;
  max-width: ${({ isDesktop }) => (isDesktop ? '800px' : '100%')};
  align-self: center;
  padding: ${({ isDesktop }) => (isDesktop ? '32px 0' : '24px 16px')};
  gap: ${({ isDesktop }) => (isDesktop ? '24px' : '16px')};
  box-sizing: border-box;
`;

const FooterSpacer = styled(View)`
  height: 60px;
`;
