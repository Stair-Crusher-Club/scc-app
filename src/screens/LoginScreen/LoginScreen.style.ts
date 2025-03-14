import {CSSObject} from 'styled-components';
import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';

export const ScrollView = styled.ScrollView({
  backgroundColor: color.white,
});

export const Container = styled.View({
  flex: 1,
  justifyContent: 'flex-end',
});

export const SlideContainer = styled.View({
  marginTop: 40,
  width: '100%',
  height: 440,
});

export const Slide = styled.View({
  width: '100%',
  alignItems: 'center',
});

export const SlideHeading = styled.Text({
  fontSize: 13,
  lineHeight: '17px',
  fontFamily: font.pretendardBold,
  color: color.blue50,
  textAlign: 'center',
  marginBottom: 10,
});

export const SlideTitle = styled.Text({
  fontSize: 22,
  lineHeight: '31px',
  fontFamily: font.pretendardSemibold,
  color: color.black,
  textAlign: 'center',
});

export const SlideImage = styled.Image({
  width: '100%',
  height: 'auto',
  aspectRatio: '375 / 310',
});

export const SlideIndicator = styled.View({
  flexDirection: 'row',
  gap: 8,
  justifyContent: 'center',
  marginTop: 10,
});

export const SlideIndicatorItem = styled.View({
  width: 8,
  height: 8,
  borderRadius: 4,
  backgroundColor: color.gray20,
});

export const SlideIndicatorActive = styled.View<{active: number}>(
  ({active}) => ({
    position: 'absolute',
    top: 0,
    left: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: color.blue50,
    opacity: active,
  }),
);

export const Wrapper = styled.View({
  paddingTop: 10,
  paddingBottom: 10,
});

export const LoginButtons = styled.View({
  justifyContent: 'flex-end',
  paddingHorizontal: 20,
  gap: 10,
  marginTop: 58,
});

export const LoginButtonIcon = styled.View({
  position: 'absolute',
  left: 16,
  top: 17,
});

const LoginButton: CSSObject = {
  flexFlow: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 16,
  width: '100%',
  height: 58,
  borderRadius: 12,
  backgroundColor: 'white',
  color: color.blacka80,
};
const LoginButtonText: CSSObject = {
  fontFamily: font.pretendardBold,
  fontSize: 16,
  lineHeight: '24px',
};

export const KakaoLogin = styled.TouchableOpacity({
  ...LoginButton,
  backgroundColor: '#FEE500',
});
export const LoginWithKakao = styled.Text({
  ...LoginButtonText,
  color: color.blacka80,
});

export const AppleLogin = styled.TouchableOpacity({
  ...LoginButton,
  borderWidth: 1,
  borderColor: color.black,
  backgroundColor: color.white,
});
export const LoginWithApple = styled.Text(LoginButtonText);

export const GuestLogin = styled.TouchableOpacity(LoginButton);
export const LoginAsGuest = styled.Text({
  ...LoginButtonText,
  fontSize: 14,
  fontFamily: font.pretendardRegular,
  color: color.gray90,
});

export const EmailLogin = styled.TouchableOpacity(LoginButton);
export const LoginWithEmail = styled.Text({
  ...LoginButtonText,
  fontFamily: font.pretendardRegular,
  color: 'black',
});
