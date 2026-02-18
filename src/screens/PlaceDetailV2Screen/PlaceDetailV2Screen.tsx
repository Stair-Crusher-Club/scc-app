import {useQuery} from '@tanstack/react-query';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {InteractionManager, Platform, ScrollView} from 'react-native';
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
  ReportAccessibilityPostRequest,
  ReportTargetTypeDto,
  UpvoteTargetTypeDto,
} from '@/generated-sources/openapi';
import useAppComponents from '@/hooks/useAppComponents';
import useNavigateWithLocationCheck from '@/hooks/useNavigateWithLocationCheck';
import usePost from '@/hooks/usePost';
import {useToggleAccessibilityInfoRequest} from '@/hooks/useToggleAccessibilityInfoRequest';
import {useToggleFavoritePlace} from '@/hooks/useToggleFavoritePlace';
import {LogParamsProvider} from '@/logging/LogParamsProvider';
import {ScreenProps} from '@/navigation/Navigation.screens';
import ShareUtils from '@/utils/ShareUtils';
import {useCheckAuth} from '@/utils/checkAuth';
import {distanceInMeter} from '@/utils/DistanceUtils';

import ToastUtils from '@/utils/ToastUtils';
import {useFormScreenVersion, useIsQAMode} from '@/utils/accessibilityFlags';
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
import RegisterCompleteBottomSheet from '../PlaceDetailScreen/modals/RegisterCompleteBottomSheet';
import RequireBuildingAccessibilityBottomSheet from '../PlaceDetailScreen/modals/RequireBuildingAccessibilityBottomSheet';
import {PlaceDetailFeedbackSection} from '../PlaceDetailScreen/sections/PlaceDetailFeedbackSection';
import PlaceDetailHomeTab from '../PlaceDetailScreen/tabs/PlaceDetailHomeTab';
import PlaceDetailAccessibilityTab from '../PlaceDetailScreen/tabs/PlaceDetailAccessibilityTab';
import PlaceDetailReviewTab from '../PlaceDetailScreen/tabs/PlaceDetailReviewTab';
import PlaceDetailRestroomTab from '../PlaceDetailScreen/tabs/PlaceDetailRestroomTab';
import PlaceDetailConquerorTab from '../PlaceDetailScreen/tabs/PlaceDetailConquerorTab';
import PlaceDetailRegistrationSheet from '../PlaceDetailScreen/tabs/PlaceDetailRegistrationSheet';

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
  const {event, placeInfo} = route.params;
  const checkAuth = useCheckAuth();
  const {api} = useAppComponents();
  const isQAMode = useIsQAMode();
  const formVersion = useFormScreenVersion();
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
    null | 'registerComplete' | 'requireBuilding' | BuildingRegistrationEvent
  >(null);

  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [showRegistrationSheet, setShowRegistrationSheet] = useState(false);

  const openBottomSheet = useCallback(
    (
      which: 'registerComplete' | 'requireBuilding' | BuildingRegistrationEvent,
    ) => {
      if (which === 'registerComplete') {
        setShowRegisterCompleteBottomSheet(true);
      }

      // QA 모드에서 requireBuilding은 BuildingRegistrationEvent로 대체
      if (which === 'requireBuilding') {
        if (
          isQAMode &&
          event &&
          (event === 'registration-force' || event === 'registration-suggest')
        ) {
          setShowBuildingRegistrationBottomSheet(true);
        } else {
          setShowRequireBuildingAccessibilityBottomSheet(true);
        }
      }
    },
    [event, isQAMode],
  );

  const placeId =
    'placeId' in placeInfo ? placeInfo.placeId : placeInfo.place.id;

  const [
    showRequireBuildingAccessibilityBottomSheet,
    setShowRequireBuildingAccessibilityBottomSheet,
  ] = useState(false);
  const [showRegisterCompleteBottomSheet, setShowRegisterCompleteBottomSheet] =
    useState(false);
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

  // API 에러 시 토스트 + goBack
  useEffect(() => {
    if (isPlaceError) {
      ToastUtils.show('장소 정보를 불러올 수 없습니다.');
      navigation.goBack();
    }
  }, [isPlaceError, navigation]);

  // 네비게이션 블러 시 안전장치: 보류/열림 전부 닫기
  useEffect(() => {
    const unsub = navigation.addListener('blur', () => {
      setPendingBottomSheet(null);
      setShowRegisterCompleteBottomSheet(false);
      setShowRequireBuildingAccessibilityBottomSheet(false);
    });
    return unsub;
  }, [navigation]);

  useEffect(() => {
    // 등록된 정보 확인 후에 띄워주기
    if (!accessibilityPost) return;

    // 어떤 바텀시트를 열지 결정
    let toOpen:
      | null
      | 'registerComplete'
      | 'requireBuilding'
      | BuildingRegistrationEvent = null;

    if (
      event === 'submit-place' ||
      event === 'registration-suggest' ||
      event === 'registration-force'
    ) {
      if (accessibilityPost.buildingAccessibility) {
        toOpen = 'registerComplete';
      } else {
        toOpen = 'requireBuilding';
      }
    } else if (event === 'submit-building') {
      toOpen = 'registerComplete';
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
    setShowRegisterCompleteBottomSheet(false);
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
          if (formVersion === 'v2') {
            navigation.navigate('BuildingFormV2', {place, building});
            return;
          }
          navigation.navigate('BuildingForm', {place, building});
        },
      });
    }
  }, [
    building,
    closeModals,
    formVersion,
    navigation,
    navigateWithLocationCheck,
    place,
  ]);

  const handleBuildingRegistrationConfirm = useCallback(() => {
    handleBuildingRegistrationCancel();
    if (place && building) {
      if (formVersion === 'v2') {
        navigation.navigate('BuildingFormV2', {place, building});
        return;
      }
      navigation.navigate('BuildingForm', {place, building});
    }
  }, [building, formVersion, navigation, place]);

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
          if (formVersion === 'v2') {
            navigation.navigate('PlaceFormV2', {place, building: building!});
            return;
          }
          navigation.navigate('PlaceForm', {place, building: building!});
        },
      });
    });
  }, [
    building,
    checkAuth,
    formVersion,
    navigation,
    navigateWithLocationCheck,
    place,
  ]);

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
          if (formVersion === 'v2') {
            navigation.navigate('BuildingFormV2', {place, building});
            return;
          }
          navigation.navigate('BuildingForm', {place, building});
        },
      });
    });
  }, [
    building,
    checkAuth,
    formVersion,
    navigation,
    navigateWithLocationCheck,
    place,
  ]);

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

  if (isLoading || !place || !building) {
    return null;
  }

  const renderTabContent = () => {
    switch (currentTab) {
      case 'home':
        return (
          <PlaceDetailHomeTab
            accessibility={accessibilityPost}
            place={place}
            reviews={reviewPost ?? []}
            kakaoPlaceId={kakaoPlaceId}
            isAccessibilityInfoRequested={
              accessibilityPost?.isAccessibilityInfoRequested
            }
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
            onPressPlaceRegister={handlePlaceRegister}
            onPressReviewRegister={handleReviewRegister}
          />
        );
      case 'accessibility':
        return (
          <PlaceDetailAccessibilityTab
            accessibility={accessibilityPost}
            place={place}
            building={building}
            isAccessibilityRegistrable={data?.isAccessibilityRegistrable}
            onRegister={handlePlaceRegister}
            showNegativeFeedbackBottomSheet={showNegativeFeedbackBottomSheet}
            allowDuplicateRegistration={isQAMode}
          />
        );
      case 'review':
        return (
          <PlaceDetailReviewTab
            reviews={reviewPost ?? []}
            place={place}
            isAccessibilityRegistrable={data?.isAccessibilityRegistrable}
          />
        );
      case 'restroom':
        return (
          <PlaceDetailRestroomTab
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
          <PlaceDetailConquerorTab
            accessibility={accessibilityPost}
            onPressRegister={handlePlaceRegister}
          />
        );
      default:
        return null;
    }
  };

  const showFeedbackSection =
    accessibilityPost &&
    (accessibilityPost?.placeAccessibility ||
      accessibilityPost?.buildingAccessibility) &&
    data?.isAccessibilityRegistrable;

  return (
    <LogParamsProvider params={{place_id: place.id, building_id: building.id}}>
      <ScreenLayout isHeaderVisible={false} safeAreaEdges={['top', 'bottom']}>
        <GestureHandlerRootView style={{flex: 1}}>
          <ScrollView style={{flex: 1}} scrollEventThrottle={100}>
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
            />
            <V2SummarySection
              place={place}
              accessibilityScore={data?.accessibilityScore}
              hasPlaceAccessibility={!!accessibilityPost?.placeAccessibility}
              hasBuildingAccessibility={
                !!accessibilityPost?.buildingAccessibility
              }
              onPressRegister={() => setShowRegistrationSheet(true)}
              onPressWriteReview={handleReviewRegister}
              onPressSiren={() => setShowNavigationBottomSheet(true)}
            />

            {/* Tab Bar */}
            <V2TabBar
              items={TAB_ITEMS}
              current={currentTab}
              onChange={setCurrentTab}
            />

            {/* Tab Content */}
            {renderTabContent()}

            {/* Feedback Section (삭제 기능) - 홈 탭에서만 표시 */}
            {showFeedbackSection && currentTab === 'home' && (
              <>
                <SectionSeparator />
                <PlaceDetailFeedbackSection
                  accessibility={accessibilityPost!}
                />
              </>
            )}
          </ScrollView>
        </GestureHandlerRootView>

        <RequireBuildingAccessibilityBottomSheet
          isVisible={!isFetching && showRequireBuildingAccessibilityBottomSheet}
          isFirstFloor={accessibilityPost?.placeAccessibility?.isFirstFloor}
          onPressConfirmButton={goToBuildingForm}
          onPressCloseButton={closeModals}
        />
        <RegisterCompleteBottomSheet
          isVisible={showRegisterCompleteBottomSheet}
          accessibilityPost={accessibilityPost}
          event={
            event === 'submit-place' || event === 'submit-building'
              ? event
              : undefined
          }
          onPressConfirmButton={closeModals}
        />

        <QuestCompletionModal onMoveToQuestClearPage={onNavigateToOtherPage} />

        {/* QA 모드에서만 표시되는 BuildingRegistrationBottomSheet */}
        {isQAMode &&
          event &&
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

const SectionSeparator = styled.View`
  height: 6px;
  background-color: ${color.gray5};
`;
