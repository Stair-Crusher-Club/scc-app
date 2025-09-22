import {QueryClient, useQueryClient} from '@tanstack/react-query';
import {useAtom, useSetAtom} from 'jotai';
import {throttle} from 'lodash';
import React, {useMemo} from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

import {useMe} from '@/atoms/Auth';
import {recentlyUsedMobilityToolAtom} from '@/atoms/User';
import {loadingState} from '@/components/LoadingView';
import {
  getMobilityToolDefaultValue,
  UserMobilityToolMapDto,
} from '@/constant/review';
import {
  DefaultApi,
  Place,
  RecommendedMobilityTypeDto,
  SpaciousTypeDto,
} from '@/generated-sources/openapi';
import useAppComponents from '@/hooks/useAppComponents';
import ImageFile from '@/models/ImageFile';
import ImageFileUtils from '@/utils/ImageFileUtils';
import ToastUtils from '@/utils/ToastUtils';

import {pushItemsAtom} from '@/screens/SearchScreen/atoms/quest';
import PlaceReviewFormScreen from '..';
import IndoorInfoSection from '../sections/IndoorInfoSection';
import PlaceInfoSection from '../sections/PlaceInfoSection';
import UserTypeSection from '../sections/UserTypeSection';
import VisitorReviewSection from '../sections/VisitorReviewSection';
import {SectionSeparator} from '../sections/common.style';
import {SafeAreaWrapper} from '@/components/SafeAreaWrapper';

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
      comment: '',
      seatTypes: new Set(),
      seatComment: '',
      orderMethods: new Set(),
      features: new Set(),
    },
  });
  const setRecentlyUsedMobilityTool = useSetAtom(recentlyUsedMobilityToolAtom);
  const pushItems = useSetAtom(pushItemsAtom);

  async function onValid(values: FormValues) {
    registerPlace(values, gotoPlaceDetail);
  }

  async function onValidAfterToilet(values: FormValues) {
    registerPlace(values, () => {
      setMobilityTool(values.mobilityTool);
      setReviewTypeToToilet();
    });
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
          stickyHeaderIndices={[0]}
          contentContainerStyle={{flexGrow: 1}}>
          <PlaceInfoSection name={place?.name} address={place?.address} />
          <SectionSeparator />

          <UserTypeSection nickname={userInfo?.nickname} />
          <SectionSeparator />

          <VisitorReviewSection />
          <SectionSeparator />

          <IndoorInfoSection
            onSave={form.handleSubmit(onValid)}
            onSaveAndToiletReview={form.handleSubmit(onValidAfterToilet)}
          />
        </KeyboardAwareScrollView>
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
      queryClient.invalidateQueries({
        queryKey: ['PlaceDetail', placeId, 'Review'],
      });

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
