import React from 'react';

import * as S from './AchievementsSection.style';

type AchievementType = 'conquer' | 'review';

export default function AchievementsSection({
  totalNumberOfPlaces,
  type = 'conquer',
}: {
  totalNumberOfPlaces: number;
  type?: AchievementType;
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
        <S.Text>
          개 {type === 'conquer' && '장소 정복'}
          {type === 'review' && '리뷰 작성'}중
        </S.Text>
      </S.TextWrapper>
    </S.AchievementsSection>
  );
}
