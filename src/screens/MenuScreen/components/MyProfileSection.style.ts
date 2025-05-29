import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';

export const MyProfileSection = styled.View({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: 24,
  paddingLeft: 24,
  paddingRight: 20,
});

export const Nickname = styled.Text({
  fontFamily: font.pretendardBold,
  fontSize: 20,
  marginBottom: 4,
});

export const Email = styled.Text({
  fontFamily: font.pretendardRegular,
  fontSize: 14,
  color: color.gray80,
});

export const EditProfileButton = styled.View({
  paddingVertical: 8,
  paddingHorizontal: 12,
  backgroundColor: color.gray10,
  borderRadius: 20,
});

export const ButtonText = styled.Text({
  fontFamily: font.pretendardSemibold,
  fontSize: 14,
  lineHeight: '22px',
});
