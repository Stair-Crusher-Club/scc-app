import {QueryClient, useQueryClient} from '@tanstack/react-query';
import {useAtom, useSetAtom} from 'jotai';
import {throttle} from 'lodash';
import React, {useCallback, useMemo, useRef, useState} from 'react';
import {FieldErrors, FormProvider, useForm} from 'react-hook-form';
import {View} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import styled from 'styled-components/native';

import {useMe} from '@/atoms/Auth';
import {recentlyUsedMobilityToolAtom} from '@/atoms/User';
import {loadingState} from '@/components/LoadingView';
import {color} from '@/constant/color';
import {
  getMobilityToolDefaultValue,
  UserMobilityToolMapDto,
} from '@/constant/review';
import {
  DefaultApi,
  Place,
  RecommendedMobilityTypeDto,
  SpaciousTypeDto,
  UpvoteTargetTypeDto,
} from '@/generated-sources/openapi';
import useAppComponents from '@/hooks/useAppComponents';
import ImageFile from '@/models/ImageFile';
import ImageFileUtils from '@/utils/ImageFileUtils';
import {updateSearchCacheForPlaceAsync} from '@/utils/SearchPlacesUtils';
import ToastUtils from '@/utils/ToastUtils';

import {SafeAreaWrapper} from '@/components/SafeAreaWrapper';
import PhotoConfirmBottomSheet from '@/modals/PhotoConfirmBottomSheet';
import {pushItemsAtom} from '@/screens/SearchScreen/atoms/quest';
import PlaceReviewFormScreen from '..';
import IndoorInfoSection from '../sections/IndoorInfoSection';
import PlaceInfoSection from '../sections/PlaceInfoSection';
import UserTypeSection from '../sections/UserTypeSection';
import VisitorReviewSection from '../sections/VisitorReviewSection';
import {SectionSeparator} from '../sections/common.style';

export interface FormValues {
  mobilityTool: UserMobilityToolMapDto;
  recommendedMobilityTypes: Set<RecommendedMobilityTypeDto>;
  spaciousType?: SpaciousTypeDto;
  indoorPhotos: ImageFile[];
  comment: string;
  seatTypes: Set<string>;
  seatComment: string;
  orderMethods: Set<string>;
  features: Set<string>;
}

interface IndoorReviewViewProps {
  place?: Place;
  gotoPlaceDetail: () => void;
  setMobilityTool: (mobilityTool: UserMobilityToolMapDto) => void;
  setReviewTypeToToilet: () => void;
}

export default function IndoorReviewView({
  place,
  gotoPlaceDetail,
  setMobilityTool,
  setReviewTypeToToilet,
}: IndoorReviewViewProps) {
  const {api} = useAppComponents();
  const queryClient = useQueryClient();
  const {userInfo} = useMe();
  const [loading, setLoading] = useAtom(loadingState);
  const form = useForm<FormValues>({
    defaultValues: {
      mobilityTool: getMobilityToolDefaultValue(userInfo?.mobilityTools),
      recommendedMobilityTypes: new Set(),
      spaciousType: undefined,
      indoorPhotos: [],
      comment: '',
      seatTypes: new Set(),
      seatComment: '',
      orderMethods: new Set(),
      features: new Set(),
    },
  });
  const setRecentlyUsedMobilityTool = useSetAtom(recentlyUsedMobilityToolAtom);
  const pushItems = useSetAtom(pushItemsAtom);

  const [isPhotoModalVisible, setIsPhotoModalVisible] = useState(false);
  const pendingSubmitRef = useRef<(() => void) | null>(null);
  const hasShownPhotoModalRef = useRef(false);
  const scrollViewRef = useRef<KeyboardAwareScrollView>(null);
  const visitorSectionY = useRef<number>(0);
  const photoAreaY = useRef<number>(0);

  function onInvalid(errors: FieldErrors<FormValues>) {
    // 첫 번째 에러 필드의 메시지를 토스트로 표시
    const firstErrorField = Object.keys(errors)[0] as keyof FormValues;
    const firstError = errors[firstErrorField];

    if (firstError?.message) {
      ToastUtils.show(firstError.message);
    }
  }

  async function onValid(values: FormValues) {
    if (!values.indoorPhotos?.length && !hasShownPhotoModalRef.current) {
      pendingSubmitRef.current = () => registerPlace(values, gotoPlaceDetail);
      hasShownPhotoModalRef.current = true;
      setIsPhotoModalVisible(true);
      return;
    }
    registerPlace(values, gotoPlaceDetail);
  }

  async function onValidAfterToilet(values: FormValues) {
    const afterSuccess = () => {
      setMobilityTool(values.mobilityTool);
      setReviewTypeToToilet();
    };

    if (!values.indoorPhotos?.length && !hasShownPhotoModalRef.current) {
      pendingSubmitRef.current = () => registerPlace(values, afterSuccess);
      hasShownPhotoModalRef.current = true;
      setIsPhotoModalVisible(true);
      return;
    }
    registerPlace(values, afterSuccess);
  }

  const handlePhotoModalConfirm = useCallback(() => {
    // 사진 추가하기 - 바텀시트 닫고 사진 영역으로 스크롤
    setIsPhotoModalVisible(false);
    pendingSubmitRef.current = null;
    setTimeout(() => {
      const targetY = visitorSectionY.current + photoAreaY.current;
      scrollViewRef.current?.scrollToPosition(0, targetY, true);
    }, 300);
  }, []);

  function handlePhotoModalCancel() {
    // 사진 없이 등록하기 - 등록 진행
    setIsPhotoModalVisible(false);
    pendingSubmitRef.current?.();
    pendingSubmitRef.current = null;
  }

  const registerPlace = useMemo(
    () =>
      throttle(async (values: FormValues, afterSuccess: () => void) => {
        setLoading(new Map(loading).set(PlaceReviewFormScreen.name, true));
        setRecentlyUsedMobilityTool({
          name: values.mobilityTool,
          timestamp: Date.now(),
        });
        const registered = await register({
          api,
          queryClient,
          placeId: place?.id!,
          values,
        });
        setLoading(new Map(loading).set(PlaceReviewFormScreen.name, false));

        if (!registered.success) {
          return;
        }

        if (registered.data) {
          pushItems(registered.data);
        }

        ToastUtils.show('리뷰를 등록했어요.');
        afterSuccess();
      }, 1000),
    [api, place, loading, setLoading, setRecentlyUsedMobilityTool],
  );

  return (
    <FormProvider {...form}>
      <SafeAreaWrapper edges={['bottom']}>
        <KeyboardAwareScrollView
          ref={scrollViewRef}
          stickyHeaderIndices={[0]}
          contentContainerStyle={{flexGrow: 1}}>
          <PlaceInfoSectionWrapper>
            <PlaceInfoSection name={place?.name} address={place?.address} />
          </PlaceInfoSectionWrapper>
          <SectionSeparator />

          <UserTypeSection nickname={userInfo?.nickname} />
          <SectionSeparator />

          <View
            onLayout={e => {
              visitorSectionY.current = e.nativeEvent.layout.y;
            }}>
            <VisitorReviewSection
              onPhotoSectionLayout={y => {
                photoAreaY.current = y;
              }}
            />
          </View>
          <SectionSeparator />

          <IndoorInfoSection
            onSave={form.handleSubmit(onValid, onInvalid)}
            onSaveAndToiletReview={form.handleSubmit(
              onValidAfterToilet,
              onInvalid,
            )}
          />
        </KeyboardAwareScrollView>
        <PhotoConfirmBottomSheet
          isVisible={isPhotoModalVisible}
          onConfirm={handlePhotoModalConfirm}
          onCancel={handlePhotoModalCancel}
        />
      </SafeAreaWrapper>
    </FormProvider>
  );
}

async function register({
  api,
  queryClient,
  placeId,
  values,
}: {
  api: DefaultApi;
  queryClient: QueryClient;
  placeId: string;
  values: FormValues;
}) {
  try {
    const images = await ImageFileUtils.uploadImages(
      api,
      values.indoorPhotos,
      'PLACE_REVIEW',
    );
    try {
      const res = await api.registerPlaceReviewPost({
        placeId,
        mobilityTool: values.mobilityTool,
        recommendedMobilityTypes: [...values.recommendedMobilityTypes],
        spaciousType: values.spaciousType!,
        comment: values.comment,
        seatTypes: values.seatComment
          ? [...values.seatTypes, values.seatComment]
          : [...values.seatTypes],
        orderMethods: [...values.orderMethods],
        features: [...values.features],
        imageUrls: images,
      });

      // PlaceDetailScreen 리뷰 데이터 갱신
      queryClient.invalidateQueries({
        queryKey: ['PlaceDetail', placeId, UpvoteTargetTypeDto.PlaceReview],
      });

      // 내 리뷰 > 내가 작성한 리뷰 리스트
      queryClient.invalidateQueries({
        queryKey: ['MyReviews', UpvoteTargetTypeDto.PlaceReview],
      });

      // 내 리뷰 > 도움이 돼요 리스트
      queryClient.invalidateQueries({
        queryKey: ['ReviewsUpvoted', UpvoteTargetTypeDto.PlaceReview],
      });

      // 내 리뷰 > 내가 작성한 리뷰 통계
      queryClient.invalidateQueries({
        queryKey: ['ReviewHistory', 'Review', UpvoteTargetTypeDto.PlaceReview],
      });

      // 내 리뷰 > 도움이 돼요 통계
      queryClient.invalidateQueries({
        queryKey: ['ReviewHistory', 'Upvote', UpvoteTargetTypeDto.PlaceReview],
      });

      // Asynchronously update search cache with full latest data
      updateSearchCacheForPlaceAsync(api, queryClient, placeId);

      return {
        success: true,
        data: res.data.contributedChallengeInfos?.flatMap(info =>
          info.completedQuestsByContribution.map(quest => ({
            challengeId: info.challenge.id,
            type: quest.completeStampType,
            title: quest.title,
          })),
        ),
      };
    } catch (error: any) {
      ToastUtils.showOnApiError(error);
      return {
        success: false,
      };
    }
  } catch (e) {
    ToastUtils.show('사진 업로드를 실패했습니다.');
    return {
      success: false,
    };
  }
}

const PlaceInfoSectionWrapper = styled.View({
  borderBottomWidth: 1,
  borderBottomColor: color.gray20,
});
