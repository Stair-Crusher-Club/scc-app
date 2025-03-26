import React from 'react';
import styled from 'styled-components/native';

import {color} from '@/constant/color.ts';
import {font} from '@/constant/font.ts';
import CheckBox from '@/components/common/CheckBox';

export default function ScoreSelector({
  score,
  onChange,
}: {
  score: number | undefined | null;
  onChange: (score: number | null) => void;
}) {
  const labels = [
    '0이하: 접근 쉬움',
    '1이하: 계단 1칸 이내',
    '2이하: 계단 2칸 이내',
    '3이하: 계단 3칸 이내',
    '4이하: 계단 4칸 이내',
    '5이하: 계단 5칸 이상',
  ];
  return (
    <Container>
      {labels.map((label, index) => (
        <ItemBox
          activeOpacity={0.8}
          key={index}
          onPress={() => {
            if (score === index) {
              onChange(null);
            } else {
              onChange(index);
            }
          }}>
          <Label>{label}</Label>
          <CheckBox checked={score === index} />
        </ItemBox>
      ))}
    </Container>
  );
}

const Container = styled.View`
  width: 100%;
  flex-direction: column;
  align-content: flex-start;
  gap: 12px;
`;

const ItemBox = styled.TouchableOpacity`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const Label = styled.Text`
  font-size: 14px;
  font-family: ${font.pretendardMedium};
  color: ${color.gray100};
`;
