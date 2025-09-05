import styled from 'styled-components/native';

import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';
import {font} from '@/constant/font';

export const ConqueredList = styled.View({
  paddingHorizontal: 20,
  borderTopWidth: 1,
  borderTopColor: color.gray10,
});

export const MonthlySummary = styled.View({
  height: 76,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
});

export const Text = styled.Text({
  fontSize: 16,
  lineHeight: 26,
  fontFamily: font.pretendardRegular,
  color: '#1e1e1e',
});

export const MonthTotal = styled.Text({
  fontSize: 24,
  lineHeight: '36px',
  fontFamily: font.pretendardBold,
  color: color.brandColor,
});

export const PlaceList = styled.View({
  padding: 20,
  gap: 32,
  borderRadius: 20,
  backgroundColor: color.white,
});

export const PlaceRow = styled(SccPressable)({
  gap: 4,
  borderBottomWidth: 1,
  borderBottomColor: color.gray10,
});

export const PlaceName = styled.Text({
  fontSize: 16,
  lineHeight: 26,
  fontFamily: font.pretendardMedium,
});
export const PlaceAddress = styled.Text({
  fontSize: 14,
  lineHeight: '22px',
  fontFamily: font.pretendardRegular,
  color: color.gray50,
});
export const ConqueredDate = styled.Text({
  position: 'absolute',
  top: 20,
  right: 0,
  fontSize: 12,
  lineHeight: '19px',
  fontFamily: font.pretendardRegular,
  color: color.gray80,
});
