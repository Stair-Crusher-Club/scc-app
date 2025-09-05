import React from 'react';
import styled from 'styled-components/native';

import {SccTouchableOpacity} from '@/components/SccTouchableOpacity';
import {color} from '@/constant/color.ts';
import {font} from '@/constant/font.ts';

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
          elementName="search_score_selector_item"
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
          <RadioButton checked={score === index} />
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

const ItemBox = styled(SccTouchableOpacity)`
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

function RadioButton({checked}: {checked: boolean}) {
  if (checked) {
    return (
      <RadioButtonOuter checked>
        <RadioButtonInner />
      </RadioButtonOuter>
    );
  }
  return <RadioButtonOuter />;
}

const RadioButtonOuter = styled.View<{checked?: boolean}>`
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: 2px solid
    ${props => (props.checked ? color.brandColor : color.gray25)};
  border-radius: 12px;
`;

const RadioButtonInner = styled.View`
  width: 12px;
  height: 12px;
  background-color: ${color.brandColor};
  border-radius: 6px;
`;
