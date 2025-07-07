import {useQuery} from '@tanstack/react-query';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {ScrollView, View} from 'react-native';
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

  // Sticky navigation state
  const [scrollY, setScrollY] = useState(0);
  const scrollView = useRef<ScrollView>(null);
  const entranceSection = useRef<View>(null);
  const indoorSection = useRef<View>(null);
  const toiletSection = useRef<View>(null);
  const buildingSection = useRef<View>(null);

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

  if (isLoading || !place || !building) {
    return null;
  }

  const isPlaceReviewContentVisible = reviewPost && reviewPost.length > 0;
  const isToiletReviewContentVisible = toiletPost && toiletPost.length > 0;
  const isToiletReviewNudgeVisible = !(toiletPost && toiletPost.length > 1);
  const isPlaceReviewNudgeVisible = !(reviewPost && reviewPost.length > 1);
  const isFeedbackSectionVisible =
    accessibilityPost && accessibilityPost?.placeAccessibility;

  const menus = [{label: '입구 접근성', ref: entranceSection}]
    .concat(
      isPlaceReviewContentVisible
        ? [{label: '이용 정보', ref: indoorSection}]
        : [],
    )
    .concat(
      isToiletReviewContentVisible
        ? [{label: '화장실', ref: toiletSection}]
        : [],
    )
    .concat([{label: '건물 정보', ref: buildingSection}]);

  return (
    <LogParamsProvider params={{place_id: place.id, building_id: building.id}}>
      <ScreenLayout isHeaderVisible={false} safeAreaEdges={['top', 'bottom']}>
        {/* 안드로이드 이미지 캐로셀 이슈 */}
        <GestureHandlerRootView style={{flex: 1}}>
          <ScrollView
            ref={scrollView}
            stickyHeaderIndices={[4]}
            onScroll={e => {
              const y = e.nativeEvent.contentOffset.y;
              setScrollY(y);
            }}
            style={{overflow: 'visible'}}
            scrollEventThrottle={100}>
            <PlaceDetailAppBar />
            <View style={{marginTop: -top}}>
              <PlaceDetailCoverImage accessibility={accessibilityPost} />
            </View>
            <PlaceDetailSummarySection
              accessibility={accessibilityPost}
              accessibilityScore={data?.accessibilityScore}
              place={place}
            />
            <S.SectionSeparator />
            <ScrollNavigation
              scrollContainer={scrollView}
              scrollY={scrollY}
              menus={menus}
            />
            <View ref={entranceSection} collapsable={false}>
              <PlaceDetailEntranceSection
                accessibility={accessibilityPost}
                place={place}
                isAccessibilityRegistrable={data?.isAccessibilityRegistrable}
                onRegister={() =>
                  navigation.navigate('PlaceForm', {place, building})
                }
              />
            </View>
            <S.SectionSeparator />
            {isPlaceReviewContentVisible && (
              <>
                <View ref={indoorSection} collapsable={false}>
                  <PlaceDetailIndoorSection
                    reviews={reviewPost}
                    placeId={place.id}
                  />
                </View>
                <S.SectionSeparator />
              </>
            )}
            {isPlaceReviewNudgeVisible && (
              <>
                <PlaceDetailRegisterButtonSection
                  subTitle={`${place.name} 에 방문하셨나요?`}
                  title="방문 리뷰를 남겨주세요"
                  buttonText="방문 리뷰를 남겨주세요"
                  onPress={() =>
                    checkAuth(() => {
                      navigation.navigate('ReviewForm/Place', {
                        placeId: place.id,
                      });
                    })
                  }
                />
                <S.SectionSeparator />
              </>
            )}
            {isToiletReviewNudgeVisible && (
              <>
                <PlaceDetailRegisterButtonSection
                  title="화장실 정보를 남겨주세요"
                  buttonText="화장실 정보를 남겨주세요"
                  onPress={() =>
                    checkAuth(() => {
                      navigation.navigate('ReviewForm/Toilet', {
                        placeId: place.id,
                      });
                    })
                  }
                />
                <S.SectionSeparator />
              </>
            )}
            {isToiletReviewContentVisible && (
              <>
                <View ref={toiletSection} collapsable={false}>
                  <PlaceDetailToiletSection
                    toiletReviews={toiletPost}
                    placeId={place.id}
                  />
                </View>
                <S.SectionSeparator />
              </>
            )}
            <View ref={buildingSection} collapsable={false}>
              <PlaceDetailBuildingSection
                accessibility={accessibilityPost}
                place={place}
                building={building}
                isAccessibilityRegistrable={data?.isAccessibilityRegistrable}
              />
            </View>
            {isFeedbackSectionVisible && (
              <>
                <S.SectionSeparator />
                <PlaceDetailFeedbackSection accessibility={accessibilityPost} />
              </>
            )}
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
      </ScreenLayout>
    </LogParamsProvider>
  );
};

export default PlaceDetailScreen;
