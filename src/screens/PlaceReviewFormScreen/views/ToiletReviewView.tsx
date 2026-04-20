import {QueryClient, useQueryClient} from '@tanstack/react-query';
import {useSetAtom} from 'jotai';
import {throttle} from 'lodash';
import React, {useMemo} from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import {View} from 'react-native';

import {recentlyUsedMobilityToolAtom} from '@/atoms/User';
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
  UpvoteTargetTypeDto,
} from '@/generated-sources/openapi';
import {UploadProgressOverlay} from '@/components/UploadProgressOverlay';
import useAppComponents from '@/hooks/useAppComponents';
import {
  useImageUploadWithProgress,
  UploadImagesFn,
} from '@/hooks/useImageUploadWithProgress';
import usePost from '@/hooks/usePost';
import {useMe} from '@/atoms/Auth';
import ImageFile from '@/models/ImageFile';
import {updateSearchCacheForPlaceAsync} from '@/utils/SearchPlacesUtils';
import ToastUtils from '@/utils/ToastUtils';

import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import PlaceInfoSection from '../sections/PlaceInfoSection';
import ToiletSection from '../sections/ToiletSection';
import UserTypeSection from '../sections/UserTypeSection';
import SectionSeparator from '../sections/SectionSeparator';
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
  const {uploadImages, uploadProgress} = useImageUploadWithProgress();
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

  const submitMutation = usePost(
    ['PlaceReview', 'Toilet', 'Submit'],
    async ({
      values,
      uploaded,
    }: {
      values: FormValues;
      uploaded: {images: string[]};
    }) =>
      submitRegistration({
        api,
        queryClient,
        placeId: place?.id!,
        values,
        uploaded,
      }),
  );

  const registerPlace = useMemo(
    () =>
      throttle(async (values: FormValues, afterSuccess: () => void) => {
        if (submitMutation.isPending) {
          return;
        }
        setRecentlyUsedMobilityTool({
          name: values.mobilityTool,
          timestamp: Date.now(),
        });

        let uploaded: {images: string[]};
        try {
          uploaded = await uploadAllPhotos({api, values, uploadImages});
        } catch {
          ToastUtils.show('사진 업로드를 실패했습니다.');
          return;
        }

        const registered = await submitMutation.mutateAsync({values, uploaded});

        if (!registered) {
          return;
        }

        ToastUtils.show('화장실 리뷰를 등록했어요.');
        afterSuccess();
      }, 1000),
    [
      api,
      place,
      uploadImages,
      setRecentlyUsedMobilityTool,
      submitMutation,
      queryClient,
    ],
  );

  return (
    <FormProvider {...form}>
      <SafeAreaWrapper edges={['bottom']}>
        <KeyboardAwareScrollView
          stickyHeaderIndices={[0]}
          contentContainerClassName="grow">
          <View className="border-b border-gray-20">
            <PlaceInfoSection name={place?.name} address={place?.address} />
          </View>
          <SectionSeparator />

          <UserTypeSection nickname={userInfo?.nickname} />
          <SectionSeparator />

          <ToiletSection onSave={form.handleSubmit(onValid)} />
        </KeyboardAwareScrollView>
        <UploadProgressOverlay {...uploadProgress} />
      </SafeAreaWrapper>
    </FormProvider>
  );
}

async function uploadAllPhotos({
  api,
  values,
  uploadImages,
}: {
  api: DefaultApi;
  values: FormValues;
  uploadImages: UploadImagesFn;
}): Promise<{images: string[]}> {
  const images = await uploadImages(api, values.toiletPhotos, 'TOILET_REVIEW');
  return {images};
}

async function submitRegistration({
  api,
  queryClient,
  placeId,
  values,
  uploaded,
}: {
  api: DefaultApi;
  queryClient: QueryClient;
  placeId: string;
  values: FormValues;
  uploaded: {images: string[]};
}) {
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
      imageUrls: uploaded.images,
      floor: isNoneOrEtc ? undefined : values.floor,
    } as unknown as RegisterToiletReviewRequestDto); // FIXME: update api yaml

    queryClient.invalidateQueries({
      queryKey: ['PlaceDetailV2', placeId, UpvoteTargetTypeDto.ToiletReview],
    });
    queryClient.invalidateQueries({
      queryKey: ['MyReviews', UpvoteTargetTypeDto.ToiletReview],
    });
    queryClient.invalidateQueries({
      queryKey: ['ReviewsUpvoted', UpvoteTargetTypeDto.ToiletReview],
    });
    queryClient.invalidateQueries({
      queryKey: ['ReviewHistory', 'Review', UpvoteTargetTypeDto.ToiletReview],
    });
    queryClient.invalidateQueries({
      queryKey: ['ReviewHistory', 'Upvote', UpvoteTargetTypeDto.ToiletReview],
    });

    updateSearchCacheForPlaceAsync(api, queryClient, placeId);

    return true;
  } catch (error: any) {
    ToastUtils.showOnApiError(error);
    return false;
  }
}
