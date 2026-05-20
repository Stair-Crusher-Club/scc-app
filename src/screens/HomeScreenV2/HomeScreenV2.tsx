import {
  AuthorizationStatus,
  getMessaging,
} from '@react-native-firebase/messaging';
import {useFocusEffect} from '@react-navigation/native';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import {useAtom, useAtomValue, useSetAtom} from 'jotai';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
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
import {
  accessTokenAtom,
  featureFlagAtom,
  isAnonymousUserAtom,
  useMe,
} from '@/atoms/Auth';
import {currentLocationAtom} from '@/atoms/Location';
import {
  dismissedHomePopupIdsAtom,
  hasShownHomeTutorialAtom,
  hasShownTutorialIntroPopupAtom,
} from '@/atoms/User';
import {ScreenLayout} from '@/components/ScreenLayout';
import {prefetchRemoteImage} from '@/components/SccRemoteImage';
import {color} from '@/constant/color';
import {
  GetClientVersionStatusResponseDtoStatusEnum,
  TutorialMissionTypeDto,
} from '@/generated-sources/openapi';
import useAppComponents from '@/hooks/useAppComponents';
import {useIsForeground} from '@/hooks/useIsForeground';
import {useUserTutorialProgress} from '@/hooks/useUserTutorialProgress';
import Logger from '@/logging/Logger';
import AppUpgradeNeededBottomSheet from '@/modals/AppUpgradeNeededBottomSheet';
import GeolocationPermissionBottomSheet, {
  GeolocationErrorReason,
} from '@/modals/GeolocationPermissionBottomSheet';
import GeolocationUtils from '@/utils/GeolocationUtils';
import ToastUtils from '@/utils/ToastUtils';

import {getDeferredDeepLinkUrl} from '@/deeplink/DeferredDeepLink';

import CategoryChipSection from './sections/CategoryChipSection';
import FooterButtonsSection from './sections/FooterButtonsSection';
import MainBannerSection from './sections/MainBannerSection';
import QuickMenuSection from './sections/QuickMenuSection';
import RecommendedContentSection from './sections/RecommendedContentSection';
import SearchButtonSection from './sections/SearchButtonSection';
import StripBannerSection from './sections/StripBannerSection';
import HomePopupModal from './components/HomePopupModal';
import TutorialIntroPopup from './components/TutorialIntroPopup';
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
  const featureFlags = useAtomValue(featureFlagAtom);
  const hasShownHomeTutorial = useAtomValue(hasShownHomeTutorialAtom);
  const setHasShownHomeTutorial = useSetAtom(hasShownHomeTutorialAtom);
  const [hasShownTutorialIntroPopup, setHasShownTutorialIntroPopup] = useAtom(
    hasShownTutorialIntroPopupAtom,
  );

  // 장소 검색 튜토리얼(TutorialOverlay): 마운트 시점부터 이미지 렌더(디코딩), 3초 후 표시 자격 부여.
  // 미가입자에게만 노출 (가입자에게는 TutorialIntroPopup으로 외출 튜토리얼 유도).
  // Deferred deep link가 있으면 이번에는 tutorial 스킵 (hasShownHomeTutorial은 세팅하지 않아 다음에 정상 노출).
  const [needsPlaceSearchTutorial] = useState(() => {
    if (getDeferredDeepLinkUrl()) {
      return false;
    }
    if (!isAnonymousUser) {
      return false;
    }
    return !hasShownHomeTutorial;
  });
  const [placeSearchTutorialReady, setPlaceSearchTutorialReady] =
    useState(false);

  // 윌리의 외출 NUX 튜토리얼 외출 유도 전면 팝업: 가입자 + 미노출 1회만 (1초 딜레이).
  // __DEV__: Figma 시각 검증용 강제 활성화 (사용 후 false로 되돌릴 것)
  const __DEV_FORCE_INTRO_POPUP__: boolean = false;
  const [tutorialIntroPopupReady, setTutorialIntroPopupReady] = useState(false);

  // 서버 progress 로 메인 미션 완료 여부 확인. 앱 삭제/재설치로 AsyncStorage
  // 기반 atom 이 리셋되어도 서버 진행 상태로 "이미 완료자" 인지 판단해 팝업 재노출을 막는다.
  const {data: tutorialProgress} = useUserTutorialProgress();
  const allMainTutorialMissionsCompleted = useMemo(() => {
    if (!tutorialProgress) {
      return undefined;
    }
    const mainTypes: TutorialMissionTypeDto[] = [
      TutorialMissionTypeDto.RegisterInterestedRegionsAndThemes,
      TutorialMissionTypeDto.SavePlaceList,
      TutorialMissionTypeDto.UpvoteAccessibility,
    ];
    return mainTypes.every(
      type =>
        tutorialProgress.missions.find(m => m.missionType === type)
          ?.completedAt != null,
    );
  }, [tutorialProgress]);

  // 메인 미션 모두 완료자 = NUX 인트로 팝업 노출 대상이 아니므로 atom 을 미리 마킹.
  // (앱 삭제/재설치 후 AsyncStorage 리셋 시 다시 노출되지 않도록.)
  useEffect(() => {
    if (
      allMainTutorialMissionsCompleted === true &&
      !hasShownTutorialIntroPopup
    ) {
      setHasShownTutorialIntroPopup(true);
    }
  }, [
    allMainTutorialMissionsCompleted,
    hasShownTutorialIntroPopup,
    setHasShownTutorialIntroPopup,
  ]);

  // 1초 후 TutorialIntroPopup 노출 자격 부여 (홈 데이터 로딩 후).
  // 자격 부여만 — 실제 노출 여부는 orchestrator 가 직렬화 + 다른 조건과 함께 판단.
  useEffect(() => {
    if (__DEV__ && __DEV_FORCE_INTRO_POPUP__) {
      const timer = setTimeout(() => setTutorialIntroPopupReady(true), 500);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => setTutorialIntroPopupReady(true), 1000);
    return () => clearTimeout(timer);
  }, [__DEV_FORCE_INTRO_POPUP__]);

  // 홈 팝업 상태 (어드민에서 등록한 전면 팝업).
  const [dismissedPopupIds, setDismissedPopupIds] = useAtom(
    dismissedHomePopupIdsAtom,
  );
  const activePopup = useMemo(() => {
    const popups = homeData?.homePopups ?? [];
    return popups.find(p => !dismissedPopupIds[p.id]) ?? null;
  }, [homeData?.homePopups, dismissedPopupIds]);

  useEffect(() => {
    if (activePopup) {
      prefetchRemoteImage(activePopup.imageUrl);
    }
  }, [activePopup?.imageUrl]);

  // 3초 후 TutorialOverlay 노출 자격 부여 + 탭바 숨김.
  useEffect(() => {
    if (!needsPlaceSearchTutorial) {
      return;
    }
    const timer = setTimeout(() => {
      setPlaceSearchTutorialReady(true);
      // 탭바 숨기기
      navigation.setOptions({
        tabBarStyle: {display: 'none' as const},
      });
    }, 3000);
    return () => clearTimeout(timer);
  }, [needsPlaceSearchTutorial, navigation]);

  const handlePlaceSearchTutorialClose = useCallback(() => {
    setHasShownHomeTutorial(true);
    // 탭바 복원
    navigation.setOptions({
      tabBarStyle: undefined,
    });
  }, [navigation, setHasShownHomeTutorial]);

  // === 홈 화면 오버레이 직렬화 (orchestrator) ===
  // 한 번에 하나의 오버레이만 노출. closedOverlayIds 는 현재 세션에서 닫힘 추적.
  // 각 오버레이의 isEligible 안에 atom 영구 dismiss 등 모든 노출 조건을 인라인.
  // A 가 isEligible=false 면 find 는 자동으로 B 로 넘어간다 — "A 를 거쳐야 B" 종속 없음.
  // 새 오버레이 추가 시 overlays 배열에 {id, isEligible, render} 한 항목 추가하면 끝.
  const [closedOverlayIds, setClosedOverlayIds] = useState<Set<string>>(
    new Set(),
  );

  type HomeOverlay = {
    id: string;
    isEligible: boolean;
    render: (onClose: () => void) => React.ReactNode;
  };

  const overlays: HomeOverlay[] = [
    {
      id: 'place-search-tutorial',
      isEligible:
        needsPlaceSearchTutorial &&
        placeSearchTutorialReady &&
        !hasShownHomeTutorial,
      render: onClose => (
        <TutorialOverlay
          visible={true}
          onClose={() => {
            handlePlaceSearchTutorialClose();
            onClose();
          }}
        />
      ),
    },
    {
      id: 'tutorial-intro',
      isEligible:
        (__DEV__ && __DEV_FORCE_INTRO_POPUP__ && tutorialIntroPopupReady) ||
        (!isAnonymousUser &&
          !!featureFlags?.enabledFlags.has('USER_TUTORIAL') &&
          !hasShownTutorialIntroPopup &&
          !getDeferredDeepLinkUrl() &&
          allMainTutorialMissionsCompleted === false &&
          tutorialIntroPopupReady),
      render: onClose => (
        <TutorialIntroPopup
          isVisible={true}
          onClose={() => {
            setHasShownTutorialIntroPopup(true);
            onClose();
          }}
        />
      ),
    },
    {
      id: 'admin-home-popup',
      isEligible: activePopup != null,
      render: onClose => (
        <HomePopupModal
          popup={activePopup!}
          visible={true}
          onClose={onClose}
          onImageClick={() => {
            if (activePopup!.clickUrl) {
              Linking.openURL(activePopup!.clickUrl).catch(() => {});
            }
            onClose();
          }}
          onDismissPermanently={() => {
            setDismissedPopupIds(prev => ({
              ...prev,
              [activePopup!.id]: true,
            }));
            onClose();
          }}
        />
      ),
    },
  ];

  const activeOverlay = overlays.find(
    o => o.isEligible && !closedOverlayIds.has(o.id),
  );

  const handleActiveOverlayClose = useCallback(() => {
    if (!activeOverlay) return;
    setClosedOverlayIds(prev => {
      const next = new Set(prev);
      next.add(activeOverlay.id);
      return next;
    });
  }, [activeOverlay]);

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
        </Container>
      </ScreenLayout>
      {/*
        오버레이는 한 번에 하나만 노출. orchestrator 가 우선순위 순으로 첫 번째 isEligible
        오버레이를 렌더. 닫히면 다음 후보로 자동 진행.
      */}
      {activeOverlay?.render(handleActiveOverlayClose)}
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
