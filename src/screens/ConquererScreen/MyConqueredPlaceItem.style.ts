import styled from 'styled-components/native';

import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';
import {font} from '@/constant/font';

export const Container = styled(SccPressable)({
  flexDirection: 'row',
  alignItems: 'center',
});

export const ContentsContainer = styled.View({
  flex: 1,
  marginEnd: 16,
});

export const Title = styled.Text({
  color: color.black,
  fontFamily: font.pretendardMedium,
  fontSize: 18,
  marginBottom: 8,
});

export const Address = styled.Text({
  color: color.gray50,
  fontFamily: font.pretendardMedium,
  fontSize: 14,
});
