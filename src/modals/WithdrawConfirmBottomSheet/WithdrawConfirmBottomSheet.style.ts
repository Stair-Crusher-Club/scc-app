import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {SccPressable} from '@/components/SccPressable';

export const ContentsContainer = styled.View({
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  paddingTop: 28,
  paddingHorizontal: 20,
});

export const IconWrapper = styled.View({paddingTop: 20});
export const Title = styled.Text({
  width: '100%',
  color: color.black,
  fontSize: 20,
  lineHeight: '32px',
  fontFamily: font.pretendardBold,
  marginTop: 28,
  marginBottom: 10,
});

export const ButtonContainer = styled.View({
  flexDirection: 'row',
  gap: 10,
  padding: 24,
});

export const WithdrawButton = styled(SccPressable)({
  flex: 1,
  height: 56,
  borderRadius: 20,
  backgroundColor: color.red,
  justifyContent: 'center',
  alignItems: 'center',
});

export const WithdrawButtonText = styled.Text({
  color: color.white,
  fontSize: 18,
  fontFamily: font.pretendardBold,
});

export const CancelButton = styled(SccPressable)({
  flex: 1,
  height: 56,
  borderRadius: 20,
  backgroundColor: color.gray10,
  justifyContent: 'center',
  alignItems: 'center',
});

export const CancelButtonText = styled.Text({
  color: color.black,
  fontSize: 18,
  fontFamily: font.pretendardMedium,
});
