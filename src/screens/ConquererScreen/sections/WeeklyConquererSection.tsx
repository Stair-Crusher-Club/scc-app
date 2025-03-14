import {useQuery} from '@tanstack/react-query';
import dayjs, {Dayjs} from 'dayjs';
import ko from 'dayjs/locale/ko';
import React from 'react';

import RightAngleArrowIcon from '@/assets/icon/ic_angle_bracket_right.svg';
import {color} from '@/constant/color';
import {DayOfWeek} from '@/generated-sources/openapi';
import useAppComponents from '@/hooks/useAppComponents';
import useNavigation from '@/navigation/useNavigation';

import * as S from './WeeklyConquererSection.style';

dayjs.locale(ko);

export default function WeeklyConquererSection() {
  const navigation = useNavigation();
  const today = dayjs();

  const {api} = useAppComponents();
  const {data} = useQuery({
    queryKey: ['ConquererActivity'],
    queryFn: async () => (await api.getAccessibilityActivityReportPost()).data,
  });

  // 오늘이 일요일이면 6일 전 월요일
  // 오늘이 일요일이 아니면 이번주 월요일
  const startMonday =
    today.day() === 0
      ? today.subtract(6, 'day')
      : today.startOf('week').add(1, 'day');

  console.log(data?.thisWeekConqueredWeekdays);

  return (
    <S.WeeklyConquererSection>
      <S.ThisWeekStatus>
        {data?.thisWeekConqueredWeekdays.length === 0 && (
          <S.Tooltip
            source={require('@/assets/img/conquer_today_tooltip.png')}
          />
        )}
        <S.TitleArea>
          <S.Title>하루 한 칸</S.Title>
          <S.MoreButton
            onPress={() => navigation.navigate('Search', {initKeyword: ''})}>
            <S.More>정복하러 가기</S.More>
            <RightAngleArrowIcon color={color.brandColor} width={20} />
          </S.MoreButton>
        </S.TitleArea>
        <S.Stamps>
          {Array.from({length: 7}).map((_, i) => (
            <S.Stamp key={i}>
              <DailyStamp key={i} day={startMonday.add(i, 'day')} />
            </S.Stamp>
          ))}
        </S.Stamps>
      </S.ThisWeekStatus>
    </S.WeeklyConquererSection>
  );
}

function DailyStamp({day}: {day: Dayjs}) {
  const {api} = useAppComponents();
  const {data} = useQuery({
    queryKey: ['ConquererActivity'],
    queryFn: async () => (await api.getAccessibilityActivityReportPost()).data,
  });

  const days = data?.thisWeekConqueredWeekdays ?? [];
  const success = days.includes(
    day.locale('en').format('dddd').toUpperCase() as DayOfWeek,
  );

  if (!success) {
    return <S.Empty>{day.format('ddd')}</S.Empty>;
  }

  // 매주 스탬프 위치가 바뀌게 / 하지만 한 주 동안은 고정적으로 찍히도록
  const stamps = [
    require('@/assets/img/stamp_wheely.png'),
    require('@/assets/img/stamp_flag.png'),
    require('@/assets/img/stamp_star.png'),
    require('@/assets/img/stamp_buggy.png'),
  ];

  const stampIndex = day.diff(dayjs('2020-01-01'), 'day') % stamps.length;
  return <S.StampImage source={stamps[stampIndex]} />;
}
