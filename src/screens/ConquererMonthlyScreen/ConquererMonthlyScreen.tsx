import dayjs from 'dayjs';
import objectSupport from 'dayjs/plugin/objectSupport';
import React, {useState} from 'react';

import CloseIcon from '@/assets/icon/close.svg';
import LeftArrowIcon from '@/assets/icon/ic_angle_bracket_left.svg';
import RightArrowIcon from '@/assets/icon/ic_angle_bracket_right.svg';
import {color} from '@/constant/color';
import {ScreenProps} from '@/navigation/Navigation.screens';

import * as S from './ConquererMonthlyScreen.style';
import ConqueredList from './sections/ConqueredList';

dayjs.extend(objectSupport);

export interface ConquererMonthlyScreenParams {
  initialYear: number;
  initialMonth: number;
}

export default function ConquererMonthlyScreen({
  route,
  navigation,
}: ScreenProps<'Conquerer/Monthly'>) {
  const [month, setMonth] = useState<number>(route.params.initialMonth);
  const [year, setYear] = useState<number>(route.params.initialYear);

  function prevMonth() {
    if (month === 1) {
      setYear(year - 1);
      setMonth(12);
    } else {
      setMonth(month - 1);
    }
  }

  function nextMonth() {
    if (month === 12) {
      setYear(year + 1);
      setMonth(1);
    } else {
      setMonth(month + 1);
    }
  }

  const canGoBack = dayjs({year, month}).isAfter(dayjs({year: 2023, month: 5}));
  const canGoNext = dayjs({year, month}).isBefore(dayjs());

  return (
    <S.ConquererMonthlyScreen>
      <S.Header>
        <S.CloseButton
          elementName="conquerer_monthly_close_button"
          onPress={navigation.goBack}>
          <CloseIcon width={20} height={20} color={color.gray90} />
        </S.CloseButton>
      </S.Header>
      <S.MonthSelector>
        <S.MoveMonthButton
          elementName="conquerer_monthly_prev_month"
          onPress={prevMonth}
          disabled={!canGoBack}>
          <LeftArrowIcon
            width={24}
            height={24}
            color={canGoBack ? color.brandColor : color.gray70}
          />
        </S.MoveMonthButton>
        <S.CurrentMonth>
          {year}. {month.toString().padStart(2, '0')}
        </S.CurrentMonth>
        <S.MoveMonthButton
          elementName="conquerer_monthly_next_month"
          onPress={nextMonth}
          disabled={!canGoNext}>
          <RightArrowIcon
            width={24}
            height={24}
            color={canGoNext ? color.brandColor : color.gray70}
          />
        </S.MoveMonthButton>
      </S.MonthSelector>
      <ConqueredList year={year} month={month} />
    </S.ConquererMonthlyScreen>
  );
}
