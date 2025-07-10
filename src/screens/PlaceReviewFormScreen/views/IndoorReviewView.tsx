import {QueryClient, useQueryClient} from '@tanstack/react-query';
import {useAtom} from 'jotai';
import {throttle} from 'lodash';
import {useMemo} from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import {ScrollView} from 'react-native';

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
import useMe from '@/hooks/useMe';
import ImageFile from '@/models/ImageFile';
import ImageFileUtils from '@/utils/ImageFileUtils';
import ToastUtils from '@/utils/ToastUtils';

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
  setReviewTypeToToilet: () => void;
}

export default function IndoorReviewView({
  place,
  gotoPlaceDetail,
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

  async function onValid(values: FormValues) {
    registerPlace(values, gotoPlaceDetail);
  }

  async function onValidAfterToilet(values: FormValues) {
    registerPlace(values, setReviewTypeToToilet);
  }

  const registerPlace = useMemo(
    () =>
      throttle(async (values: FormValues, afterSuccess: () => void) => {
        setLoading(new Map(loading).set(PlaceReviewFormScreen.name, true));
        const registered = await register({
          api,
          queryClient,
          placeId: place?.id!,
          values,
        });
        setLoading(new Map(loading).set(PlaceReviewFormScreen.name, false));

        if (!registered) {
          return;
        }

        ToastUtils.show('리뷰를 등록했어요.');
        afterSuccess();
      }, 1000),
    [api, place, loading, setLoading],
  );

  return (
    <FormProvider {...form}>
      <ScrollView
        stickyHeaderIndices={[0]}
        contentContainerStyle={{flexGrow: 1}}>
        <PlaceInfoSection name={place?.name} address={place?.address} />
        <SectionSeparator />

        <UserTypeSection />
        <SectionSeparator />

        <VisitorReviewSection />
        <SectionSeparator />

        <IndoorInfoSection
          onSave={form.handleSubmit(onValid)}
          onSaveAndToiletReview={form.handleSubmit(onValidAfterToilet)}
        />
      </ScrollView>
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
      await api.registerPlaceReviewPost({
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
      return true;
    } catch (error: any) {
      ToastUtils.showOnApiError(error);
      return false;
    }
  } catch (e) {
    ToastUtils.show('사진 업로드를 실패했습니다.');
    return false;
  }
}
