import {useAtom} from 'jotai';
import {throttle} from 'lodash';
import {useMemo} from 'react';
import {FormProvider, useForm} from 'react-hook-form';

import {loadingState} from '@/components/LoadingView';
import {
  DefaultApi,
  EntranceDoorType,
  Place,
  ToiletLocationTypeDto,
} from '@/generated-sources/openapi';
import useAppComponents from '@/hooks/useAppComponents';
import ImageFile from '@/models/ImageFile';
import ImageFileUtils from '@/utils/ImageFileUtils';
import ToastUtils from '@/utils/ToastUtils';

import PlaceReviewFormScreen from '..';
import PlaceInfoSection from '../sections/PlaceInfoSection';
import ToiletSection from '../sections/ToiletSection';
import {SectionSeparator} from '../sections/common.style';

interface ToiletReviewViewProps {
  place?: Place;
  gotoPlaceDetail: () => void;
}

export interface FormValues {
  toiletLocationType: ToiletLocationTypeDto;
  floor: number;
  doorTypes: Set<EntranceDoorType>;
  toiletPhotos: ImageFile[];
  comment: string;
}

export default function ToiletReviewView({
  place,
  gotoPlaceDetail,
}: ToiletReviewViewProps) {
  const {api} = useAppComponents();
  const [loading, setLoading] = useAtom(loadingState);

  const form = useForm<FormValues>({
    defaultValues: {
      floor: 2,
      doorTypes: new Set(),
      toiletPhotos: [],
      comment: '',
    },
  });

  async function onValid(values: FormValues) {
    registerPlace(values, gotoPlaceDetail);
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

        ToastUtils.show('화장실 리뷰를 등록했어요.');
        afterSuccess();
      }, 1000),
    [api, place, loading, setLoading],
  );

  return (
    <FormProvider {...form}>
      <PlaceInfoSection name={place?.name} address={place?.address} />
      <SectionSeparator />
      <ToiletSection onSave={form.handleSubmit(onValid)} />
    </FormProvider>
  );
}

async function register(api: DefaultApi, placeId: string, values: FormValues) {
  try {
    const images = await ImageFileUtils.uploadImages(
      api,
      values.toiletPhotos,
      'TOILET_REVIEW',
    );
    try {
      await api.registerToiletReviewPost({
        placeId,
        toiletLocationType: values.toiletLocationType,
        entranceDoorTypes: [...values.doorTypes],
        comment: values.comment,
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
