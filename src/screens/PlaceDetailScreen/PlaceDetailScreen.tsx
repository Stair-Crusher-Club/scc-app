import {useQuery} from '@tanstack/react-query';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {NativeScrollEvent, ScrollView, View} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {ScreenLayout} from '@/components/ScreenLayout';
import ScrollNavigation from '@/components/StickyScrollNavigation';
import {Building, Place} from '@/generated-sources/openapi';
import useAppComponents from '@/hooks/useAppComponents';
import {LogParamsProvider} from '@/logging/LogParamsProvider';
import {ScreenProps} from '@/navigation/Navigation.screens';
import PlaceDetailIndoorSection from '@/screens/PlaceDetailScreen/sections/PlaceDetailIndoorSection';
import PlaceDetailRegisterButtonSection from '@/screens/PlaceDetailScreen/sections/PlaceDetailRegisterIndoorSection';
import PlaceDetailToiletSection from '@/screens/PlaceDetailScreen/sections/PlaceDetailToiletSection';
import {useCheckAuth} from '@/utils/checkAuth';

import QuestCompletionModal from '../SearchScreen/components/QuestCompletionModal';
import * as S from './PlaceDetailScreen.style';
import RegisterCompleteBottomSheet from './modals/RegisterCompleteBottomSheet';
import RequireBuildingAccessibilityBottomSheet from './modals/RequireBuildingAccessibilityBottomSheet';
import PlaceDetailAppBar from './sections/PlaceDetailAppBar';
import PlaceDetailBuildingSection from './sections/PlaceDetailBuildingSection';
import PlaceDetailCoverImage from './sections/PlaceDetailCoverImage';
import PlaceDetailEntranceSection from './sections/PlaceDetailEntranceSection';
import {PlaceDetailFeedbackSection} from './sections/PlaceDetailFeedbackSection';
import PlaceDetailSummarySection from './sections/PlaceDetailSummarySection';

export interface PlaceDetailScreenParams {
  placeInfo:
    | {placeId: string}
    | {
        place: Place;
        building: Building;
        isAccessibilityRegistrable?: boolean;
        accessibilityScore?: number;
      };
  event?: 'submit-place' | 'submit-building';
}

interface SectionConfig {
  id: string;
  label?: string;
  shouldRender: boolean;
  component: React.ReactNode;
  order: number;
}

const PlaceDetailScreen = ({route, navigation}: ScreenProps<'PlaceDetail'>) => {
  const {event, placeInfo} = route.params;
  const checkAuth = useCheckAuth();
  const {api} = useAppComponents();

  const placeId =
    'placeId' in placeInfo ? placeInfo.placeId : placeInfo.place.id;

  const [
    showRequireBuildingAccessibilityBottomSheet,
    setShowRequireBuildingAccessibilityBottomSheet,
  ] = useState(false);
  const [showRegisterCompleteBottomSheet, setShowRegisterCompleteBottomSheet] =
    useState(false);

  // scrollY 는 state로 관리하면 너무 잦은 업데이트로 인해 리렌더가 너무 많이 일어남
  // 따라서 ref로 관리하고 이를 읽어야 하는 컴포넌트가 100ms 마다 업데이트하는 방식으로 처리
  const scrollEventRef = useRef<null | NativeScrollEvent>(null);
  const scrollView = useRef<ScrollView>(null);
  const [sectionYPositions, setSectionYPositions] = useState<{
    [key: string]: number;
  }>({});
  const {top} = useSafeAreaInsets();

  const {data} = useQuery({
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
    },
    queryKey: ['PlaceDetail', placeId],
    queryFn: async ({queryKey}) => {
      const result = await api.getPlaceWithBuildingPost({placeId: queryKey[1]});
      return {
        place: result.data.place,
        building: result.data.building,
        isAccessibilityRegistrable: result.data.isAccessibilityRegistrable,
        accessibilityScore: result.data.accessibilityInfo?.accessibilityScore,
      };
    },
  });
  const place = data?.place;
  const building = data?.building;

  const {data: accessibilityPost, isLoading} = useQuery({
    queryKey: ['PlaceDetail', placeId, 'Accessibility'],
    queryFn: async ({queryKey}) =>
      (await api.getAccessibilityPost({placeId: queryKey[1]})).data,
  });
  const {data: reviewPost} = useQuery({
    queryKey: ['PlaceDetail', placeId, 'Review'],
    queryFn: async ({queryKey}) =>
      (await api.listPlaceReviewsPost({placeId: queryKey[1]})).data,
  });
  const {data: toiletPost} = useQuery({
    queryKey: ['PlaceDetail', placeId, 'Toilet'],
    queryFn: async ({queryKey}) =>
      (await api.listToiletReviewsPost({placeId: queryKey[1]})).data,
  });

  useEffect(() => {
    // 등록된 정보 확인 후에 띄워주기
    if (!accessibilityPost) {
      return;
    }

    // open by event
    if (event === 'submit-place') {
      // 건물 정보가 이미 있는 경우, 정복 완료로 보여주기
      if (accessibilityPost.buildingAccessibility) {
        setShowRegisterCompleteBottomSheet(true);
      } else {
        setShowRequireBuildingAccessibilityBottomSheet(true);
      }
    }
    if (event === 'submit-building') {
      setShowRegisterCompleteBottomSheet(true);
    }
  }, [accessibilityPost, event, placeId]);

  const closeModals = useCallback(() => {
    // 일단 둘밖에 없으니 둘 다 닫는걸로 처리하자
    setShowRequireBuildingAccessibilityBottomSheet(false);
    setShowRegisterCompleteBottomSheet(false);
    // 복귀 후 모달을 다시 띄우지 않기 위한 처리
    navigation.setParams({event: undefined});
  }, [navigation]);

  const goToBuildingForm = useCallback(() => {
    closeModals();
    if (place && building) {
      navigation.navigate('BuildingForm', {place, building});
    }
  }, [building, closeModals, navigation, place]);

  // 섹션의 y 위치를 업데이트하는 함수
  const updateSectionYPosition = useCallback((sectionId: string, y: number) => {
    setSectionYPositions(prev => ({
      ...prev,
      [sectionId]: y,
    }));
  }, []);

  if (isLoading || !place || !building) {
    return null;
  }

  const isReviewEnabledCategory =
    data.place?.category === 'RESTAURANT' || data.place?.category === 'CAFE';

  const isFirstFloor =
    accessibilityPost?.placeAccessibility?.isFirstFloor ?? false;

  const sections: SectionConfig[] = [
    {
      id: 'entrance',
      label: '입구 접근성',
      shouldRender: true,
      component: (
        <PlaceDetailEntranceSection
          accessibility={accessibilityPost}
          place={place}
          isAccessibilityRegistrable={data?.isAccessibilityRegistrable}
          onRegister={() => navigation.navigate('PlaceForm', {place, building})}
        />
      ),
      order: 1,
    },
    {
      id: 'building',
      label: '건물 정보',
      shouldRender: true,
      component: (
        <PlaceDetailBuildingSection
          accessibility={accessibilityPost}
          place={place}
          building={building}
          isAccessibilityRegistrable={data?.isAccessibilityRegistrable}
        />
      ),
      order: isFirstFloor ? 7 : 2, // 1층이면 맨 마지막, 아니면 입구 다음
    },
    {
      id: 'indoor',
      label: '이용 정보',
      shouldRender: !!(
        isReviewEnabledCategory &&
        reviewPost &&
        reviewPost.length > 0
      ),
      component: (
        <PlaceDetailIndoorSection
          reviews={reviewPost ?? []}
          placeId={place.id}
        />
      ),
      order: 3,
    },
    {
      id: 'placeReviewNudge',
      shouldRender: isReviewEnabledCategory,
      component: (
        <PlaceDetailRegisterButtonSection
          logKey="place_detail_review_nudge"
          title={`<b>${place.name}</b>에 방문하셨나요? 리뷰를 남겨주시면 다른 분들에게 큰 도움이 돼요.`}
          buttonText="방문 리뷰 쓰기"
          onPress={() =>
            checkAuth(() => {
              navigation.navigate('ReviewForm/Place', {
                placeId: place.id,
              });
            })
          }
        />
      ),
      order: 4,
    },
    {
      id: 'toilet',
      label: '화장실',
      shouldRender: !!(
        isReviewEnabledCategory &&
        toiletPost &&
        toiletPost.length > 0
      ),
      component: (
        <PlaceDetailToiletSection
          toiletReviews={toiletPost ?? []}
          placeId={place.id}
        />
      ),
      order: 5,
    },
    {
      id: 'toiletReviewNudge',
      shouldRender: isReviewEnabledCategory,
      component: (
        <PlaceDetailRegisterButtonSection
          logKey="place_detail_toilet_review_nudge"
          title="<b>장애인 화장실</b>이 있었나요? 정보를 등록해주시면 필요한 분들에게 큰 도움이 돼요."
          buttonText="장애인 화장실 정보 등록"
          onPress={() =>
            checkAuth(() => {
              navigation.navigate('ReviewForm/Toilet', {
                placeId: place.id,
              });
            })
          }
        />
      ),
      order: 6,
    },
    {
      id: 'feedback',
      shouldRender: !!(
        accessibilityPost && accessibilityPost?.placeAccessibility
      ),
      component: accessibilityPost ? (
        <PlaceDetailFeedbackSection accessibility={accessibilityPost} />
      ) : null,
      order: 8,
    },
  ];

  const visibleSections = sections
    .filter(section => section.shouldRender)
    .sort((a, b) => a.order - b.order);

  // 네비게이션 메뉴 구성 - y 위치를 포함
  const navigationMenus = visibleSections
    .filter(section => section.label)
    .map(section => ({
      label: section.label!,
      y: sectionYPositions[section.id] || 0,
    }));

  return (
    <LogParamsProvider params={{place_id: place.id, building_id: building.id}}>
      <ScreenLayout isHeaderVisible={false} safeAreaEdges={['top', 'bottom']}>
        {/* 안드로이드 이미지 캐로셀 이슈 */}
        <GestureHandlerRootView style={{flex: 1}}>
          <ScrollView
            ref={scrollView}
            stickyHeaderIndices={[4]}
            onScroll={e => {
              scrollEventRef.current = e.nativeEvent;
            }}
            style={{overflow: 'visible'}}
            scrollEventThrottle={100}>
            <PlaceDetailAppBar />
            <View style={{marginTop: -top}}>
              <PlaceDetailCoverImage
                accessibility={accessibilityPost}
                placeIndoorReviews={reviewPost ?? []}
                toiletReviews={toiletPost ?? []}
              />
            </View>
            <PlaceDetailSummarySection
              accessibility={accessibilityPost}
              accessibilityScore={data?.accessibilityScore}
              place={place}
            />
            <S.SectionSeparator />
            <ScrollNavigation
              scrollContainer={scrollView}
              scrollEventRef={scrollEventRef}
              menus={navigationMenus}
            />
            {visibleSections.map((section, index) => (
              <React.Fragment key={section.id}>
                <View
                  onLayout={e => {
                    const {y} = e.nativeEvent.layout;
                    updateSectionYPosition(section.id, y);
                  }}
                  collapsable={false}>
                  {section.component}
                </View>
                {index < visibleSections.length - 1 && <S.SectionSeparator />}
              </React.Fragment>
            ))}
          </ScrollView>
        </GestureHandlerRootView>
        <RequireBuildingAccessibilityBottomSheet
          isVisible={showRequireBuildingAccessibilityBottomSheet}
          isFirstFloor={accessibilityPost?.placeAccessibility?.isFirstFloor}
          onPressConfirmButton={goToBuildingForm}
          onPressCloseButton={closeModals}
        />
        <RegisterCompleteBottomSheet
          isVisible={showRegisterCompleteBottomSheet}
          accessibilityPost={accessibilityPost}
          event={event}
          onPressConfirmButton={closeModals}
        />

        <QuestCompletionModal />
      </ScreenLayout>
    </LogParamsProvider>
  );
};

export default PlaceDetailScreen;
