import Animated from 'react-native-reanimated';
import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';

export const Container = styled.SafeAreaView({
  flex: 1,
  backgroundColor: color.white,
});

export const CoverImage = styled.Image({
  width: '100%',
  height: 'auto',
  aspectRatio: '375/265',
  marginTop: 80,
});

export const Title = styled.Text({
  flex: 1,
  textAlign: 'center',
  marginLeft: 20,
  marginRight: 20,
  marginTop: 40,
  color: color.black,
  fontSize: 21,
  fontFamily: font.pretendardRegular,
});

export const StatusContainer = styled.View({
  marginLeft: 20,
  marginRight: 20,
  marginBottom: 50,
});

export const ProgressContainer = styled.View({
  height: 50,
  borderColor: color.brandColor,
  borderWidth: 2,
  borderRadius: 4,
  justifyContent: 'center',
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

export const ProgressText = styled.Text({
  position: 'absolute',
  textAlign: 'center',
  color: color.brandColor,
  fontSize: 21,
  fontFamily: font.pretendardBold,
});

export const FilledProgressText = styled.Text({
  position: 'absolute',
  textAlign: 'center',
  color: color.white,
  fontSize: 21,
  fontFamily: font.pretendardBold,
});
