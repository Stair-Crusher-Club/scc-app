import {PixelRatio} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {HEIGHT_OF_NAVIGATION_HEADER} from '@/constant/constant';
import {font} from '@/constant/font';

export const Container = styled(SafeAreaView)({
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
});
