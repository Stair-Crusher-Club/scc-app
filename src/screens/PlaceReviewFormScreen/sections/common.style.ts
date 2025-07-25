import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';

export const Container = styled.View({
  padding: '32px 20px',
  gap: 24,
  backgroundColor: color.white,
});

export const Title = styled.Text({
  fontSize: 20,
  lineHeight: '28px',
  fontFamily: font.pretendardBold,
});

export const SectionSeparator = styled.View({
  backgroundColor: color.gray10,
  height: 13,
});
