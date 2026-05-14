import React from 'react';
import styled from 'styled-components/native';

import CloseChipIcon from '@/assets/icon/ic_close_chip.svg';
import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';
import {font} from '@/constant/font';

export interface SelectedChip {
  /** chip의 고유 id (서버 ID 또는 enum value). onRemoveChip에 전달. */
  id: string;
  /** chip 라벨 텍스트 */
  label: string;
}

interface InterestedFormFieldProps {
  label: string;
  /** 선택된 항목 chip 목록. 비어있으면 placeholder 표시. */
  selectedChips: SelectedChip[];
  placeholder: string;
  /** field 영역 클릭 시 호출 (보통 BottomSheet open). chip 영역도 빈 곳 클릭 시 동일하게 동작. */
  onPress: () => void;
  /** chip의 X 클릭 시 호출. 해당 id 제거. */
  onRemoveChip: (id: string) => void;
  /** 로깅용 elementName. */
  elementName: string;
}

/**
 * 관심 지역 / 관심 주제 입력 필드.
 *
 * Figma 1648-38927 (chip row) 디자인 기준:
 * - 선택된 항목이 0개: placeholder 텍스트 + underline
 * - 선택된 항목 1개+: brand40 outline chip 가로 나열, 각 chip에 close(X) 아이콘
 *
 * 튜토리얼/프로필 두 컨텍스트에서 동일하게 사용한다.
 */
export default function InterestedFormField({
  label,
  selectedChips,
  placeholder,
  onPress,
  onRemoveChip,
  elementName,
}: InterestedFormFieldProps) {
  const hasSelection = selectedChips.length > 0;
  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      {hasSelection ? (
        <ChipRow>
          {selectedChips.map(chip => (
            <Chip key={chip.id}>
              <ChipLabel>{chip.label}</ChipLabel>
              <ChipCloseButton
                elementName={`${elementName}_chip_remove`}
                logParams={{chip_id: chip.id}}
                onPress={() => onRemoveChip(chip.id)}>
                <CloseChipIcon width={20} height={20} />
              </ChipCloseButton>
            </Chip>
          ))}
        </ChipRow>
      ) : (
        <PlaceholderRow elementName={elementName} onPress={onPress}>
          <PlaceholderText>{placeholder}</PlaceholderText>
        </PlaceholderRow>
      )}
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

const PlaceholderRow = styled(SccPressable)`
  width: 100%;
  height: 34px;
  padding-bottom: 8px;
  border-bottom-width: 1.5px;
  border-bottom-color: ${color.gray20};
  justify-content: center;
`;

const PlaceholderText = styled.Text`
  font-family: ${font.pretendardRegular};
  font-size: 16px;
  line-height: 24px;
  letter-spacing: -0.32px;
  color: ${color.gray40};
`;

// Figma 1648:38927: gap 8, items-start, flex-wrap allowed for 2+ rows.
const ChipRow = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
`;

// Figma 1648:38928: border 1px #0c76f7, rounded 100, padding 16/8, gap 6 (text<->icon).
const Chip = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 6px;
  border-width: 1px;
  border-color: ${color.brand40};
  border-radius: 100px;
  padding: 8px 16px;
`;

// Figma 1648:38931: Pretendard Medium 16/24 -0.32 #0c76f7.
const ChipLabel = styled.Text`
  font-family: ${font.pretendardMedium};
  font-size: 16px;
  line-height: 24px;
  letter-spacing: -0.32px;
  color: ${color.brand40};
`;

const ChipCloseButton = styled(SccPressable)`
  width: 20px;
  height: 20px;
  align-items: center;
  justify-content: center;
`;
