import {useQuery} from '@tanstack/react-query';
import React from 'react';

import useAppComponents from '@/hooks/useAppComponents';
import {useMe} from '@/atoms/Auth';

import * as S from './ConquererSummarySection.style';

export default function ConquererSummarySection() {
  const {api} = useAppComponents();
  const me = useMe();
  const {data} = useQuery({
    queryKey: ['ConquererActivity'],
    queryFn: async () => (await api.getAccessibilityActivityReportPost()).data,
  });

  return (
    <S.ConquererSummarySection>
      <S.Decotator>
        <S.Title>{`${me.userInfo?.nickname}님\n정복 리포트`}</S.Title>
        <S.DecoImage source={require('@/assets/img/bg_confetti.png')} />
      </S.Decotator>
      <S.Dashboard>
        <S.Item>
          <S.ItemTitle>오늘의 정복</S.ItemTitle>
          <S.ItemValue>{data?.todayConqueredCount}개</S.ItemValue>
        </S.Item>
        <S.Divider />
        <S.Item>
          <S.ItemTitle>이번달 정복</S.ItemTitle>
          <S.ItemValue>
            {data?.thisMonthConqueredCount.toLocaleString()}개
          </S.ItemValue>
        </S.Item>
      </S.Dashboard>
    </S.ConquererSummarySection>
  );
}
