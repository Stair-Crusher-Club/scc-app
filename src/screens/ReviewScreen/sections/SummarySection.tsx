import {useMe} from '@/atoms/Auth';
import styled from 'styled-components/native';
import * as S from '../../ConquererScreen/sections/ConquererSummarySection.style';

export default function SummarySection() {
  const {userInfo} = useMe();
  const data = {
    todayReviewCount: 10,
    thisMonthReviewCount: 2,
  };

  return (
    <S.ConquererSummarySection>
      <S.Decotator>
        <S.Title>{`${userInfo?.nickname}님\n리뷰 리포트`}</S.Title>
        <DecoImage source={require('@/assets/img/bg_review.png')} />
      </S.Decotator>
      <S.Dashboard>
        <S.Item>
          <S.ItemTitle>오늘의 리뷰</S.ItemTitle>
          <S.ItemValue>{data?.todayReviewCount.toLocaleString()}개</S.ItemValue>
        </S.Item>
        <S.Divider />
        <S.Item>
          <S.ItemTitle>이번달 리뷰</S.ItemTitle>
          <S.ItemValue>
            {data?.thisMonthReviewCount.toLocaleString()}개
          </S.ItemValue>
        </S.Item>
      </S.Dashboard>
    </S.ConquererSummarySection>
  );
}

const DecoImage = styled.Image({
  width: 150,
  height: 84,
  position: 'absolute',
  right: 20,
  top: 32,
});
