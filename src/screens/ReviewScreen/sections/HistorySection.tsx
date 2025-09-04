import React from 'react';
import * as S from '../../ConquererScreen/sections/CrusherHistorySection.style';

import RightAngleArrowIcon from '@/assets/icon/ic_angle_bracket_right.svg';
import {color} from '@/constant/color';
import useNavigation from '@/navigation/useNavigation';

export default function HistorySection() {
  const navigation = useNavigation();
  const data = {
    totalNumberOfReviews: 10,
    totalNumberOfUpVotes: 3,
  };

  return (
    <S.CrusherHistorySection>
      <S.Title>리뷰 히스토리</S.Title>
      <S.Divier />
      <S.Link onPress={() => navigation.navigate('Review/History')}>
        <S.LinkName>
          <S.LinkText>지금까지 내가 작성한 리뷰</S.LinkText>
        </S.LinkName>
        <S.ClickGuide>
          <S.CountBadge>
            <S.Count>{data.totalNumberOfReviews.toLocaleString()}</S.Count>
          </S.CountBadge>
          <RightAngleArrowIcon color={color.gray50} />
        </S.ClickGuide>
      </S.Link>
      <S.Link onPress={() => navigation.navigate('Review/UpVote')}>
        <S.LinkName>
          <S.LinkText>도움이 되었어요</S.LinkText>
        </S.LinkName>
        <S.ClickGuide>
          <S.CountBadge>
            <S.Count>{data.totalNumberOfUpVotes.toLocaleString()}</S.Count>
          </S.CountBadge>
          <RightAngleArrowIcon color={color.gray50} />
        </S.ClickGuide>
      </S.Link>
    </S.CrusherHistorySection>
  );
}
