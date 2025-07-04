import styled from 'styled-components/native';

import {color} from '@/constant/color';

export const AppBar = styled.View({
  position: 'absolute',
  zIndex: 999,
  width: '100%',
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: 10,
  paddingHorizontal: 8,
});

export const BackButton = styled.View({
  alignItems: 'center',
  justifyContent: 'center',
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: color.white,
});
