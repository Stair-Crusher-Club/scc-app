import {
  AuthorizationStatus,
  getMessaging,
} from '@react-native-firebase/messaging';
import {useFocusEffect} from '@react-navigation/native';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import {useAtomValue, useSetAtom} from 'jotai';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  BackHandler,
  Dimensions,
  Image,
  Linking,
  NativeScrollEvent,
  NativeSyntheticEvent,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import DeviceInfo from 'react-native-device-info';
import styled from 'styled-components/native';

import CrusherClubLogo from '@/assets/icon/logo.svg';
import {accessTokenAtom, isAnonymousUserAtom, useMe} from '@/atoms/Auth';
import {currentLocationAtom} from '@/atoms/Location';
import {hasShownHomeTutorialAtom} from '@/atoms/User';
import {ScreenLayout} from '@/components/ScreenLayout';
import {color} from '@/constant/color';
import {GetClientVersionStatusResponseDtoStatusEnum} from '@/generated-sources/openapi';
import useAppComponents from '@/hooks/useAppComponents';
import {useIsForeground} from '@/hooks/useIsForeground';
import Logger from '@/logging/Logger';
import AppUpgradeNeededBottomSheet from '@/modals/AppUpgradeNeededBottomSheet';
import GeolocationPermissionBottomSheet, {
  GeolocationErrorReason,
} from '@/modals/GeolocationPermissionBottomSheet';
import GeolocationUtils from '@/utils/GeolocationUtils';
import ToastUtils from '@/utils/ToastUtils';

import CategoryChipSection from './sections/CategoryChipSection';
import FooterButtonsSection from './sections/FooterButtonsSection';
import MainBannerSection from './sections/MainBannerSection';
import QuickMenuSection from './sections/QuickMenuSection';
import RecommendedContentSection from './sections/RecommendedContentSection';
import SearchButtonSection from './sections/SearchButtonSection';
import StripBannerSection from './sections/StripBannerSection';
import TutorialOverlay from './components/TutorialOverlay';

export interface HomeScreenV2Params {}

const SCREEN_WIDTH = Dimensions.get('window').width;
const BG_ASPECT_RATIO = 1170 / 987; // original image aspect ratio
const BG_HEIGHT = SCREEN_WIDTH / BG_ASPECT_RATIO;

const HomeScreenV2 = ({navigation}: any) => {
  const {api} = useAppComponents();
  const insets = useSafeAreaInsets();

  const accessToken = useAtomValue(accessTokenAtom);
  const setCurrentLocation = useSetAtom(currentLocationAtom);
  const [geolocationErrorReason, setGeolocationErrorReason] =
    useState<GeolocationErrorReason | null>(null);
  const [showAppUpgradeNeeded, setShowAppUpgradeNeeded] = useState(true);

  const _isForeground = useIsForeground();
  const {syncUserInfo} = useMe();

  // Fetch all home screen data in a single API call
  const {data: homeData, isLoading: isHomeDataLoading} = useQuery({
    queryKey: ['HomeScreenData'],
    queryFn: async () => {
      const result = (await api.getHomeScreenData()).data;
      return result;
    },
  });

  const {data: versionData} = useQuery({
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

  const versionStatusMessage = versionData?.message;
  const versionStatus = versionData?.status;
  const isAnonymousUser = useAtomValue(isAnonymousUserAtom);
  const hasShownHomeTutorial = useAtomValue(hasShownHomeTutorialAtom);
  const setHasShownHomeTutorial = useSetAtom(hasShownHomeTutorialAtom);

  // 튜토리얼: 이미지를 마운트 시점부터 렌더(디코딩)하고, 1.5초 후 visible로 전환
  const needsTutorial = !hasShownHomeTutorial;
  const [tutorialVisible, setTutorialVisible] = useState(false);

  useEffect(() => {
    if (!needsTutorial) {
      return;
    }
    const timer = setTimeout(() => {
      setTutorialVisible(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, [needsTutorial]);

  useEffect(() => {
    const requestGeolocationPermissionIfNeeded = async () => {
      try {
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
          setGeolocationErrorReason('permission_denied');
        } else if (error.code === 2) {
          setGeolocationErrorReason('location_unavailable');
        }
      }
    };
    requestGeolocationPermissionIfNeeded();
  }, [navigation, accessToken, syncUserInfo]);

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
        StatusBar.setBackgroundColor('transparent');
        StatusBar.setTranslucent(true);
      }
      return () => {
        StatusBar.setBarStyle('dark-content');
        if (Platform.OS === 'android') {
          StatusBar.setBackgroundColor(color.gray15);
          StatusBar.setTranslucent(false);
        }
      };
    }, []),
  );

  const [isScrollEnabled, setIsScrollEnabled] = useState(true);
  const handleBannerPanStateChange = useCallback((isPanning: boolean) => {
    setIsScrollEnabled(!isPanning);
  }, []);

  // WhiteCard가 safe area 상단에 닿으면 흰색 오버레이 표시
  const [showSafeAreaOverlay, setShowSafeAreaOverlay] = useState(false);
  const whiteCardYRef = useRef(0);

  const handleWhiteCardLayout = useCallback((e: any) => {
    whiteCardYRef.current = e.nativeEvent.layout.y;
  }, []);

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const scrollY = e.nativeEvent.contentOffset.y;
      // WhiteCard 상단이 safe area 아래로 들어오는 시점
      const threshold = whiteCardYRef.current - insets.top;
      const shouldShow = scrollY >= threshold;
      setShowSafeAreaOverlay(shouldShow);
      StatusBar.setBarStyle(shouldShow ? 'dark-content' : 'light-content');
    },
    [insets.top],
  );

  const queryClient = useQueryClient();

  useEffect(() => {
    // Prefetch search presets
    function prefetchListSearchPlacePresets() {
      queryClient.prefetchQuery({
        queryKey: ['ListSearchPlacePresets'],
        queryFn: async () =>
          (await api.listSearchPlacePresetsPost({}))?.data?.keywordPresets,
      });
    }

    // Prefetch nearby accessibility status
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
        style={{backgroundColor: color.white}}>
        <Container>
          <BackgroundImage
            source={require('@/assets/img/home_screen_bg.png')}
          />
          <ScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            scrollEnabled={isScrollEnabled}
            onScroll={handleScroll}
            scrollEventThrottle={16}>
            <InnerContainer style={{paddingTop: insets.top}}>
              <LogoContainer>
                <CrusherClubLogo />
              </LogoContainer>
              <SearchButtonSection />
              <CategoryChipSection />
            </InnerContainer>
            <WhiteCard onLayout={handleWhiteCardLayout}>
              <QuickMenuSection
                announcements={homeData?.announcements ?? []}
                isLoading={isHomeDataLoading}
              />
              <MainBannerSection
                banners={homeData?.mainBanners ?? []}
                onPanStateChange={handleBannerPanStateChange}
                isLoading={isHomeDataLoading}
              />
              <RecommendedContentSection
                contents={homeData?.recommendedContents ?? []}
                isLoading={isHomeDataLoading}
              />
              <StripBannerSection
                banners={homeData?.stripBanners ?? []}
                onPanStateChange={handleBannerPanStateChange}
                isLoading={isHomeDataLoading}
              />
            </WhiteCard>
            <FooterButtonsSection isLoading={isHomeDataLoading} />
          </ScrollView>
          {showSafeAreaOverlay && (
            <SafeAreaOverlay style={{height: insets.top}} />
          )}
          <GeolocationPermissionBottomSheet
            isVisible={geolocationErrorReason !== null}
            errorReason={geolocationErrorReason ?? 'permission_denied'}
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
          {/* 튜토리얼: 마운트 시점부터 이미지 렌더(디코딩), zIndex로 표시/숨김 제어 */}
          {needsTutorial && (
            <TutorialOverlay
              visible={tutorialVisible}
              onClose={() => {
                setTutorialVisible(false);
                setHasShownHomeTutorial(true);
              }}
            />
          )}
        </Container>
      </ScreenLayout>
    </>
  );
};

export default HomeScreenV2;

const Container = styled.View`
  flex: 1;
  background-color: ${color.gray15};
`;

const LogoContainer = styled.View`
  align-items: center;
  justify-content: center;
  padding-top: 32px;
  padding-bottom: 28px;
  margin-bottom: 4px;
`;

const BackgroundImage = styled(Image)`
  position: absolute;
  top: 0;
  left: 0;
  width: ${SCREEN_WIDTH}px;
  height: ${BG_HEIGHT}px;
`;

const SafeAreaOverlay = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background-color: ${color.white};
`;

const InnerContainer = styled.View``;

const WhiteCard = styled.View`
  background-color: ${color.white};
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  shadow-color: #000;
  shadow-offset: 0px -4px;
  shadow-opacity: 0.12;
  shadow-radius: 16px;
  elevation: 8;
  margin-top: 25px;
  padding-bottom: 40px;
`;
