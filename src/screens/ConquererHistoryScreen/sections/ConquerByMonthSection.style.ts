import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';

export const ConquerByMonthSection = styled.View({});

export const MonthRow = styled.Pressable({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: 24,
  paddingLeft: 20,
  paddingRight: 16,
});

export const Month = styled.Text({
  fontSize: 18,
  lineHeight: '29px',
  fontFamily: font.pretendardMedium,
  color: '#000000',
});

export const ClickGuide = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
});

export const CountBadge = styled.View({
  paddingVertical: 4,
  paddingHorizontal: 12,
  borderRadius: 12,
  backgroundColor: color.gray10,
  marginRight: 4,
});

export const Count = styled.Text({
  fontSize: 14,
  lineHeight: '22px',
  fontFamily: font.pretendardRegular,
  color: color.black,
});
