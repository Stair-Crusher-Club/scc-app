import styled from 'styled-components/native';

import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';
import {font} from '@/constant/font';

export const WeeklyConquererSection = styled.View({
  paddingVertical: 32,
  paddingHorizontal: 20,
  gap: 24,
  backgroundColor: color.white,
});

export const ThisWeekStatus = styled.View({});

export const Tooltip = styled.Image({
  width: 170,
  height: 30,
  resizeMode: 'contain',
  marginBottom: 4,
});

export const TitleArea = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 16,
});

export const Title = styled.Text({
  color: color.black,
  fontSize: 18,
  lineHeight: '29px',
  fontFamily: font.pretendardBold,
});

export const MoreButton = styled(SccPressable)({
  height: 24,
  flexDirection: 'row',
  alignItems: 'center',
});

export const More = styled.Text({
  fontSize: 14,
  lineHeight: '22px',
  color: color.brandColor,
  fontFamily: font.pretendardMedium,
});

export const Stamps = styled.View({
  flexDirection: 'row',
  justifyContent: 'space-between',
  gap: 4,
});

export const Stamp = styled.View({
  flex: 1,
  aspectRatio: '1',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 16,
  backgroundColor: color.gray10,
});

export const StampImage = styled.Image({
  width: 40,
  height: 40,
});

export const Empty = styled.Text({
  fontSize: 16,
  lineHeight: '18px',
  color: color.gray70,
  textAlign: 'center',
});
