import styled from 'styled-components/native';

import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';
import {font} from '@/constant/font';

export const CrusherHistorySection = styled.View({
  paddingTop: 12,
  paddingHorizontal: 20,
});

export const Title = styled.Text({
  paddingVertical: 20,
  fontSize: 18,
  lineHeight: '29px',
  fontFamily: font.pretendardBold,
});

export const Divier = styled.View({
  height: 1,
  backgroundColor: color.gray20,
});

export const Link = styled(SccPressable)({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: 20,
});

export const LinkName = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
});

export const LinkText = styled.Text({
  fontSize: 16,
  lineHeight: '24px',
  fontFamily: font.pretendardRegular,
});

export const CountBadge = styled.View({
  paddingVertical: 4,
  paddingHorizontal: 12,
  borderRadius: 12,
  backgroundColor: color.brand10,
  marginRight: 4,
});

export const Count = styled.Text({
  fontSize: 14,
  lineHeight: '22px',
  fontFamily: font.pretendardBold,
  color: color.brandColor,
});

export const ClickGuide = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
});

export const WIPText = styled(LinkText)({
  color: color.gray50,
});

export const WIPBadge = styled.View({
  paddingVertical: 4,
  paddingHorizontal: 6,
  borderRadius: 10,
  backgroundColor: color.gray10,
  marginLeft: 8,
});

export const WIP = styled(Count)({
  fontSize: 12,
  lineHeight: '19px',
  color: color.gray50,
});
