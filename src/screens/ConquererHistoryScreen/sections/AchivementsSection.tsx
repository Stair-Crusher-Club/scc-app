import {useQuery} from '@tanstack/react-query';
import React from 'react';

import useAppComponents from '@/hooks/useAppComponents';

import * as S from './AchivementsSection.style';

export default function AchivementsSection() {
  const {api} = useAppComponents();
  const {data} = useQuery({
    queryKey: ['ConqueredPlaces'],
    queryFn: async () => (await api.listConqueredPlacesPost({})).data,
  });

  return (
    <S.AchivementsSection>
      <S.Image
        source={require('@/assets/img/img_slope.jpg')}
        resizeMode="cover"
      />
      <S.TextWrapper style={{marginTop: 20}}>
        <S.Text>지금까지</S.Text>
      </S.TextWrapper>
      <S.TextWrapper>
        <S.Text>총 </S.Text>
        <S.Total>{(data?.totalNumberOfItems ?? 0).toLocaleString()}</S.Total>
        <S.Text> 장소 정복 중</S.Text>
      </S.TextWrapper>
    </S.AchivementsSection>
  );
}
