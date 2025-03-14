import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';

export const MyProfileSection = styled.View({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: 30,
  paddingHorizontal: 40,
});

export const Nickname = styled.Text({
  fontFamily: font.pretendardBold,
  fontSize: 24,
});

export const Email = styled.Text({
  fontFamily: font.pretendardRegular,
  fontSize: 14,
});

export const EditProfileButton = styled.View({
  paddingVertical: 8,
  paddingHorizontal: 12,
  backgroundColor: color.gray10,
  borderRadius: 20,
});

export const ButtonText = styled.Text({
  fontFamily: font.pretendardRegular,
  fontSize: 14,
  lineHeight: '22px',
});
