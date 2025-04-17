import {
  appleAuth,
  appleAuthAndroid,
} from '@invertase/react-native-apple-authentication';
import {getProfile, login} from '@react-native-seoul/kakao-login';
import {useAtom, useSetAtom} from 'jotai';
import React, {useState} from 'react';
import {ImageSourcePropType, Platform, useWindowDimensions} from 'react-native';
import Carousel from 'react-native-reanimated-carousel';

import AppleLogo from '@/assets/icon/ic_logo_apple.svg';
import KakaoLogo from '@/assets/icon/ic_logo_kakao.svg';
import {accessTokenAtom, userInfoAtom} from '@/atoms/Auth';
import {ScreenLayout} from '@/components/ScreenLayout';
import {AuthTokensDto, User} from '@/generated-sources/openapi';
import useAppComponents from '@/hooks/useAppComponents';
import Logger from '@/logging/Logger';
import {ScreenProps} from '@/navigation/Navigation.screens';
import ToastUtils from '@/utils/ToastUtils';

import * as S from './LoginScreen.style';

interface SlideData {
  heading: string;
  title: string;
  image: ImageSourcePropType;
}

interface LoginWith3rdPartyProps {
  onKakaoButtonPressed: () => void;
  onAppleButtonPressed: () => void;
  onGuestButtonPressed?: () => void;
}

const LoginWith3rdParty = ({
  onKakaoButtonPressed,
  onAppleButtonPressed,
  onGuestButtonPressed,
}: LoginWith3rdPartyProps) => {
  return (
    <>
      <S.KakaoLogin onPress={onKakaoButtonPressed}>
        <S.LoginButtonIcon>
          <KakaoLogo />
        </S.LoginButtonIcon>
        <S.LoginWithKakao>카카오톡으로 계속하기</S.LoginWithKakao>
      </S.KakaoLogin>
      {/* 안드로이드 애플로그인 지원 시 appleAuthAndroid.isSupported 체크 필요 */}
      {Platform.OS === 'ios' && (
        <S.AppleLogin onPress={onAppleButtonPressed}>
          <S.LoginButtonIcon>
            <AppleLogo />
          </S.LoginButtonIcon>
          <S.LoginWithApple>Apple로 계속하기</S.LoginWithApple>
        </S.AppleLogin>
      )}
      {onGuestButtonPressed && (
        <S.GuestLogin onPress={onGuestButtonPressed}>
          <S.LoginAsGuest>비회원 둘러보기</S.LoginAsGuest>
        </S.GuestLogin>
      )}
    </>
  );
};

export interface LoginScreenParams {
  /**
   * 모달로 띄우는 경우
   * - 완료 후 이전 화면으로 돌아감
   * - 비회원으로 둘러보기 버튼을 감춤
   */
  asModal?: boolean;
}

export default function LoginScreen({navigation, route}: ScreenProps<'Login'>) {
  const {api} = useAppComponents();
  const [accessToken, setAccessToken] = useAtom(accessTokenAtom);
  const setUserInfo = useSetAtom(userInfoAtom);
  const [activeSlide, setActiveSlide] = useState(0);
  const {asModal} = route.params ?? {};

  async function afterSocialLogin(
    user: User,
    tokens: AuthTokensDto,
    signupEmail?: string,
  ) {
    // 미가입 유저 : 앱 종료 후 재시작 시 로그인 되지 않도록 토큰을 저장하지 않는다
    if (!user.email) {
      return navigation.replace('Signup', {
        email: signupEmail ?? '',
        token: tokens.accessToken,
        asModal,
      });
    }

    // 가입 유저
    setUserInfo(user);
    setAccessToken(tokens.accessToken);

    if (asModal) {
      // 모달로 열린 경우, 로그인 되면 닫아버린다
      navigation.goBack();
    } else {
      navigation.replace('Main');
    }
  }

  async function kakaoLogin() {
    try {
      // loginWithKakaoAccount() 는 웹뷰를 통해 로그인 - 이메일/비밀번호를 통한 로그인
      // login()은 카카오톡 앱을 통해 로그인!
      const kakaoTokens = await login();
      // 라이브러리에서 반환하는게 Date 가 아닌 utc 시간 문자열이라 변환
      const fixedAccessTokenExpiresAt = new Date(
        kakaoTokens.accessTokenExpiresAt,
      );
      const fixedRefreshTokenExpiresAt = new Date(
        kakaoTokens.refreshTokenExpiresAt,
      );
      const res = await api.loginWithKakaoPost({
        kakaoTokens: {
          accessToken: kakaoTokens.accessToken,
          refreshToken: kakaoTokens.refreshToken,
          idToken: kakaoTokens.idToken,
          accessTokenExpiresAt: {
            value: fixedAccessTokenExpiresAt.getTime(),
          },
          refreshTokenExpiresAt: {
            value: fixedRefreshTokenExpiresAt.getTime(),
          },
        },
      });
      const kakaoProfile = await getProfile();
      const {authTokens, user} = res.data;

      await afterSocialLogin(user, authTokens, kakaoProfile.email);
    } catch (e: any) {
      // user cancelled kakao log
      Logger.logError(e);
      ToastUtils.show('로그인 중 문제가 발생했습니다.');
    }
  }

  async function androidAppleLogin() {
    appleAuthAndroid.configure({
      clientId: 'club.staircrusher.android.sandbox',

      // Return URL added to your Apple dev console. We intercept this redirect, but it must still match
      // the URL you provided to Apple. It can be an empty route on your backend as it's never called.
      redirectUri: 'https://api.dev.staircrusher.club/auth/callback',

      // The type of response requested - code, id_token, or both.
      responseType: appleAuthAndroid.ResponseType.ALL,

      // The amount of user information requested from Apple.
      scope: appleAuthAndroid.Scope.ALL,

      // Random nonce value that will be SHA256 hashed before sending to Apple.
      // nonce: '',

      // Unique state value used to prevent CSRF attacks. A UUID will be generated if nothing is provided.
      // state,
    });
    const response = await appleAuthAndroid.signIn();
    const res = await api.loginWithApplePost({
      authorizationCode: response.code ?? '',
      identityToken: response.id_token ?? '',
    });
    const {authTokens, user} = res.data;
    await afterSocialLogin(user, authTokens, response.user?.email ?? '');
  }

  async function iosAppleLogin() {
    // performs login request
    const appleAuthRequestResponse = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      // Note: it appears putting FULL_NAME first is important, see issue #293
      requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
    });

    // get current authentication state for user
    // /!\ This method must be tested on a real device. On the iOS simulator it always throws an error.
    const credentialState = await appleAuth.getCredentialStateForUser(
      appleAuthRequestResponse.user,
    );

    // use credentialState response to ensure the user is authenticated
    if (credentialState === appleAuth.State.AUTHORIZED) {
      const res = await api.loginWithApplePost({
        authorizationCode: appleAuthRequestResponse.authorizationCode ?? '',
        identityToken: appleAuthRequestResponse.identityToken ?? '',
      });
      const {authTokens, user} = res.data;

      await afterSocialLogin(
        user,
        authTokens,
        appleAuthRequestResponse.email ?? '',
      );
    }
  }

  async function appleLogin() {
    try {
      if (Platform.OS === 'android') {
        await androidAppleLogin();
      } else {
        await iosAppleLogin();
      }
    } catch (e) {
      ToastUtils.show('로그인 중 문제가 발생했습니다.');
    }
  }

  async function guestLogin() {
    try {
      // 모달로 열린 경우 : 이미 토큰이 있는 경우 닫아버린다
      if (asModal && accessToken) {
        navigation.goBack();
        return;
      }
      const res = await api.createAnonymousUserPost();
      const {authTokens: tokens} = res.data;
      const guestUser: User = {
        id: '0',
        nickname: '비회원',
        mobilityTools: [],
        isNewsLetterSubscriptionAgreed: false,
      };
      setUserInfo(guestUser);
      setAccessToken(tokens.accessToken);
      navigation.replace('Main');
    } catch (e) {
      ToastUtils.show('로그인 중 문제가 발생했습니다.');
    }
  }

  const windowWidth = useWindowDimensions().width;
  const slides: SlideData[] = [
    {
      heading: '접근성지도',
      title: '한눈에 접근난이도를\n파악해요',
      image: require('@/assets/img/value-map.png'),
    },
    {
      heading: '뿌클로드',
      title: '이동약자가 직접 작성한\n장소 리뷰 확인해요',
      image: require('@/assets/img/value-pcrd.png'),
    },
    {
      heading: '정보등록',
      title: '접근성 정보를\n함께 모아요',
      image: require('@/assets/img/value-gather.png'),
    },
    {
      heading: '정복활동 리포트',
      title: '정복활동 리포트로\n매일매일의 보람을 모아요',
      image: require('@/assets/img/value-report.png'),
    },
  ];

  function renderSlide({item}: {item: SlideData; index: number}) {
    return (
      <S.Slide>
        <S.SlideHeading>{item.heading}</S.SlideHeading>
        <S.SlideTitle>{item.title}</S.SlideTitle>
        <S.SlideImage source={item.image} />
      </S.Slide>
    );
  }

  return (
    <ScreenLayout
      isHeaderVisible={false}
      safeAreaEdges={['top', 'bottom']}
      style={{backgroundColor: 'white'}}>
      <S.Container>
        <S.SlideContainer>
          <Carousel
            data={slides}
            width={windowWidth}
            loop
            renderItem={renderSlide}
            onProgressChange={(_, i) => setActiveSlide(i)}
            panGestureHandlerProps={{activeOffsetX: [-10, 10]}}
            autoPlay={true}
            autoPlayInterval={5000}
          />
          <S.SlideIndicator>
            {slides.map((_, index) => (
              <S.SlideIndicatorItem key={index}>
                <S.SlideIndicatorActive
                  active={getDotColor(index, activeSlide, slides.length)}
                />
              </S.SlideIndicatorItem>
            ))}
          </S.SlideIndicator>
        </S.SlideContainer>
        <S.LoginButtons>
          <LoginWith3rdParty
            onKakaoButtonPressed={kakaoLogin}
            onAppleButtonPressed={appleLogin}
            onGuestButtonPressed={guestLogin}
          />
        </S.LoginButtons>
      </S.Container>
    </ScreenLayout>
  );
}

function getDotColor(index: number, value: number, period: number) {
  const distance = Math.min(
    Math.abs(value - index),
    Math.abs(value - index - period),
  );
  if (distance <= 1) {
    return 1 - distance;
  } else {
    return 0;
  }
}
