import {PixelRatio} from 'react-native';
import styled from 'styled-components/native';

import {SafeAreaWrapper} from '@/components/SafeAreaWrapper';
import {color} from '@/constant/color';
import {HEIGHT_OF_NAVIGATION_HEADER} from '@/constant/constant';
import {font} from '@/constant/font';

export const Container = styled(SafeAreaWrapper)({
  backgroundColor: color.white,
});

export const ContentsContainer = styled.View({
  height: HEIGHT_OF_NAVIGATION_HEADER,
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 20,
  gap: 20,
});

export const Title = styled.Text({
  fontSize: 20 / PixelRatio.getFontScale(),
  fontFamily: font.pretendardMedium,
  color: color.black,
  flex: 1,
  numberOfLines: 1,
});
