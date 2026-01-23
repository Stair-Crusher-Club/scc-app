import {
  AuthorizationStatus,
  getMessaging,
} from '@react-native-firebase/messaging';
import {useFocusEffect} from '@react-navigation/native';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import {useAtomValue, useSetAtom} from 'jotai';
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

import CrusherClubLogo from '@/assets/icon/logo.svg';
import {accessTokenAtom, isAnonymousUserAtom, useMe} from '@/atoms/Auth';
import {currentLocationAtom} from '@/atoms/Location';
import {hasShownGuideForFirstVisitAtom} from '@/atoms/User';
import {SccTouchableOpacity} from '@/components/SccTouchableOpacity';
import {ScreenLayout} from '@/components/ScreenLayout';
import {color} from '@/constant/color';
import {
  GetClientVersionStatusResponseDtoStatusEnum,
  ListChallengesItemDto,
} from '@/generated-sources/openapi';
import useAppComponents from '@/hooks/useAppComponents';
import {useIsForeground} from '@/hooks/useIsForeground';
import AppUpgradeNeededBottomSheet from '@/modals/AppUpgradeNeededBottomSheet';
import GeolocationPermissionBottomSheet, {
  GeolocationErrorReason,
} from '@/modals/GeolocationPermissionBottomSheet';
import CoachMarkGuideLink from '@/screens/HomeScreen/components/CoachMarkGuideLink';
import CoachMarkTarget from '@/screens/HomeScreen/components/CoachMarkTarget';
import GeolocationUtils from '@/utils/GeolocationUtils';
import ToastUtils from '@/utils/ToastUtils';

import Logger from '@/logging/Logger';
import ChallengeUpcomingBottomSheet from './ChallengeUpcomingBottomSheet';
import * as S from './HomeScreen.style';
import BannerSection from './sections/BannerSection';
import SearchSection from './sections/SearchSection';

export interface HomeScreenParams {}

const HomeScreen = ({navigation}: any) => {
  const {api} = useAppComponents();

  const accessToken = useAtomValue(accessTokenAtom);
  const setCurrentLocation = useSetAtom(currentLocationAtom);
  const [geolocationErrorReason, setGeolocationErrorReason] =
    useState<GeolocationErrorReason | null>(null);
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
  const hasShownGuideForFirstVisit = useAtomValue(
    hasShownGuideForFirstVisitAtom,
  );
  const isAnonymousUser = useAtomValue(isAnonymousUserAtom);

  useEffect(() => {
    if (!hasShownGuideForFirstVisit) {
      navigation.navigate('GuideForFirstVisit');
    }

    const requestGeolocationPermissionIfNeeded = async () => {
      try {
        // 위치 권한을 받지 않고  getCurrentPosition 을 호출하면 위치 권한 팝업을 띄운다.
        // 위치 권한이 없으면 설정으로 이동하기 위한 BottmSheet 를 보여준다.
        const location = await GeolocationUtils.getCurrentPosition();
        if (geolocationErrorReason !== null) {
          setGeolocationErrorReason(null);
        }
        setCurrentLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } catch (error: any) {
        Logger.logError(error);
        if (error.code === 1) {
          // PERMISSION_DENIED
          setGeolocationErrorReason('permission_denied');
        } else if (error.code === 2) {
          // POSITION_UNAVAILABLE (GPS 꺼짐)
          setGeolocationErrorReason('location_unavailable');
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
      const authStatus = await getMessaging().requestPermission();
      const enabled =
        authStatus === AuthorizationStatus.AUTHORIZED ||
        authStatus === AuthorizationStatus.PROVISIONAL;
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
    if (!isAnonymousUser) {
      (async () => {
        const pushToken = await getMessaging().getToken();
        await api.updatePushTokenPost({pushToken});
      })();
    }
    return getMessaging().onTokenRefresh(pushToken => {
      (async () => {
        await api.updatePushTokenPost({pushToken});
      })();
    });
  }, [isAnonymousUser]);

  const goToGuide = () => {
    navigation.navigate('Webview', {
      fixedTitle: '계단뿌셔클럽 앱 사용설명서',
      url: 'https://admin.staircrusher.club/public/guide',
      headerVariant: 'navigation',
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
  const handleBackPress = useCallback(() => {
    if (lastBackPressTime.current + 2000 >= Date.now()) {
      return false;
    } else {
      ToastUtils.show('뒤로가기 버튼을 한번 더 누르면 종료됩니다.');
      lastBackPressTime.current = Date.now();
      return true;
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        handleBackPress,
      );
      return () => {
        subscription.remove();
      };
    }, []),
  );

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle('light-content');
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor(color.brand);
      }
      return () => {
        StatusBar.setBarStyle('dark-content');
        if (Platform.OS === 'android') {
          StatusBar.setBackgroundColor('white');
        }
      };
    }, []),
  );

  const queryClient = useQueryClient();

  useEffect(() => {
    // 추천 키워드
    function prefetchListSearchPlacePresets() {
      queryClient.prefetchQuery({
        queryKey: ['ListSearchPlacePresets'],
        queryFn: async () =>
          (await api.listSearchPlacePresetsPost({}))?.data?.keywordPresets,
      });
    }

    // 주변 정복 상태
    async function prefetchNearbyAccessibilityStatus() {
      const currentPosition = await GeolocationUtils.getCurrentPosition();
      queryClient.prefetchQuery({
        queryKey: ['NearbyAccessibilityStatus'],
        queryFn: async () =>
          (
            await api.getNearbyAccessibilityStatusPost({
              currentLocation: {
                lat: currentPosition.coords.latitude,
                lng: currentPosition.coords.longitude,
              },
              distanceMetersLimit: 500,
            })
          )?.data?.conqueredCount ?? 0,
      });
    }

    prefetchListSearchPlacePresets();
    prefetchNearbyAccessibilityStatus();
  }, []);

  return (
    <>
      <ScreenLayout
        isHeaderVisible={false}
        safeAreaEdges={['top']}
        style={{backgroundColor: color.brand}}>
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
                <CoachMarkTarget
                  id="guide"
                  style={{
                    alignSelf: 'flex-start',
                  }}
                  renderItem={CoachMarkGuideLink}>
                  <SccTouchableOpacity
                    elementName="scc_description"
                    onPress={goToGuide}>
                    <S.Description allowFontScaling={false}>
                      {'계단뿌셔클럽 사용설명서'}
                    </S.Description>
                  </SccTouchableOpacity>
                </CoachMarkTarget>
              </S.TitleContainer>
              <S.MainImage source={require('@/assets/img/bg_scc_main.png')} />
              <SearchSection />
              <BannerSection />
            </S.ContentsContainer>
          </ScrollView>
          <GeolocationPermissionBottomSheet
            isVisible={geolocationErrorReason !== null}
            errorReason={geolocationErrorReason ?? 'permission_denied'}
            onCloseButtonPressed={() => {
              setGeolocationErrorReason(null);
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

      {/* <CoachMarkOverlay visible={geolocationErrorReason === null} /> */}
    </>
  );
};

export default HomeScreen;
