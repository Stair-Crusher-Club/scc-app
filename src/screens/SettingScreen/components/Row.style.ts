import styled from 'styled-components/native';

import {SccTouchableHighlight} from '@/components/SccTouchableHighlight';
import {color} from '@/constant/color';
import {font} from '@/constant/font';

export const Row = styled.View({
  paddingVertical: 20,
  paddingHorizontal: 20,
});

export const SectionLabel = styled.Text({
  color: color.gray50,
  fontSize: 14,
  lineHeight: 20,
  fontFamily: font.pretendardRegular,
  marginBottom: 8,
});

export const ValueRow = styled.View({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
});

export const ValueContent = styled.View({
  gap: 2,
});

export const SectionValue = styled.Text({
  color: color.black,
  fontSize: 16,
  lineHeight: 26,
  fontFamily: font.pretendardMedium,
});

export const SubtitleBundle = styled.Text({
  color: color.gray45,
  fontSize: 10,
  lineHeight: 14,
  fontFamily: font.pretendardRegular,
});

export const ActionButton = styled(SccTouchableHighlight)({
  borderRadius: 10,
  backgroundColor: color.brand10,
  paddingHorizontal: 10,
  paddingVertical: 8,
});

export const ActionButtonText = styled.Text({
  color: color.link,
  fontSize: 14,
  lineHeight: 22,
  fontFamily: font.pretendardRegular,
});

export const CopyButton = styled(SccTouchableHighlight)({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 2,
  padding: 4,
});

export const CopyButtonText = styled.Text({
  color: color.brandColor,
  fontSize: 13,
  lineHeight: 18,
  fontFamily: font.pretendardMedium,
});
