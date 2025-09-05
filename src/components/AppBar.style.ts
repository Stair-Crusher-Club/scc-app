import styled from 'styled-components/native';

import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';
import {font} from '@/constant/font';

export const Container = styled.View({
  height: 50,
});

export const ContentsContainer = styled.View({
  justifyContent: 'space-between',
  alignItems: 'center',
  flexDirection: 'row',
  flex: 1,
  paddingHorizontal: 10,
});

export const Title = styled.Text({
  color: color.black,
  fontSize: 16,
  fontFamily: font.pretendardRegular,
});

export const CloseButton = styled(SccPressable)({
  width: 44,
  height: 44,
  alignItems: 'center',
  justifyContent: 'center',
});

export const SpaceButton = styled.View({
  width: 44,
  height: 44,
});

export const Separator = styled.View({
  height: 1,
  backgroundColor: color.gray20,
});
