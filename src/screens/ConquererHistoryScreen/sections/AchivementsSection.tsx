import {useQuery} from '@tanstack/react-query';
import React from 'react';

import useAppComponents from '@/hooks/useAppComponents';

import * as S from './AchivementsSection.style';

export default function AchivementsSection() {
  const {api} = useAppComponents();
  const {data} = useQuery({
    queryKey: ['ConqueredPlacesForNumberOfItems'],
    // listConqueredPlacesPost API는 총 정복한 장소수를 가져오는 API 기도 해서
    // limit을 1로 설정해서 총 정복한 장소수를 가져온다
    queryFn: async () =>
      (await api.listConqueredPlacesPost({limit: 1})).data?.totalNumberOfItems,
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
        <S.Total>{(data ?? 0).toLocaleString()}</S.Total>
        <S.Text> 장소 정복 중</S.Text>
      </S.TextWrapper>
    </S.AchivementsSection>
  );
}
