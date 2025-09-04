import React from 'react';

import * as S from './AchievementsSection.style';

export default function AchievementsSection({
  totalNumberOfPlaces,
}: {
  totalNumberOfPlaces: number;
}) {
  return (
    <S.AchievementsSection>
      <S.Image
        source={require('@/assets/img/img_slope.jpg')}
        resizeMode="cover"
      />
      <S.TextWrapper style={{marginTop: 20}}>
        <S.Text>지금까지</S.Text>
      </S.TextWrapper>
      <S.TextWrapper>
        <S.Text>총 </S.Text>
        <S.Total>{totalNumberOfPlaces.toLocaleString()}</S.Total>
        <S.Text> 장소 정복 중</S.Text>
      </S.TextWrapper>
    </S.AchievementsSection>
  );
}
