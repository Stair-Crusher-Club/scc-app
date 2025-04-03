import messaging from '@react-native-firebase/messaging';
import {useFocusEffect} from '@react-navigation/native';
import {useQuery} from '@tanstack/react-query';
import Lottie from 'lottie-react-native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  BackHandler,
  Linking,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import {useRecoilValue, useSetRecoilState} from 'recoil';

import CrusherClubLogo from '@/assets/icon/logo.svg';
import {accessTokenAtom} from '@/atoms/Auth';
import {currentLocationAtom} from '@/atoms/Location';
import {
  hasShownGuideForFirstVisitAtom,
  isGuestUserSelector,
} from '@/atoms/User';
import {ScreenLayout} from '@/components/ScreenLayout';
import {
  GetClientVersionStatusResponseDtoStatusEnum,
  ListChallengesItemDto,
} from '@/generated-sources/openapi';
import useAppComponents from '@/hooks/useAppComponents';
import {useIsForeground} from '@/hooks/useIsForeground';
import useMe from '@/hooks/useMe';
import {LogClick} from '@/logging/LogClick';
import AppUpgradeNeededBottomSheet from '@/modals/AppUpgradeNeededBottomSheet';
import GeolocationPermissionBottomSheet from '@/modals/GeolocationPermissionBottomSheet';
import GeolocationUtils from '@/utils/GeolocationUtils';
import ToastUtils from '@/utils/ToastUtils';

import ChallengeUpcomingBottomSheet from './ChallengeUpcomingBottomSheet';
import * as S from './HomeScreen.style';
import BannerSection from './sections/BannerSection';
import SearchSection from './sections/SearchSection';

export interface HomeScreenParams {}

const HomeScreen = ({navigation}: any) => {
  const {api} = useAppComponents();

  const accessToken = useRecoilValue(accessTokenAtom);
  const setCurrentLocation = useSetRecoilState(currentLocationAtom);
  const [showGeolocationPermission, setShowGeolocationPermission] =
    useState(false);
  const [showAppUpgradeNeeded, setShowAppUpgradeNeeded] = useState(true);

  const [selectedUpcomingChallenge, setSelectedUpcomingChallenge] = useState<
    ListChallengesItemDto | undefined
  >();
  const isForeground = useIsForeground();
  const coverLottie = useRef<Lottie>(null);
  const {syncUserInfo} = useMe();
  if (isForeground) {
    // 앱 백그라운드 진입 시에 Lottie 가 멈춘다. Foreground 진입 시 의도적으로 play 를 호출한다.
    coverLottie.current?.play();
  }

  const {data} = useQuery({
    queryKey: ['ClientVersionStatus'],
    queryFn: async () => {
      const result = (
        await api.getClientVersionStatusPost({
          version: DeviceInfo.getVersion(),
        })
      ).data;
      return result;
    },
  });
  const versionStatusMessage = data?.message;
  const versionStatus = data?.status;
  const hasShownGuideForFirstVisit = useRecoilValue(
    hasShownGuideForFirstVisitAtom,
  );
  const isGuestUser = useRecoilValue(isGuestUserSelector);

  useEffect(() => {
    if (!hasShownGuideForFirstVisit) {
      navigation.navigate('GuideForFirstVisit');
    }

    const requestGeolocationPermissionIfNeeded = async () => {
      try {
        // 위치 권한을 받지 않고  getCurrentPosition 을 호출하면 위치 권한 팝업을 띄운다.
        // 위치 권한이 없으면 설정으로 이동하기 위한 BottmSheet 를 보여준다.
        const location = await GeolocationUtils.getCurrentPosition();
        setCurrentLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } catch (error: any) {
        console.log(error);
        if (error.PERMISSION_DENIED) {
          setShowGeolocationPermission(true);
        }
      }
    };
    requestGeolocationPermissionIfNeeded();
  }, [navigation, accessToken, syncUserInfo, hasShownGuideForFirstVisit]);

  useEffect(() => {
    syncUserInfo();
  }, []);

  useEffect(() => {
    const requestIOSUserPermission = async () => {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      if (enabled) {
        console.log('Authorization status:', authStatus);
      }
    };

    if (Platform.OS === 'android') {
      PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
    } else {
      requestIOSUserPermission();
    }
  }, []);

  useEffect(() => {
    if (!isGuestUser) {
      (async () => {
        const pushToken = await messaging().getToken();
        await api.updatePushTokenPost({pushToken});
      })();
    }
    return messaging().onTokenRefresh(pushToken => {
      (async () => {
        await api.updatePushTokenPost({pushToken});
      })();
    });
  }, [isGuestUser]);

  const goToIntro = () => {
    navigation.navigate('Webview', {
      fixedTitle: '등록 전 꼭 읽어 주세요',
      url: 'https://agnica.notion.site/2c64dfee581b4cb0bfefd94489eccb3c',
    });
  };
  const openStore = () => {
    const appStoreUrl =
      'https://apps.apple.com/kr/app/계단뿌셔클럽/id6444382843';
    const playStoreUrl =
      'https://play.google.com/store/apps/details?id=club.staircrusher';

    const url = Platform.OS === 'ios' ? appStoreUrl : playStoreUrl;

    Linking.openURL(url).catch(err => console.error('An error occurred', err));
  };

  const lastBackPressTime = useRef<number>(0);
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (lastBackPressTime.current + 2000 >= Date.now()) {
          return false;
        } else {
          ToastUtils.show('뒤로가기 버튼을 한번 더 누르면 종료됩니다.');
          lastBackPressTime.current = Date.now();
          return true;
        }
      };
      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );
      return () => subscription.remove();
    }, []),
  );
  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle('light-content');
      StatusBar.setBackgroundColor('rgba(29, 133, 255, 0.8)');
      return () => {
        StatusBar.setBarStyle('dark-content');
        StatusBar.setBackgroundColor('white');
      };
    }, []),
  );

  return (
    <ScreenLayout
      isHeaderVisible={false}
      safeAreaEdges={['top']}
      style={{backgroundColor: 'rgba(29, 133, 255, 0.8)'}}>
      <S.Header>
        <CrusherClubLogo />
      </S.Header>
      <S.Container>
        <ScrollView bounces={false}>
          <S.ContentsContainer>
            <S.TitleContainer>
              <S.Title allowFontScaling={false}>
                {'일상 속의 계단정보를\n함께 모아요!'}
              </S.Title>
              <LogClick elementName="scc_description">
                <S.Description allowFontScaling={false} onPress={goToIntro}>
                  {'계단정보가 왜 필요한가요? >'}
                </S.Description>
              </LogClick>
            </S.TitleContainer>
            <S.MainImage source={require('@/assets/img/bg_scc_main.png')} />
            <SearchSection />
            <BannerSection />
          </S.ContentsContainer>
        </ScrollView>
        <GeolocationPermissionBottomSheet
          isVisible={showGeolocationPermission}
          onConfirmButtonPressed={() => {
            Linking.openSettings();
            setShowGeolocationPermission(false);
          }}
          onCloseButtonPressed={() => {
            setShowGeolocationPermission(false);
          }}
        />
        <ChallengeUpcomingBottomSheet
          selectedUpcomingChallenge={selectedUpcomingChallenge}
          onPressConfirmButton={() => {
            setSelectedUpcomingChallenge(undefined);
          }}
        />
        {(versionStatus ===
          GetClientVersionStatusResponseDtoStatusEnum.UpgradeNeeded ||
          versionStatus ===
            GetClientVersionStatusResponseDtoStatusEnum.UpgradeRecommended) && (
          <AppUpgradeNeededBottomSheet
            isVisible={showAppUpgradeNeeded}
            isRequired={
              versionStatus ===
              GetClientVersionStatusResponseDtoStatusEnum.UpgradeNeeded
            }
            message={versionStatusMessage ?? ''}
            onConfirmButtonPressed={openStore}
            onCloseButtonPressed={() => {
              setShowAppUpgradeNeeded(false);
            }}
          />
        )}
      </S.Container>
    </ScreenLayout>
  );
};

export default HomeScreen;
