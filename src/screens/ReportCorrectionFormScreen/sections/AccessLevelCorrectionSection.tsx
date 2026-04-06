import React from 'react';
import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';

export default function AccessLevelCorrectionSection() {
  return (
    <Container>
      <SectionTitle>접근레벨</SectionTitle>
      <Description>
        접근레벨은 입구, 층, 문 유형, 엘리베이터 정보를 기반으로 자동
        계산됩니다. 위 항목들을 수정하면 접근레벨이 자동으로 변경됩니다.
      </Description>
    </Container>
  );
}

const Container = styled.View``;

const SectionTitle = styled.Text`
  font-size: 16px;
  font-family: ${font.pretendardBold};
  color: ${color.black};
  margin-bottom: 12px;
`;

const Description = styled.Text`
  font-size: 14px;
  font-family: ${font.pretendardRegular};
  color: ${color.gray50};
  line-height: 20px;
`;
