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
import {useMe} from '@/atoms/Auth';
import ImageFile from '@/models/ImageFile';
import ImageFileUtils from '@/utils/ImageFileUtils';
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

  const registerPlace = useMemo(
    () =>
      throttle(async (values: FormValues, afterSuccess: () => void) => {
        setRecentlyUsedMobilityTool({
          name: values.mobilityTool,
          timestamp: Date.now(),
        });
        const registered = await register({
          api,
          queryClient,
          placeId: place?.id!,
          values,
          uploadImagesFn: uploadImages,
        });

        if (!registered) {
          return;
        }

        ToastUtils.show('화장실 리뷰를 등록했어요.');
        afterSuccess();
      }, 1000),
    [api, place, uploadImages, setRecentlyUsedMobilityTool],
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

async function register({
  api,
  queryClient,
  placeId,
  values,
  uploadImagesFn,
}: {
  api: DefaultApi;
  queryClient: QueryClient;
  placeId: string;
  values: FormValues;
  uploadImagesFn?: UploadImagesFn;
}) {
  const upload =
    uploadImagesFn ?? ImageFileUtils.uploadImages.bind(ImageFileUtils);
  try {
    const images = await upload(api, values.toiletPhotos, 'TOILET_REVIEW');
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

      // PlaceDetailScreen 화장실 리뷰 데이터 갱신
      queryClient.invalidateQueries({
        queryKey: ['PlaceDetailV2', placeId, UpvoteTargetTypeDto.ToiletReview],
      });

      // 내 리뷰 > 내가 작성한 리뷰 리스트
      queryClient.invalidateQueries({
        queryKey: ['MyReviews', UpvoteTargetTypeDto.ToiletReview],
      });

      // 내 리뷰 > 도움이 돼요 리스트
      queryClient.invalidateQueries({
        queryKey: ['ReviewsUpvoted', UpvoteTargetTypeDto.ToiletReview],
      });

      // 내 리뷰 > 내가 작성한 리뷰 통계
      queryClient.invalidateQueries({
        queryKey: ['ReviewHistory', 'Review', UpvoteTargetTypeDto.ToiletReview],
      });

      // 내 리뷰 > 도움이 돼요 통계
      queryClient.invalidateQueries({
        queryKey: ['ReviewHistory', 'Upvote', UpvoteTargetTypeDto.ToiletReview],
      });

      // Asynchronously update search cache with full latest data
      updateSearchCacheForPlaceAsync(api, queryClient, placeId);

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
