import styled from 'styled-components/native';

import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';
import {font} from '@/constant/font';

export const ConquererMonthlyScreen = styled.View({
  flex: 1,
  backgroundColor: color.gray10,
});

export const Header = styled.View({
  height: 44,
});

export const CloseButton = styled(SccPressable)({
  position: 'absolute',
  top: 0,
  right: 0,
  padding: 12,
});

export const MonthSelector = styled.View({
  height: 40,
  paddingHorizontal: 20,
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
});

export const CurrentMonth = styled.Text({
  flex: 1,
  textAlign: 'center',
  fontSize: 18,
  lineHeight: '29px',
  fontFamily: font.pretendardBold,
  color: color.black,
});

export const MoveMonthButton = styled(SccPressable)({
  padding: 8,
});
