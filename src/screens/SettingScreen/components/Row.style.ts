import styled from 'styled-components/native';

import {SccTouchableHighlight} from '@/components/SccTouchableHighlight';
import {color} from '@/constant/color';
import {font} from '@/constant/font';

export const Row = styled.View({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: 20,
  paddingHorizontal: 25,
});

export const Title = styled.Text({
  color: color.black,
  fontSize: 16,
  fontFamily: font.pretendardRegular,
});

export const Subtitle = styled.Text({
  color: color.gray70,
  fontSize: 14,
  fontFamily: font.pretendardRegular,
  marginTop: 2,
});

export const SubtitleBundle = styled.Text({
  color: color.gray70,
  fontSize: 10,
  fontFamily: font.pretendardRegular,
  marginTop: 2,
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
  lineHeight: '22px',
  fontFamily: font.pretendardRegular,
});
