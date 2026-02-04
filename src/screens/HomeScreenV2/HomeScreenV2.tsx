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
  Linking,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import styled from 'styled-components/native';

import CrusherClubLogo from '@/assets/icon/logo.svg';
import {accessTokenAtom, isAnonymousUserAtom, useMe} from '@/atoms/Auth';
import {currentLocationAtom} from '@/atoms/Location';
import {hasShownGuideForFirstVisitAtom} from '@/atoms/User';
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

import AnnouncementSection from './sections/AnnouncementSection';
import FooterButtonsSection from './sections/FooterButtonsSection';
import MainBannerSection from './sections/MainBannerSection';
import QuickActionSection from './sections/QuickActionSection';
import RecommendedContentSection from './sections/RecommendedContentSection';
import SearchButtonSection from './sections/SearchButtonSection';
import StripBannerSection from './sections/StripBannerSection';

export interface HomeScreenV2Params {}

const HomeScreenV2 = ({navigation}: any) => {
  const {api} = useAppComponents();

  const accessToken = useAtomValue(accessTokenAtom);
  const setCurrentLocation = useSetAtom(currentLocationAtom);
  const [geolocationErrorReason, setGeolocationErrorReason] =
    useState<GeolocationErrorReason | null>(null);
  const [showAppUpgradeNeeded, setShowAppUpgradeNeeded] = useState(true);

  const _isForeground = useIsForeground();
  const {syncUserInfo} = useMe();

  // Fetch all home screen data in a single API call
  const {data: homeData} = useQuery({
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
      StatusBar.setBarStyle('dark-content');
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor(color.white);
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
        safeAreaEdges={['top']}
        style={{backgroundColor: color.white}}>
        <Header>
          <CrusherClubLogo />
        </Header>
        <Container>
          <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
            <SearchButtonSection />
            <MainBannerSection banners={homeData?.mainBanners ?? []} />
            <AnnouncementSection
              announcements={homeData?.announcements ?? []}
            />
            <QuickActionSection />
            <RecommendedContentSection
              contents={homeData?.recommendedContents ?? []}
            />
            <StripBannerSection banners={homeData?.stripBanners ?? []} />
            <FooterButtonsSection />
          </ScrollView>
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
        </Container>
      </ScreenLayout>
    </>
  );
};

export default HomeScreenV2;

const Header = styled.View`
  height: 48px;
  align-items: center;
  justify-content: center;
  background-color: ${color.white};
`;

const Container = styled.View`
  flex: 1;
  background-color: ${color.white};
`;
