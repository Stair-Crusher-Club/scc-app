import {useQuery} from '@tanstack/react-query';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Animated,
  InteractionManager,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  View,
} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import Toast from 'react-native-root-toast';
import styled from 'styled-components/native';

import {currentLocationAtom} from '@/atoms/Location';
import V2TabBar from './components/V2TabBar';
import {ScreenLayout} from '@/components/ScreenLayout';
import {color} from '@/constant/color';
import {
  Building,
  Place,
  PlaceDoorDirectionTypeDto,
  ReportAccessibilityPostRequest,
  ReportTargetTypeDto,
  UpvoteTargetTypeDto,
} from '@/generated-sources/openapi';
import useAppComponents from '@/hooks/useAppComponents';
import useNavigateWithLocationCheck from '@/hooks/useNavigateWithLocationCheck';
import usePost from '@/hooks/usePost';
import {useToggleAccessibilityInfoRequest} from '@/hooks/useToggleAccessibilityInfoRequest';
import {useToggleFavoritePlace} from '@/hooks/useToggleFavoritePlace';
import {useUpvoteToggle} from '@/hooks/useUpvoteToggle';
import {LogParamsProvider} from '@/logging/LogParamsProvider';
import {ScreenProps} from '@/navigation/Navigation.screens';
import {useLogger} from '@/logging/useLogger';
import ShareUtils from '@/utils/ShareUtils';
import {useCheckAuth} from '@/utils/checkAuth';
import {distanceInMeter} from '@/utils/DistanceUtils';

import ToastUtils from '@/utils/ToastUtils';
import {useIsFocused} from '@react-navigation/native';
import {useAtomValue} from 'jotai';
import {BuildingRegistrationEvent} from './constants';
import V2AppBar from './components/V2AppBar';
import V2SummarySection from './components/V2SummarySection';
import BuildingRegistrationBottomSheet from './modals/BuildingRegistrationBottomSheet';
import {visibleAtom} from '../SearchScreen/atoms/quest';
import QuestCompletionModal from '../SearchScreen/components/QuestCompletionModal';
import NavigationAppsBottomSheet from '../PlaceDetailScreen/modals/NavigationAppsBottomSheet';
import PlaceDetailNegativeFeedbackBottomSheet from '../PlaceDetailScreen/modals/PlaceDetailNegativeFeedbackBottomSheet';
import RequireBuildingAccessibilityBottomSheet from '../PlaceDetailScreen/modals/RequireBuildingAccessibilityBottomSheet';
import {PlaceDetailFeedbackSection} from '../PlaceDetailScreen/sections/PlaceDetailFeedbackSection';
import V2HomeTab from './tabs/V2HomeTab';
import V2AccessibilityTab, {
  getAccessibilityChips,
} from './tabs/V2AccessibilityTab';
import V2ChipBar from './components/V2ChipBar';
import V2ReviewTab from './tabs/V2ReviewTab';
import V2RestroomTab from './tabs/V2RestroomTab';
import V2ConquerorTab from './tabs/V2ConquerorTab';
import V2BottomBar from './components/V2BottomBar';
import V2ThumbnailRow from './components/V2ThumbnailRow';
import PlaceDetailRegistrationSheet from './components/PlaceDetailRegistrationSheet';

export interface PlaceDetailV2ScreenParams {
  placeInfo:
    | {placeId: string}
    | {
        place: Place;
        building: Building;
        isAccessibilityRegistrable?: boolean;
        accessibilityScore?: number;
      };
  event?: 'submit-place' | 'submit-building' | BuildingRegistrationEvent;
  autoOpenImageViewer?: boolean;
  autoOpenImageIndex?: number;
}

type TabType = 'home' | 'accessibility' | 'review' | 'restroom' | 'conqueror';

const TAB_ITEMS: {value: TabType; label: string}[] = [
  {value: 'home', label: '홈'},
  {value: 'accessibility', label: '접근성'},
  {value: 'review', label: '리뷰'},
  {value: 'restroom', label: '화장실'},
  {value: 'conqueror', label: '정복자'},
];

export default function PlaceDetailV2Screen({
  route,
  navigation,
}: ScreenProps<'PlaceDetailV2'>) {
  const {
    event,
    placeInfo,
    autoOpenImageViewer,
    autoOpenImageIndex = 0,
  } = route.params;
  const checkAuth = useCheckAuth();
  const {api} = useAppComponents();
  const {navigateWithLocationCheck, LocationConfirmModal} =
    useNavigateWithLocationCheck();
  const toggleFavorite = useToggleFavoritePlace();
  const toggleRequest = useToggleAccessibilityInfoRequest();

  const reportAccessibilityMutation = usePost<ReportAccessibilityPostRequest>(
    ['PlaceDetailV2', 'ReportAccessibility'],
    async params => {
      await api.reportAccessibilityPost(params);
      ToastUtils.show('신고가 접수되었습니다.');
    },
  );

  const isFocused = useIsFocused();

  const questModalVisible = useAtomValue(visibleAtom);
  const [pendingBottomSheet, setPendingBottomSheet] = useState<
    null | 'requireBuilding' | BuildingRegistrationEvent
  >(null);

  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [showRegistrationSheet, setShowRegistrationSheet] = useState(false);
  const [scrollViewHeight, setScrollViewHeight] = useState(0);
  const [stickyHeaderHeight, setStickyHeaderHeight] = useState(0);

  const openBottomSheet = useCallback(
    (which: 'requireBuilding' | BuildingRegistrationEvent) => {
      if (which === 'requireBuilding') {
        if (
          event &&
          (event === 'registration-force' || event === 'registration-suggest')
        ) {
          setShowBuildingRegistrationBottomSheet(true);
        } else {
          setShowRequireBuildingAccessibilityBottomSheet(true);
        }
      }
    },
    [event],
  );

  const placeId =
    'placeId' in placeInfo ? placeInfo.placeId : placeInfo.place.id;
  const buildingId =
    'building' in placeInfo ? placeInfo.building.id : undefined;

  const logParams = {
    place_id: placeId,
    building_id: buildingId,
    current_tab: currentTab,
  };
  const logger = useLogger(logParams);
  const loggerRef = useRef(logger);
  loggerRef.current = logger;

  const [
    showRequireBuildingAccessibilityBottomSheet,
    setShowRequireBuildingAccessibilityBottomSheet,
  ] = useState(false);
  const [
    showBuildingRegistrationBottomSheet,
    setShowBuildingRegistrationBottomSheet,
  ] = useState(false);
  const [showNavigationBottomSheet, setShowNavigationBottomSheet] =
    useState(false);

  const {data, isError: isPlaceError} = useQuery({
    initialData: {
      place: 'place' in placeInfo ? placeInfo.place : undefined,
      building: 'building' in placeInfo ? placeInfo.building : undefined,
      isAccessibilityRegistrable:
        'isAccessibilityRegistrable' in placeInfo
          ? placeInfo.isAccessibilityRegistrable
          : undefined,
      accessibilityScore:
        'accessibilityScore' in placeInfo
          ? placeInfo.accessibilityScore
          : undefined,
      kakaoPlaceId: undefined as string | undefined,
    },
    queryKey: ['PlaceDetailV2', placeId],
    queryFn: async ({queryKey}) => {
      const result = await api.getPlaceWithBuildingPost({placeId: queryKey[1]});
      const kakaoVendor = result.data.vendorPlaceIds?.find(
        v => v.vendorType === 'KAKAO',
      );
      return {
        place: result.data.place,
        building: result.data.building,
        isAccessibilityRegistrable: result.data.isAccessibilityRegistrable,
        accessibilityScore: result.data.accessibilityInfo?.accessibilityScore,
        kakaoPlaceId: kakaoVendor?.vendorPlaceId,
      };
    },
  });
  const place = data?.place;
  const building = data?.building;
  const kakaoPlaceId = data?.kakaoPlaceId;

  const currentLocation = useAtomValue(currentLocationAtom);
  const distanceToPlace = useMemo(() => {
    if (!currentLocation || !place?.location) {
      return undefined;
    }
    return distanceInMeter(currentLocation, {
      latitude: place.location.lat,
      longitude: place.location.lng,
    });
  }, [currentLocation, place?.location]);

  const {
    data: accessibilityPost,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ['PlaceDetailV2', placeId, 'Accessibility'],
    queryFn: async ({queryKey}) =>
      (await api.getAccessibilityV2Post({placeId: queryKey[1]})).data,
  });
  const {data: reviewPost} = useQuery({
    queryKey: ['PlaceDetailV2', placeId, UpvoteTargetTypeDto.PlaceReview],
    queryFn: async ({queryKey}) =>
      (await api.listPlaceReviewsPost({placeId: queryKey[1]})).data,
  });
  const {data: toiletPost} = useQuery({
    queryKey: ['PlaceDetailV2', placeId, UpvoteTargetTypeDto.ToiletReview],
    queryFn: async ({queryKey}) =>
      (await api.listToiletReviewsPost({placeId: queryKey[1]})).data,
  });

  // Upvote state lifted from V2SummarySection & V2BottomBar so both stay in sync
  const placeUpvoteInfo = accessibilityPost?.placeUpvoteInfo;
  const {isUpvoted, totalUpvoteCount, toggleUpvote} = useUpvoteToggle({
    initialIsUpvoted: placeUpvoteInfo?.isUpvoted ?? false,
    initialTotalCount: placeUpvoteInfo?.totalUpvoteCount,
    targetId: placeId,
    targetType: 'PLACE',
    placeId: placeId,
  });

  const handleUpvote = useCallback(() => {
    if (Platform.OS === 'web') {
      Toast.show('준비 중입니다 💪', {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM,
      });
      return;
    }
    checkAuth(() => toggleUpvote());
  }, [checkAuth, toggleUpvote]);

  // API 에러 시 토스트 + goBack
  useEffect(() => {
    if (isPlaceError) {
      ToastUtils.show('장소 정보를 불러올 수 없습니다.');
      navigation.goBack();
    }
  }, [isPlaceError, navigation]);

  // 카드뷰 이미지 클릭 시 자동으로 이미지 뷰어 열기
  const hasAutoOpenedImageViewer = useRef(false);
  useEffect(() => {
    if (
      autoOpenImageViewer &&
      accessibilityPost &&
      !hasAutoOpenedImageViewer.current
    ) {
      hasAutoOpenedImageViewer.current = true;
      const placeImages = (
        accessibilityPost.placeAccessibility?.images ?? []
      ).map(img => ({type: '장소 입구', url: img.imageUrl}));
      const buildingImages = (
        accessibilityPost.buildingAccessibility?.entranceImages ?? []
      ).map(img => ({type: '건물 입구', url: img.imageUrl}));
      const elevatorImages = (
        accessibilityPost.buildingAccessibility?.elevatorImages ?? []
      ).map(img => ({type: '엘리베이터', url: img.imageUrl}));
      const allImages = [...placeImages, ...buildingImages, ...elevatorImages];
      if (allImages.length > 0) {
        navigation.navigate('ImageZoomViewer', {
          imageUrls: allImages.map(img => img.url),
          index: autoOpenImageIndex,
          types: allImages.map(img => img.type),
        });
      }
    }
  }, [autoOpenImageViewer, accessibilityPost, navigation]);

  // 네비게이션 블러 시 안전장치: 보류/열림 전부 닫기
  useEffect(() => {
    const unsub = navigation.addListener('blur', () => {
      setPendingBottomSheet(null);
      setShowRequireBuildingAccessibilityBottomSheet(false);
    });
    return unsub;
  }, [navigation]);

  useEffect(() => {
    // 등록된 정보 확인 후에 띄워주기
    if (!accessibilityPost) return;

    const isOutsideDoor =
      accessibilityPost?.placeAccessibility?.doorDirectionType ===
      PlaceDoorDirectionTypeDto.OutsideBuilding;

    // 어떤 바텀시트를 열지 결정
    let toOpen: null | 'requireBuilding' | BuildingRegistrationEvent = null;

    if (
      event === 'submit-place' ||
      event === 'registration-suggest' ||
      event === 'registration-force'
    ) {
      if (!accessibilityPost.buildingAccessibility && !isOutsideDoor) {
        toOpen = 'requireBuilding';
      }
    }
    if (!toOpen) return;

    // 퀘스트 모달 떠 있으면 보류, 아니면 즉시 열기
    if (questModalVisible) {
      setPendingBottomSheet(toOpen);
    } else {
      openBottomSheet(toOpen);
    }
  }, [accessibilityPost, event, questModalVisible, openBottomSheet]);

  // 퀘스트 모달이 닫힌 뒤, 전환/애니메이션까지 끝난 다음 & 이 화면이 포커스일 때만 보류된 바텀시트 열기
  useEffect(() => {
    if (!questModalVisible && pendingBottomSheet) {
      const task = InteractionManager.runAfterInteractions(() => {
        if (isFocused) {
          openBottomSheet(pendingBottomSheet);
          setPendingBottomSheet(null);
        }
      });
      return () => task.cancel();
    }
  }, [questModalVisible, pendingBottomSheet, isFocused, openBottomSheet]);

  const closeModals = useCallback(() => {
    setShowRequireBuildingAccessibilityBottomSheet(false);
    setShowBuildingRegistrationBottomSheet(false);
    setPendingBottomSheet(null);
    navigation.setParams({event: undefined});
  }, [navigation]);

  const onNavigateToOtherPage = useCallback(() => {
    navigation.setParams({event: undefined});
    setPendingBottomSheet(null);
  }, [navigation]);

  const goToBuildingForm = useCallback(async () => {
    closeModals();
    if (place && building) {
      await navigateWithLocationCheck({
        targetLocation: building.location,
        address: building.address,
        type: 'building',
        onNavigate: () => {
          navigation.navigate('BuildingFormV2', {place, building});
        },
      });
    }
  }, [building, closeModals, navigation, navigateWithLocationCheck, place]);

  const handleBuildingRegistrationConfirm = useCallback(() => {
    handleBuildingRegistrationCancel();
    if (place && building) {
      navigation.navigate('BuildingFormV2', {place, building});
    }
  }, [building, navigation, place]);

  const handleBuildingRegistrationCancel = useCallback(() => {
    setShowBuildingRegistrationBottomSheet(false);
    navigation.setParams({event: undefined});
  }, [navigation]);

  const [reportTargetType, setReportTargetType] =
    useState<ReportTargetTypeDto | null>(null);

  const showNegativeFeedbackBottomSheet = (type: ReportTargetTypeDto) => {
    checkAuth(() => {
      setReportTargetType(type);
    });
  };

  // 정보 등록 핸들러들
  const handlePlaceRegister = useCallback(() => {
    checkAuth(async () => {
      if (Platform.OS === 'web') {
        Toast.show('준비 중입니다 💪', {
          duration: Toast.durations.SHORT,
          position: Toast.positions.BOTTOM,
        });
        return;
      }
      if (!place) return;
      await navigateWithLocationCheck({
        targetLocation: place.location,
        placeName: place.name,
        address: place.address,
        type: 'place',
        onNavigate: () => {
          navigation.navigate('PlaceFormV2', {place, building: building!});
        },
      });
    });
  }, [building, checkAuth, navigation, navigateWithLocationCheck, place]);

  const handleBuildingRegister = useCallback(() => {
    checkAuth(async () => {
      if (Platform.OS === 'web') {
        Toast.show('준비 중입니다 💪', {
          duration: Toast.durations.SHORT,
          position: Toast.positions.BOTTOM,
        });
        return;
      }
      if (!place || !building) return;
      await navigateWithLocationCheck({
        targetLocation: building.location,
        address: building.address,
        type: 'building',
        onNavigate: () => {
          navigation.navigate('BuildingFormV2', {place, building});
        },
      });
    });
  }, [building, checkAuth, navigation, navigateWithLocationCheck, place]);

  const handleReviewRegister = useCallback(() => {
    checkAuth(async () => {
      if (Platform.OS === 'web') {
        Toast.show('준비 중입니다 💪', {
          duration: Toast.durations.SHORT,
          position: Toast.positions.BOTTOM,
        });
        return;
      }
      if (!place) return;
      await navigateWithLocationCheck({
        targetLocation: place.location,
        placeName: place.name,
        address: place.address,
        type: 'place',
        onNavigate: () => {
          navigation.navigate('ReviewForm/Place', {
            placeId: place.id,
          });
        },
      });
    });
  }, [checkAuth, navigation, navigateWithLocationCheck, place]);

  const handleAddPlaceComment = useCallback(() => {
    checkAuth(() => {
      if (!place) return;
      navigation.navigate('AddComment', {type: 'place', placeId: place.id});
    });
  }, [checkAuth, navigation, place]);

  const handleAddBuildingComment = useCallback(() => {
    checkAuth(() => {
      if (!place || !building) return;
      navigation.navigate('AddComment', {
        type: 'building',
        placeId: place.id,
        buildingId: building.id,
      });
    });
  }, [building, checkAuth, navigation, place]);

  const handleToiletRegister = useCallback(() => {
    checkAuth(async () => {
      if (Platform.OS === 'web') {
        Toast.show('준비 중입니다 💪', {
          duration: Toast.durations.SHORT,
          position: Toast.positions.BOTTOM,
        });
        return;
      }
      if (!place) return;
      await navigateWithLocationCheck({
        targetLocation: place.location,
        placeName: place.name,
        address: place.address,
        type: 'place',
        onNavigate: () => {
          navigation.navigate('ReviewForm/Toilet', {
            placeId: place.id,
          });
        },
      });
    });
  }, [checkAuth, navigation, navigateWithLocationCheck, place]);

  // Scroll-dependent AppBar title
  const [showAppBarTitle, setShowAppBarTitle] = useState(false);
  const nameBottomYRef = useRef<number>(0);

  // Issue 3: Bottom bar visibility (scroll-triggered)
  const [showBottomBar, setShowBottomBar] = useState(false);
  const actionButtonsTopYRef = useRef<number>(0);
  const actionButtonsBottomYRef = useRef<number>(0);
  const bottomBarAnim = useRef(new Animated.Value(0)).current;

  // Issue 4: Tab bar Y position for scroll preservation
  const tabBarYRef = useRef<number>(0);

  // Issue 5: Current scroll position tracking
  const currentScrollYRef = useRef(0);

  // Chip bar state (accessibility tab)
  const scrollViewRef = useRef<ScrollView>(null);
  const [activeChipIndex, setActiveChipIndex] = useState(0);
  const sectionLayoutsRef = useRef<Record<string, number>>({});
  const loggedSectionsRef = useRef(new Set<string>());
  const tabContentYRef = useRef(0);
  const isScrollingFromChipRef = useRef(false);
  const chips = useMemo(
    () => getAccessibilityChips(accessibilityPost),
    [accessibilityPost],
  );
  const showChipBar = currentTab === 'accessibility' && chips.length > 0;

  const handleSectionLayout = useCallback((chipName: string, y: number) => {
    sectionLayoutsRef.current[chipName] = y;
  }, []);

  const handleChipPress = useCallback(
    (index: number) => {
      setActiveChipIndex(index);
      isScrollingFromChipRef.current = true;
      const chipName = chips[index];
      const sectionY = sectionLayoutsRef.current[chipName] ?? 0;
      const stickyHeight = stickyHeaderHeight || 91;
      const targetY = tabContentYRef.current + sectionY - stickyHeight;
      scrollViewRef.current?.scrollTo({
        y: Math.max(0, targetY),
        animated: true,
      });
      setTimeout(() => {
        isScrollingFromChipRef.current = false;
      }, 500);
    },
    [chips, stickyHeaderHeight],
  );

  const handleNameLayout = useCallback((e: LayoutChangeEvent) => {
    const {y, height} = e.nativeEvent.layout;
    nameBottomYRef.current = y + height;
  }, []);

  // Issue 3: Track action buttons position for bottom bar trigger
  const handleActionButtonsLayout = useCallback((e: LayoutChangeEvent) => {
    const {y, height} = e.nativeEvent.layout;
    actionButtonsTopYRef.current = y;
    actionButtonsBottomYRef.current = y + height;
  }, []);

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const scrollY = e.nativeEvent.contentOffset.y;
      currentScrollYRef.current = scrollY;

      const shouldShow = scrollY > nameBottomYRef.current;
      setShowAppBarTitle(prev => (prev !== shouldShow ? shouldShow : prev));

      // Bottom bar proportional animation
      const topY = actionButtonsTopYRef.current;
      const bottomY = actionButtonsBottomYRef.current;
      const height = bottomY - topY;
      if (height > 0) {
        const hidden = Math.max(0, Math.min(scrollY - topY, height));
        bottomBarAnim.setValue(hidden / height);
      }
      const shouldShowBar = scrollY > topY;
      setShowBottomBar(prev => (prev !== shouldShowBar ? shouldShowBar : prev));

      // Active chip tracking for accessibility tab (skip during programmatic scroll)
      if (showChipBar && chips.length > 0 && !isScrollingFromChipRef.current) {
        const stickyHeight = stickyHeaderHeight || 91;
        const adjustedY = scrollY + stickyHeight;
        let newIndex = 0;
        for (let i = chips.length - 1; i >= 0; i--) {
          const sectionAbsY =
            tabContentYRef.current + (sectionLayoutsRef.current[chips[i]] ?? 0);
          if (adjustedY >= sectionAbsY) {
            newIndex = i;
            break;
          }
        }
        setActiveChipIndex(prev => (prev !== newIndex ? newIndex : prev));
      }

      // Section viewport detection for element_view (accessibility tab only)
      if (showChipBar) {
        const viewportHeight = e.nativeEvent.layoutMeasurement.height;
        Object.entries(sectionLayoutsRef.current).forEach(
          ([sectionName, sectionY]) => {
            const absoluteY = tabContentYRef.current + sectionY;
            if (
              !loggedSectionsRef.current.has(sectionName) &&
              absoluteY < scrollY + viewportHeight &&
              absoluteY + 200 > scrollY
            ) {
              loggedSectionsRef.current.add(sectionName);
              loggerRef.current.logElementView(`pdp_v2_section_${sectionName}`);
            }
          },
        );
      }
    },
    [showChipBar, chips, stickyHeaderHeight, placeId],
  );

  // Issue 5: Tab change with scroll adjustment
  const handleTabChange = useCallback(
    (newTab: TabType) => {
      setCurrentTab(newTab);
      setActiveChipIndex(0);

      loggerRef.current.logElementView(`pdp_v2_${newTab}_tab`, {
        current_tab: newTab, // setCurrentTab 전이라 localParams의 값은 이전 탭
      });

      // 탭바가 sticky된 상태(스크롤이 요약 섹션 하단 이후)이면
      // 탭바 상단으로 스크롤 리셋 (chip bar 높이 차이 보정)
      if (currentScrollYRef.current > tabBarYRef.current) {
        requestAnimationFrame(() => {
          scrollViewRef.current?.scrollTo({
            y: tabBarYRef.current,
            animated: false,
          });
        });
      }
    },
    [placeId],
  );

  if (isLoading || !place || !building) {
    return null;
  }

  const renderTabContent = () => {
    switch (currentTab) {
      case 'home':
        return (
          <V2HomeTab
            accessibility={accessibilityPost}
            place={place}
            building={building}
            reviews={reviewPost ?? []}
            toiletReviews={toiletPost ?? []}
            kakaoPlaceId={kakaoPlaceId}
            isAccessibilityInfoRequested={
              accessibilityPost?.isAccessibilityInfoRequested
            }
            isAccessibilityRegistrable={data?.isAccessibilityRegistrable}
            onRequestInfo={() => {
              checkAuth(() => {
                toggleRequest({
                  currentIsRequested:
                    accessibilityPost?.isAccessibilityInfoRequested,
                  placeId: place.id,
                });
              });
            }}
            onPressAccessibilityTab={() => setCurrentTab('accessibility')}
            onPressReviewTab={() => setCurrentTab('review')}
            onPressDirections={() => setShowNavigationBottomSheet(true)}
            onPressPlaceRegister={handlePlaceRegister}
            onPressBuildingRegister={handleBuildingRegister}
            onPressReviewRegister={handleReviewRegister}
            onPressToiletRegister={handleToiletRegister}
          />
        );
      case 'accessibility':
        return (
          <V2AccessibilityTab
            accessibility={accessibilityPost}
            place={place}
            building={building}
            isAccessibilityRegistrable={data?.isAccessibilityRegistrable}
            reviews={reviewPost ?? []}
            onRegister={handlePlaceRegister}
            onBuildingRegister={handleBuildingRegister}
            onAddPlaceComment={handleAddPlaceComment}
            onAddBuildingComment={handleAddBuildingComment}
            showNegativeFeedbackBottomSheet={showNegativeFeedbackBottomSheet}
            allowDuplicateRegistration
            onSectionLayout={handleSectionLayout}
          />
        );
      case 'review':
        return (
          <V2ReviewTab
            reviews={reviewPost ?? []}
            place={place}
            isAccessibilityRegistrable={data?.isAccessibilityRegistrable}
          />
        );
      case 'restroom':
        return (
          <V2RestroomTab
            toiletReviews={toiletPost ?? []}
            placeId={place.id}
            placeName={place.name}
            placeLocation={place.location}
            placeAddress={place.address}
            isAccessibilityRegistrable={data?.isAccessibilityRegistrable}
          />
        );
      case 'conqueror':
        return (
          <V2ConquerorTab
            accessibility={accessibilityPost}
            onPressRegister={handlePlaceRegister}
          />
        );
      default:
        return null;
    }
  };

  const showFeedbackSection =
    !!accessibilityPost && !!data?.isAccessibilityRegistrable;

  return (
    <LogParamsProvider params={logParams}>
      <ScreenLayout isHeaderVisible={false} safeAreaEdges={['top']}>
        <GestureHandlerRootView style={{flex: 1}}>
          <V2AppBar
            isFavorite={place.isFavorite}
            onToggleFavorite={() =>
              checkAuth(() =>
                toggleFavorite({
                  currentIsFavorite: place.isFavorite,
                  placeId: place.id,
                }),
              )
            }
            onShare={() => ShareUtils.sharePlace(place)}
            placeName={place.name}
            showTitle={showAppBarTitle}
          />
          <ScrollView
            ref={scrollViewRef}
            style={{flex: 1}}
            scrollEventThrottle={16}
            onScroll={handleScroll}
            onLayout={e => setScrollViewHeight(e.nativeEvent.layout.height)}
            stickyHeaderIndices={[1]}>
            <SummarySectionContainer>
              <V2SummarySection
                place={place}
                accessibilityScore={data?.accessibilityScore}
                hasAccessibility={
                  !!accessibilityPost?.placeAccessibility ||
                  !!accessibilityPost?.buildingAccessibility
                }
                isUpvoted={isUpvoted}
                totalUpvoteCount={totalUpvoteCount}
                onPressUpvote={handleUpvote}
                accessibility={accessibilityPost}
                reviewCount={(reviewPost ?? []).length}
                onPressRegister={() => setShowRegistrationSheet(true)}
                onPressWriteReview={handleReviewRegister}
                onPressSiren={() =>
                  showNegativeFeedbackBottomSheet(
                    ReportTargetTypeDto.PlaceAccessibility,
                  )
                }
                onNameLayout={handleNameLayout}
                onActionButtonsLayout={handleActionButtonsLayout}
              />
              <V2ThumbnailRow
                accessibility={accessibilityPost}
                reviews={reviewPost ?? []}
                toiletReviews={toiletPost ?? []}
              />
            </SummarySectionContainer>

            {/* Tab Bar + Chip Bar — combined sticky header at index 1 */}
            <View
              onLayout={e => {
                tabBarYRef.current = e.nativeEvent.layout.y;
                setStickyHeaderHeight(e.nativeEvent.layout.height);
              }}>
              <V2TabBar
                items={TAB_ITEMS}
                current={currentTab}
                onChange={handleTabChange}
              />
              {showChipBar && (
                <V2ChipBar
                  chips={chips}
                  activeIndex={activeChipIndex}
                  onChipPress={handleChipPress}
                />
              )}
            </View>

            {/* Tab Content — minHeight prevents layout jump when switching to short tabs.
                BottomPadding(110px) is outside this View, so subtract it to prevent over-scroll. */}
            <View
              onLayout={e => {
                tabContentYRef.current = e.nativeEvent.layout.y;
              }}
              style={{
                minHeight:
                  scrollViewHeight > 0
                    ? scrollViewHeight - (stickyHeaderHeight || 41) - 110
                    : 0,
                backgroundColor:
                  currentTab !== 'home' ? color.gray5 : color.white,
              }}>
              {renderTabContent()}

              {/* Feedback Section (삭제 기능) - 홈 탭에서만 표시 */}
              {showFeedbackSection && currentTab === 'home' && (
                <PlaceDetailFeedbackSection
                  placeId={placeId}
                  accessibility={accessibilityPost}
                />
              )}
            </View>

            {/* Bottom padding — 하단 바에 가려지는 영역 보정 (tab content 밖으로 이동하여 배경색 상속 방지) */}
            <BottomPadding />
          </ScrollView>
        </GestureHandlerRootView>

        <Animated.View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            opacity: bottomBarAnim,
            transform: [
              {
                translateY: bottomBarAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [100, 0],
                }),
              },
            ],
          }}
          pointerEvents={showBottomBar ? 'auto' : 'none'}>
          <V2BottomBar
            accessibility={accessibilityPost}
            isUpvoted={isUpvoted}
            totalUpvoteCount={totalUpvoteCount}
            onPressUpvote={handleUpvote}
            onPressRegister={() => setShowRegistrationSheet(true)}
            onPressWriteReview={handleReviewRegister}
            onPressSiren={() =>
              showNegativeFeedbackBottomSheet(
                ReportTargetTypeDto.PlaceAccessibility,
              )
            }
          />
        </Animated.View>

        <RequireBuildingAccessibilityBottomSheet
          isVisible={!isFetching && showRequireBuildingAccessibilityBottomSheet}
          isFirstFloor={accessibilityPost?.placeAccessibility?.isFirstFloor}
          onPressConfirmButton={goToBuildingForm}
          onPressCloseButton={closeModals}
        />
        <QuestCompletionModal onMoveToQuestClearPage={onNavigateToOtherPage} />

        {/* BuildingRegistrationBottomSheet */}
        {event &&
          (event === 'registration-force' ||
            event === 'registration-suggest') && (
            <BuildingRegistrationBottomSheet
              isVisible={showBuildingRegistrationBottomSheet}
              event={event as BuildingRegistrationEvent}
              onPressConfirm={handleBuildingRegistrationConfirm}
              onPressCancel={handleBuildingRegistrationCancel}
            />
          )}

        {/* Registration Sheet */}
        <PlaceDetailRegistrationSheet
          isVisible={showRegistrationSheet}
          onClose={() => setShowRegistrationSheet(false)}
          onPressPlaceRegister={handlePlaceRegister}
          onPressBuildingRegister={handleBuildingRegister}
          onPressReviewRegister={handleReviewRegister}
          onPressToiletRegister={handleToiletRegister}
          isAccessibilityRegistrable={data?.isAccessibilityRegistrable}
        />
      </ScreenLayout>

      {place?.id && (
        <PlaceDetailNegativeFeedbackBottomSheet
          isVisible={reportTargetType !== null}
          placeId={place.id}
          onPressCloseButton={() => {
            setReportTargetType(null);
          }}
          onPressSubmitButton={async (_placeId, reason, text) => {
            if (!reportTargetType) {
              return;
            }

            const targetType = reportTargetType;
            setReportTargetType(null);

            reportAccessibilityMutation.mutate({
              placeId: _placeId,
              reason,
              targetType,
              detail: text,
            });
          }}
        />
      )}
      {place?.location && (
        <NavigationAppsBottomSheet
          isVisible={showNavigationBottomSheet}
          latitude={place.location.lat}
          longitude={place.location.lng}
          placeName={place.name}
          distanceMeters={distanceToPlace}
          onClose={() => setShowNavigationBottomSheet(false)}
        />
      )}
      {LocationConfirmModal}
    </LogParamsProvider>
  );
}

const SummarySectionContainer = styled.View`
  padding-top: 4px;
  padding-bottom: 20px;
  gap: 20px;
`;

const BottomPadding = styled.View`
  height: 110px;
  background-color: transparent;
`;
