import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';

export const MenuListSection = styled.View({});

export const MenuItem = styled.View({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: 20,
  paddingLeft: 25,
  paddingRight: 15,
});

export const MenuTitle = styled.Text(({disabled}) => ({
  fontFamily: font.pretendardRegular,
  fontSize: 16,
  color: disabled ? color.gray50 : color.black,
}));

export const NotAvailableBadge = styled.View({
  justifySelf: 'start',
  paddingVertical: 4,
  paddingHorizontal: 6,
  marginLeft: 8,
  marginRight: 'auto',
  backgroundColor: color.gray10,
  borderRadius: 10,
});

export const NotAvailableText = styled.Text({
  fontFamily: font.pretendardRegular,
  fontSize: 12,
  lineHeight: '19px',
  color: color.gray50,
});
