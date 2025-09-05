import React from 'react';

import * as S from './ConqueredList.style';

interface Props {
  month: number;
  year: number;
}
export default function ConqueredList({}: Props) {
  return (
    <S.ConqueredList>
      <S.MonthlySummary>
        <S.Text>총 </S.Text>
        <S.MonthTotal>125</S.MonthTotal>
        <S.Text> 장소 정복했어요!</S.Text>
      </S.MonthlySummary>
      <S.PlaceList>
        <S.PlaceRow elementName="conquered_place_item">
          <S.PlaceName>롯데리아 판교점</S.PlaceName>
          <S.PlaceAddress>경기도 성남시 분당구 판교역로 235</S.PlaceAddress>
          <S.ConqueredDate>2021.09.12</S.ConqueredDate>
        </S.PlaceRow>
        <S.PlaceRow elementName="conquered_place_item">
          <S.PlaceName>롯데리아 판교점</S.PlaceName>
          <S.PlaceAddress>경기도 성남시 분당구 판교역로 235</S.PlaceAddress>
          <S.ConqueredDate>2021.09.12</S.ConqueredDate>
        </S.PlaceRow>
        <S.PlaceRow elementName="conquered_place_item">
          <S.PlaceName>롯데리아 판교점</S.PlaceName>
          <S.PlaceAddress>경기도 성남시 분당구 판교역로 235</S.PlaceAddress>
          <S.ConqueredDate>2021.09.12</S.ConqueredDate>
        </S.PlaceRow>
      </S.PlaceList>
    </S.ConqueredList>
  );
}
