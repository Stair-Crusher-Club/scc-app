import styled from 'styled-components/native';

import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';
import {font} from '@/constant/font';

export const Options = styled.View({
  display: 'flex',
  flexWrap: 'wrap',
  flexDirection: 'row',
  justifyContent: 'space-between',
  rowGap: 8,
  columnGap: 8,
  color: color.gray70,
});
export const PressableOption = styled(SccPressable)<{
  selected: boolean;
  disabled: boolean;
}>(({selected}) => ({
  borderRadius: 14,
  borderWidth: 1.2,
  display: 'flex',
  flexDirection: 'row' as const,
  gap: 8,
  justifyContent: 'center',
  alignItems: 'center',
  flexGrow: 1,
  width: '40%', // 두 개 이상이면 다음 줄로 내려가도록
  minHeight: 52,
  paddingHorizontal: 12,
  paddingVertical: 14,
  borderColor: selected ? color.blue40 : color.gray20,
  backgroundColor: selected ? color.brand5 : color.white,
}));

// 아이콘+텍스트를 고정 너비로 묶어 센터링 시 아이콘 위치 고정
// icon(28) + text(65) = 93px
export const IconTextRow = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
  width: 93,
});

export const OptionText = styled.Text<{selected: boolean; disabled?: boolean}>(
  ({selected, disabled}) => ({
    width: 65,
    textAlign: 'center' as const,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: -0.32,
    fontFamily: font.pretendardMedium,
    color: disabled ? color.gray35 : selected ? color.brand50 : color.gray80,
  }),
);
