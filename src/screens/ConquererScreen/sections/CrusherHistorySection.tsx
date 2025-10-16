import {useQueries} from '@tanstack/react-query';
import React from 'react';

import ChevronRightIcon from '@/assets/icon/ic_chevron_right.svg';
import {color} from '@/constant/color';
import useAppComponents from '@/hooks/useAppComponents';
import useNavigation from '@/navigation/useNavigation';

import * as S from './CrusherHistorySection.style';

export default function CrusherHistorySection() {
  const {api} = useAppComponents();
  const [totalConqueredPlaces, totalUpvotedPlaces] = useQueries({
    queries: [
      {
        queryKey: ['ConqueredPlacesForNumberOfItems'],
        queryFn: async () =>
          (await api.listConqueredPlacesPost({limit: 1})).data
            ?.totalNumberOfItems,
      },
      {
        queryKey: ['UpvotedForNumberOfItems'],
        queryFn: async () =>
          (await api.listUpvotedPlacesPost({limit: 1})).data
            ?.totalNumberOfUpvotes,
      },
    ],
  }).map(r => r.data);

  const totalNumberOfPlaces = totalConqueredPlaces ?? 0;
  const totalNumberOfUpvote = totalUpvotedPlaces ?? 0;

  const navigation = useNavigation();

  return (
    <S.CrusherHistorySection>
      <S.Title>정복 히스토리</S.Title>
      <S.Divier />
      <S.Link
        elementName="crusher_history_conquered_places_link"
        onPress={() => navigation.navigate('Conquerer/History')}>
        <S.LinkName>
          <S.LinkText>내가 정복한 장소</S.LinkText>
        </S.LinkName>
        <S.ClickGuide>
          <S.CountBadge>
            <S.Count>{totalNumberOfPlaces.toLocaleString()}</S.Count>
          </S.CountBadge>
          <ChevronRightIcon width={20} height={20} color={color.gray30} />
        </S.ClickGuide>
      </S.Link>
      <S.Link
        elementName="crusher_history_helpful_link"
        onPress={() => navigation.navigate('Conquerer/Upvote')}>
        <S.LinkName>
          <S.LinkText>도움이 돼요</S.LinkText>
        </S.LinkName>
        <S.ClickGuide>
          <S.CountBadge>
            <S.Count>{totalNumberOfUpvote.toLocaleString()}</S.Count>
          </S.CountBadge>
          <ChevronRightIcon width={20} height={20} color={color.gray30} />
        </S.ClickGuide>
      </S.Link>
      <S.Link elementName="crusher_history_views_link">
        <S.LinkName>
          <S.WIPText>내 정복 장소 조회수</S.WIPText>
          <S.WIPBadge>
            <S.WIP>준비중</S.WIP>
          </S.WIPBadge>
        </S.LinkName>
        <S.ClickGuide>
          <ChevronRightIcon width={20} height={20} color={color.gray30} />
        </S.ClickGuide>
      </S.Link>
    </S.CrusherHistorySection>
  );
}
