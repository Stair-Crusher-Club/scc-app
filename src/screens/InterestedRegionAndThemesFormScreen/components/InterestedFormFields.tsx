import React from 'react';
import styled from 'styled-components/native';

import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';
import {font} from '@/constant/font';

export interface SelectedChip {
  /** chip의 고유 id (서버 ID 또는 enum value). */
  id: string;
  /** chip 라벨 텍스트 */
  label: string;
}

interface InterestedFormFieldProps {
  label: string;
  /** 선택된 항목 목록. 비어있으면 placeholder 표시. */
  selectedChips: SelectedChip[];
  placeholder: string;
  /** field 영역 클릭 시 호출 (BottomSheet open). */
  onPress: () => void;
  /** 로깅용 elementName. */
  elementName: string;
}

/**
 * 관심 지역 / 관심 주제 입력 필드.
 *
 * Figma 1648:38835 디자인 기준:
 * - 선택된 항목이 0개: placeholder 텍스트 + underline
 * - 선택된 항목 1개+: ", "로 연결된 라벨 텍스트 + underline
 *
 * 항목 제거는 BottomSheet 안의 chip에서만 수행. 폼 필드에는 X 버튼 없음.
 */
export default function InterestedFormField({
  label,
  selectedChips,
  placeholder,
  onPress,
  elementName,
}: InterestedFormFieldProps) {
  const hasSelection = selectedChips.length > 0;
  const valueText = selectedChips.map(chip => chip.label).join(', ');
  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      <ValueRow elementName={elementName} onPress={onPress}>
        {hasSelection ? (
          <ValueText>{valueText}</ValueText>
        ) : (
          <PlaceholderText>{placeholder}</PlaceholderText>
        )}
      </ValueRow>
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

const ValueRow = styled(SccPressable)`
  width: 100%;
  min-height: 34px;
  padding-bottom: 8px;
  border-bottom-width: 1.5px;
  border-bottom-color: ${color.gray20};
  justify-content: center;
`;

const ValueText = styled.Text`
  font-family: ${font.pretendardRegular};
  font-size: 16px;
  line-height: 24px;
  letter-spacing: -0.32px;
  color: ${color.gray90v2};
`;

const PlaceholderText = styled.Text`
  font-family: ${font.pretendardRegular};
  font-size: 16px;
  line-height: 24px;
  letter-spacing: -0.32px;
  color: ${color.gray40};
`;
