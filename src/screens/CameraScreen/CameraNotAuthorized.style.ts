import styled from 'styled-components/native';

import {color} from '@/constant/color';

export const CameraNotAuthorized = styled.View({
  height: '100%',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: color.black,
});

export const AccessDeniedText = styled.Text({
  fontSize: 18,
  color: color.white,
});
