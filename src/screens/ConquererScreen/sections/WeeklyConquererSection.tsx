import {useQuery} from '@tanstack/react-query';
import dayjs, {Dayjs} from 'dayjs';
import ko from 'dayjs/locale/ko';
import React from 'react';

import RightAngleArrowIcon from '@/assets/icon/ic_angle_bracket_right.svg';
import {color} from '@/constant/color';
import {DayOfWeek} from '@/generated-sources/openapi';
import useAppComponents from '@/hooks/useAppComponents';
import useNavigation from '@/navigation/useNavigation';

import {SccPressable} from '@/components/SccPressable';
import {SortOption} from '@/screens/SearchScreen/atoms';
import {Image, Text, View} from 'react-native';

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

  return (
    <View className="py-8 px-5 gap-6 bg-white">
      <View>
        {data?.thisWeekConqueredWeekdays.length === 0 && (
          <Image
            className="w-[170px] h-[30px] mb-1"
            resizeMode="contain"
            source={require('@/assets/img/conquer_today_tooltip.png')}
          />
        )}
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-black text-[18px] leading-[29px] font-pretendard-bold">하루 한 칸</Text>
          <SccPressable
            className="flex-row items-center h-6"
            elementName="weekly_conquerer_more_button"
            onPress={() =>
              navigation.navigate('Search', {
                initKeyword: '',
                initSortOption: SortOption.ACCURACY,
              })
            }>
            <Text className="text-[14px] leading-[22px] text-brand-color font-pretendard-medium">정복하러 가기</Text>
            <RightAngleArrowIcon color={color.brandColor} width={20} />
          </SccPressable>
        </View>
        <View className="flex-row justify-between gap-1">
          {Array.from({length: 7}).map((_, i) => (
            <View key={i} className="flex-1 aspect-square justify-center items-center rounded-[16px] bg-gray-10">
              <DailyStamp key={i} day={startMonday.add(i, 'day')} />
            </View>
          ))}
        </View>
      </View>
    </View>
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
    return <Text className="text-[16px] leading-[18px] text-gray-70 text-center">{day.format('ddd')}</Text>;
  }

  // 매주 스탬프 위치가 바뀌게 / 하지만 한 주 동안은 고정적으로 찍히도록
  const stamps = [
    require('@/assets/img/stamp_wheely.png'),
    require('@/assets/img/stamp_flag.png'),
    require('@/assets/img/stamp_star.png'),
    require('@/assets/img/stamp_buggy.png'),
  ];

  const stampIndex = day.diff(dayjs('2020-01-01'), 'day') % stamps.length;
  return <Image className="w-10 h-10" source={stamps[stampIndex]} />;
}
