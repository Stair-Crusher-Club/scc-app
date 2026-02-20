import Animated from 'react-native-reanimated';
import styled from 'styled-components/native';

import {color} from '@/constant/color';

export const Container = styled.View({
  flex: 1,
  backgroundColor: color.brand30,
  justifyContent: 'center',
  alignItems: 'center',
});

export const CoverImage = styled.Image({
  width: '246px',
  height: '69px',
});

// 사용하는 곳이 없지만 삭제하면 안 된다.
// 삭제하면 iOS 크래시가 난다.
// ref: https://staircrusherclub.slack.com/archives/C09G2SY1JCA/p1762610655019309
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
