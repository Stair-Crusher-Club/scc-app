import Animated from 'react-native-reanimated';
import styled from 'styled-components/native';

import {color} from '@/constant/color';

export const Container = styled.SafeAreaView({
  flex: 1,
  backgroundColor: color.brand30,
  justifyContent: 'center',
  alignItems: 'center',
  paddingBottom: 180,
});

export const CoverImage = styled.Image({
  width: '246px',
  height: '69px',
});

export const ProgressBar = styled(Animated.View)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  backgroundcolor: ${color.brandColor};
  justifycontent: center;
`;
