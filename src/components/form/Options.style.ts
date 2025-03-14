import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';

export const Options = styled.View({
  display: 'flex',
  flexWrap: 'wrap',
  flexDirection: 'row',
  justifyContent: 'space-between',
  rowGap: 16,
  columnGap: 12,
  color: color.gray70,
});
export const PressableOption = styled.Pressable(
  ({selected, disabled}: {selected: boolean; disabled: boolean}) => ({
    borderRadius: 20,
    borderWidth: 1,
    display: 'flex',
    flexDirection: 'row' as const,
    gap: 5,
    justifyContent: 'center',
    alignItems: 'center',
    flexGrow: 1,
    width: '40%', // 두 개 이상이면 다음 줄로 내려가도록
    height: 54,
    paddingHorizontal: 12,
    opacity: disabled ? 0.3 : 1,
    borderColor: selected ? color.blue30 : color.gray30,
    backgroundColor: selected ? color.blue30a15 : 'transparent',
  }),
);

export const OptionText = styled.Text(({selected}: {selected: boolean}) => ({
  flex: 1,
  textAlign: 'center' as const,
  fontSize: 16,
  fontFamily: font.pretendardMedium,
  color: selected ? color.brandColor : color.gray70,
}));
