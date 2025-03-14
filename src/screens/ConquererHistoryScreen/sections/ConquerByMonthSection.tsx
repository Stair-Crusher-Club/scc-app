import {useQuery} from '@tanstack/react-query';
import dayjs from 'dayjs';
import React from 'react';

import RightAngleArrowIcon from '@/assets/icon/ic_angle_bracket_right.svg';
import {color} from '@/constant/color';
import useAppComponents from '@/hooks/useAppComponents';
import useNavigation from '@/navigation/useNavigation';

import * as ConqueredList from '../../ConquererMonthlyScreen/sections/ConqueredList.style';
import * as S from './ConquerByMonthSection.style';

// 아직 API가 준비되지 않아 월별로 보여줄 수 없다. 아래 컴퓨넌트로 대체한다.
function _ConquerByMonthSection() {
  const navigation = useNavigation();
  return (
    <S.ConquerByMonthSection>
      <S.MonthRow
        onPress={() =>
          navigation.navigate('Conquerer/Monthly', {
            initialYear: 2024,
            initialMonth: 7,
          })
        }>
        <S.Month>2024. 8월</S.Month>
        <S.ClickGuide>
          <S.CountBadge>
            <S.Count>{123}</S.Count>
          </S.CountBadge>
          <RightAngleArrowIcon color={color.gray50} />
        </S.ClickGuide>
      </S.MonthRow>
      <S.MonthRow>
        <S.Month>2024. 7월</S.Month>
        <S.ClickGuide>
          <S.CountBadge>
            <S.Count>{45}</S.Count>
          </S.CountBadge>
          <RightAngleArrowIcon color={color.gray50} />
        </S.ClickGuide>
      </S.MonthRow>
      <S.MonthRow>
        <S.Month>2024. 6월</S.Month>
        <S.ClickGuide>
          <S.CountBadge>
            <S.Count>{6}</S.Count>
          </S.CountBadge>
          <RightAngleArrowIcon color={color.gray50} />
        </S.ClickGuide>
      </S.MonthRow>
    </S.ConquerByMonthSection>
  );
}

export default function ConqueredPlaces() {
  const navigation = useNavigation();
  const {api} = useAppComponents();
  const {data} = useQuery({
    queryKey: ['ConqueredPlaces'],
    queryFn: async () => (await api.listConqueredPlacesPost({})).data,
  });

  const places = data?.items ?? [];

  return (
    <ConqueredList.ConqueredList>
      {places.map(p => (
        <ConqueredList.PlaceRow
          key={p.place.id}
          style={{paddingVertical: 20}}
          onPress={() =>
            navigation.navigate('PlaceDetail', {
              placeInfo: {placeId: p.place.id},
            })
          }>
          <ConqueredList.PlaceName>{p.place.name}</ConqueredList.PlaceName>
          <ConqueredList.PlaceAddress>
            {p.place.address}
          </ConqueredList.PlaceAddress>
          <ConqueredList.ConqueredDate>
            {dayjs(p.accessibilityInfo?.createdAt?.value).format('YYYY.MM.DD')}
          </ConqueredList.ConqueredDate>
        </ConqueredList.PlaceRow>
      ))}
    </ConqueredList.ConqueredList>
  );
}
