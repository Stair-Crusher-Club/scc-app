import React from 'react';
import styled from 'styled-components/native';

import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';
import {font} from '@/constant/font';

interface InterestedFormFieldProps {
  label: string;
  /** 선택된 값의 요약 텍스트. null이면 placeholder를 노출. */
  summary: string | null;
  placeholder: string;
  /** Pressable click 시 호출. 보통 BottomSheet를 연다. */
  onPress: () => void;
  /** 로깅용 elementName. */
  elementName: string;
}

/**
 * 관심 지역 / 관심 주제 입력 필드. 라벨 + Pressable 텍스트(요약/placeholder) + 밑줄.
 *
 * Figma 1648-38721 (튜토리얼), 1648-38731 (관심 지역), 1648-38746 (관심 주제) 공통 디자인.
 * 튜토리얼/프로필 두 컨텍스트에서 동일하게 사용한다.
 */
export default function InterestedFormField({
  label,
  summary,
  placeholder,
  onPress,
  elementName,
}: InterestedFormFieldProps) {
  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      <InputRow elementName={elementName} onPress={onPress}>
        <InputText filled={summary !== null}>
          {summary ?? placeholder}
        </InputText>
      </InputRow>
    </Field>
  );
}

const Field = styled.View`
  gap: 8px;
`;

const FieldLabel = styled.Text`
  font-family: ${font.pretendardRegular};
  font-size: 13px;
  line-height: 18px;
  letter-spacing: -0.26px;
  color: ${color.gray80v2};
`;

const InputRow = styled(SccPressable)`
  width: 100%;
  height: 34px;
  padding-bottom: 8px;
  border-bottom-width: 1.5px;
  border-bottom-color: ${color.gray20};
  justify-content: center;
`;

const InputText = styled.Text<{filled: boolean}>`
  font-family: ${({filled}) =>
    filled ? font.pretendardMedium : font.pretendardRegular};
  font-size: 16px;
  line-height: 24px;
  letter-spacing: -0.32px;
  color: ${({filled}) => (filled ? color.gray90v2 : color.gray40)};
`;
