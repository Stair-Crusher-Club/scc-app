import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';

export const InfoContainer = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 10,
});

export const SummaryIconWrapper = styled.View({
  alignSelf: 'flex-start',
});

export const InfoWrapper = styled.View({
  flex: 1,
});

export const Type = styled.Text({
  fontFamily: font.pretendardMedium,
  fontSize: 14,
  color: color.gray80,
  marginBottom: 4,
});

export const Title = styled.Text({
  fontFamily: font.pretendardBold,
  fontSize: 18,
  lineHeight: '29px',
  color: color.black,
});

export const Description = styled.Text({
  fontFamily: font.pretendardRegular,
  fontSize: 16,
  lineHeight: '25px',
  color: color.gray90,
});

export const DetailedIconWrapper = styled.View({
  justifySelf: 'flex-end',
  justifyContent: 'center',
  alignItems: 'center',
  width: 60,
  height: 60,
  borderRadius: 20,
  backgroundColor: color.gray10,
});

export const Separator = styled.View({
  height: 1,
  backgroundColor: color.gray20,
});
