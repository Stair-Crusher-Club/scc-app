import {useAtom} from 'jotai';
import {throttle} from 'lodash';
import {useMemo} from 'react';
import {FormProvider, useForm} from 'react-hook-form';

import {loadingState} from '@/components/LoadingView';
import {
  DefaultApi,
  Place,
  UserMobilityToolDto,
} from '@/generated-sources/openapi';
import useAppComponents from '@/hooks/useAppComponents';
import ImageFile from '@/models/ImageFile';
import ToastUtils from '@/utils/ToastUtils';

import PlaceReviewFormScreen from '..';
import IndoorInfoSection from '../sections/IndoorInfoSection';
import PlaceInfoSection from '../sections/PlaceInfoSection';
import UserTypeSection from '../sections/UserTypeSection';
import VisitorReviewSection from '../sections/VisitorReviewSection';
import {SectionSeparator} from '../sections/common.style';

export interface FormValues {
  userType?: UserMobilityToolDto;
  mobilityTool: Set<string>;
  useful: string;
  indoorPhotos: ImageFile[];
  experience: string;
  seats: Set<string>;
  order: Set<string>;
  specialNotes: Set<string>;
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
  const [loading, setLoading] = useAtom(loadingState);
  const form = useForm<FormValues>({
    defaultValues: {
      userType: undefined,
      mobilityTool: new Set(),
      useful: '',
      experience: '',
      seats: new Set(),
      order: new Set(),
      specialNotes: new Set(),
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
  // try {
  //   const images = await ImageFileUtils.uploadImages(api, values.indoorPhotos);
  //   try {
  //     await api.registerPlaceAccessibilityPost();
  //     return true;
  //   } catch (error: any) {
  //     ToastUtils.showOnApiError(error);
  //     return false;
  //   }
  // } catch (e) {
  //   ToastUtils.show('사진 업로드를 실패했습니다.');
  //   return false;
  // }
  return true;
}
