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
  REGISTER_TIMEOUT_MS,
  REQUEST_ID_HEADER,
  useIdempotencyKey,
} from '@/hooks/useIdempotencyKey';
import {
  showUploadFailedToast,
  useImageUploadWithProgress,
  UploadImagesFn,
} from '@/hooks/useImageUploadWithProgress';
import usePost from '@/hooks/usePost';
import {USER_TUTORIAL_PROGRESS_QUERY_KEY} from '@/hooks/useUserTutorialProgress';
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
  locationComment: string;
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
  const getIdempotencyKey = useIdempotencyKey();
  const setRecentlyUsedMobilityTool = useSetAtom(recentlyUsedMobilityToolAtom);

  const form = useForm<FormValues>({
    defaultValues: {
      mobilityTool:
        mobilityTool ?? getMobilityToolDefaultValue(userInfo?.mobilityTools),
      floor: 1,
      toiletPhotos: [],
      comment: '',
      locationComment: '',
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
      requestId,
    }: {
      values: FormValues;
      uploaded: {images: string[]};
      requestId: string;
    }) =>
      submitRegistration({
        api,
        queryClient,
        placeId: place?.id!,
        values,
        uploaded,
        requestId,
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

        // 사진 URL 은 업로드마다 달라지므로 업로드 전 입력(로컬 사진 포함)으로 키를 정한다.
        const requestId = getIdempotencyKey(values);

        let uploaded: {images: string[]};
        try {
          uploaded = await uploadAllPhotos({api, values, uploadImages});
        } catch (e) {
          showUploadFailedToast(e);
          return;
        }

        const registered = await submitMutation.mutateAsync({
          values,
          uploaded,
          requestId,
        });

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
      getIdempotencyKey,
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
  requestId,
}: {
  api: DefaultApi;
  queryClient: QueryClient;
  placeId: string;
  values: FormValues;
  uploaded: {images: string[]};
  requestId: string;
}) {
  try {
    const isNoneOrEtc =
      values.toiletLocationType === 'NONE' ||
      values.toiletLocationType === 'ETC';
    await api.registerToiletReviewPost(
      {
        placeId,
        mobilityTool: values.mobilityTool,
        toiletLocationType: values.toiletLocationType,
        entranceDoorTypes: isNoneOrEtc ? values.doorTypes : [values.doorTypes],
        comment: values.comment,
        locationComment: values.locationComment,
        imageUrls: uploaded.images,
        floor: isNoneOrEtc ? undefined : values.floor,
      } as unknown as RegisterToiletReviewRequestDto, // FIXME: update api yaml
      {headers: {[REQUEST_ID_HEADER]: requestId}, timeout: REGISTER_TIMEOUT_MS},
    );

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
    // 윌리의 외출 NUX 튜토리얼: 리뷰 작성 미션 진행 상태 무효화
    queryClient.invalidateQueries({
      queryKey: USER_TUTORIAL_PROGRESS_QUERY_KEY,
    });

    updateSearchCacheForPlaceAsync(api, queryClient, placeId);

    return true;
  } catch (error: any) {
    ToastUtils.showOnApiError(error);
    return false;
  }
}
