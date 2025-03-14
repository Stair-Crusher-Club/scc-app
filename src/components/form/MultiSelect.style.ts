import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';

export const Options = styled.View({
  flexFlow: 'row wrap',
  justifyContent: 'flex-start',
  gap: 10,
});
export const PressableOption = styled.Pressable(
  ({selected}: {selected: boolean}) => ({
    borderRadius: 20,
    borderWidth: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: 'auto',
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderColor: selected ? color.brand20 : color.gray30,
    backgroundColor: selected ? color.brand10 : 'transparent',
  }),
);
export const OptionText = styled.Text(({selected}: {selected: boolean}) => ({
  fontSize: 14,
  fontFamily: font.pretendardMedium,
  color: selected ? color.brandColor : color.gray70,
}));

export const MultiSelectContainer = styled.View({
  gap: 10,
});

export const LabelWrapper = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 2,
});
export const Label = styled.Text({
  fontSize: 16,
  lineHeight: '24px',
  fontFamily: font.pretendardBold,
});
export const LabelPoint = styled.Text({
  fontSize: 16,
  lineHeight: '24px',
  fontFamily: font.pretendardBold,
  color: color.red,
});
export const Optional = styled.Text({
  fontSize: 16,
  lineHeight: '24px',
  fontFamily: font.pretendardRegular,
  color: color.gray70,
});
