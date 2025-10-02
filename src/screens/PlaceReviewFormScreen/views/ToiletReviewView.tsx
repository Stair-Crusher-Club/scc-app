import {QueryClient, useQueryClient} from '@tanstack/react-query';
import {useAtom, useSetAtom} from 'jotai';
import {throttle} from 'lodash';
import React, {useMemo} from 'react';
import {FormProvider, useForm} from 'react-hook-form';

import {recentlyUsedMobilityToolAtom} from '@/atoms/User';
import {loadingState} from '@/components/LoadingView';
import {
  getMobilityToolDefaultValue,
  UserMobilityToolMapDto,
} from '@/constant/review';
import {
  DefaultApi,
  EntranceDoorType,
  Place,
  RegisterToiletReviewRequestDto,
  ToiletLocationTypeDto,
} from '@/generated-sources/openapi';
import useAppComponents from '@/hooks/useAppComponents';
import {useMe} from '@/atoms/Auth';
import ImageFile from '@/models/ImageFile';
import ImageFileUtils from '@/utils/ImageFileUtils';
import ToastUtils from '@/utils/ToastUtils';

import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import PlaceReviewFormScreen from '..';
import PlaceInfoSection from '../sections/PlaceInfoSection';
import ToiletSection from '../sections/ToiletSection';
import UserTypeSection from '../sections/UserTypeSection';
import {SectionSeparator} from '../sections/common.style';
import {SafeAreaWrapper} from '@/components/SafeAreaWrapper';

interface ToiletReviewViewProps {
  place?: Place;
  gotoPlaceDetail: () => void;
  mobilityTool?: UserMobilityToolMapDto;
}

export interface FormValues {
  mobilityTool: UserMobilityToolMapDto;
  toiletLocationType: ToiletLocationTypeDto;
  floor: number;
  doorTypes: EntranceDoorType;
  toiletPhotos: ImageFile[];
  comment: string;
}

export default function ToiletReviewView({
  place,
  gotoPlaceDetail,
  mobilityTool,
}: ToiletReviewViewProps) {
  const {api} = useAppComponents();
  const queryClient = useQueryClient();
  const {userInfo} = useMe();
  const [loading, setLoading] = useAtom(loadingState);
  const setRecentlyUsedMobilityTool = useSetAtom(recentlyUsedMobilityToolAtom);

  const form = useForm<FormValues>({
    defaultValues: {
      mobilityTool:
        mobilityTool ?? getMobilityToolDefaultValue(userInfo?.mobilityTools),
      floor: 1,
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

        if (!registered) {
          return;
        }

        ToastUtils.show('화장실 리뷰를 등록했어요.');
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

          <ToiletSection onSave={form.handleSubmit(onValid)} />
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
      values.toiletPhotos,
      'TOILET_REVIEW',
    );
    try {
      const isNoneOrEtc =
        values.toiletLocationType === 'NONE' ||
        values.toiletLocationType === 'ETC';
      await api.registerToiletReviewPost({
        placeId,
        mobilityTool: values.mobilityTool,
        toiletLocationType: values.toiletLocationType,
        entranceDoorTypes: isNoneOrEtc ? values.doorTypes : [values.doorTypes],
        comment: values.comment,
        imageUrls: images,
        floor: isNoneOrEtc ? undefined : values.floor,
      } as unknown as RegisterToiletReviewRequestDto); // FIXME: update api yaml
      queryClient.invalidateQueries({
        queryKey: ['PlaceDetail', placeId, 'Toilet'],
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
