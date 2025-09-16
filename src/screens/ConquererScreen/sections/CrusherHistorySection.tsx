import {useQuery} from '@tanstack/react-query';
import React from 'react';

import RightAngleArrowIcon from '@/assets/icon/ic_angle_bracket_right.svg';
import {color} from '@/constant/color';
import useAppComponents from '@/hooks/useAppComponents';
import useNavigation from '@/navigation/useNavigation';

import * as S from './CrusherHistorySection.style';

export default function CrusherHistorySection() {
  const {api} = useAppComponents();
  const {data} = useQuery({
    queryKey: ['ConqueredPlacesForNumberOfItems'],
    queryFn: async () =>
      (await api.listConqueredPlacesPost({limit: 1})).data?.totalNumberOfItems,
  });
  const navigation = useNavigation();
  const totalNumberOfPlaces = data ?? 0;
  const totalNumberOfUpvote = 0; // TODO: API

  return (
    <S.CrusherHistorySection>
      <S.Title>정복 히스토리</S.Title>
      <S.Divier />
      <S.Link
        elementName="crusher_history_conquered_places_link"
        onPress={() => navigation.navigate('Conquerer/History')}>
        <S.LinkName>
          <S.LinkText>지금까지 내가 정복한 장소</S.LinkText>
        </S.LinkName>
        <S.ClickGuide>
          <S.CountBadge>
            <S.Count>{totalNumberOfPlaces.toLocaleString()}</S.Count>
          </S.CountBadge>
          <RightAngleArrowIcon color={color.gray50} />
        </S.ClickGuide>
      </S.Link>
      <S.Link
        elementName="crusher_history_helpful_link"
        onPress={() => navigation.navigate('Conquerer/Upvote')}>
        <S.LinkName>
          <S.LinkText>도움이 되었어요</S.LinkText>
        </S.LinkName>
        <S.ClickGuide>
          <S.CountBadge>
            <S.Count>{totalNumberOfUpvote}</S.Count>
          </S.CountBadge>
          <RightAngleArrowIcon color={color.gray50} />
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
          <RightAngleArrowIcon color={color.gray50} />
        </S.ClickGuide>
      </S.Link>
    </S.CrusherHistorySection>
  );
}
