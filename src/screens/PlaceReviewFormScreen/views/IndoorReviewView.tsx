import {useAtom} from 'jotai';
import {throttle} from 'lodash';
import {useMemo} from 'react';
import {FormProvider, useForm} from 'react-hook-form';

import {loadingState} from '@/components/LoadingView';
import {
  DefaultApi,
  Place,
  RecommendedMobilityTypeDto,
  SpaciousTypeDto,
  UserMobilityToolDto,
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
  mobilityTool: UserMobilityToolDto;
  recommendedMobilityTypes: Set<RecommendedMobilityTypeDto>;
  spaciousType?: SpaciousTypeDto;
  indoorPhotos: ImageFile[];
  comment: string;
  seatTypes: Set<string>;
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
  const {userInfo} = useMe();
  const [loading, setLoading] = useAtom(loadingState);
  const form = useForm<FormValues>({
    defaultValues: {
      mobilityTool: userInfo?.mobilityTools[0],
      recommendedMobilityTypes: new Set(),
      spaciousType: undefined,
      comment: '',
      seatTypes: new Set(),
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
        const registered = await register(api, place?.id!, values);
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
    </FormProvider>
  );
}

async function register(api: DefaultApi, placeId: string, values: FormValues) {
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
        seatTypes: [...values.seatTypes],
        orderMethods: [...values.orderMethods],
        features: [...values.features],
        imageUrls: images,
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
