import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';

export const InfoContainer = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 10,
});

export const EmptyInfoContainer = styled.View({
  gap: 2,
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
  lineHeight: '20px',
  color: color.gray40,
  marginBottom: 8,
});

export const EmptyType = styled.Text({
  fontFamily: font.pretendardSemibold,
  fontSize: 14,
  lineHeight: '22px',
  color: color.gray80,
  marginBottom: 4,
});

export const BigTitle = styled.Text({
  fontFamily: font.pretendardBold,
  fontSize: 20,
  lineHeight: '28px',
  color: color.gray100,
});

export const Title = styled.Text({
  fontFamily: font.pretendardSemibold,
  fontSize: 18,
  lineHeight: '26px',
  color: color.gray90,
});

export const Description = styled.Text({
  fontFamily: font.pretendardRegular,
  fontSize: 16,
  lineHeight: '24px',
  marginTop: 2,
  color: color.gray50,
});

export const EmptyDescription = styled.Text({
  fontFamily: font.pretendardRegular,
  fontSize: 14,
  color: color.gray40,
});

export const DetailedIconWrapper = styled.View({
  justifySelf: 'flex-end',
  justifyContent: 'center',
  alignItems: 'center',
  width: 60,
  height: 60,
  borderRadius: 14,
  backgroundColor: color.gray10,
});

export const Separator = styled.View({
  height: 1,
  backgroundColor: color.gray20,
});
