import {useAtom} from 'jotai';
import {throttle} from 'lodash';
import {useMemo} from 'react';
import {FieldErrors, FormProvider, useForm} from 'react-hook-form';

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

  function onInvalid(errors: FieldErrors<FormValues>) {
    const errorsKeys = Object.keys(errors) as (keyof FormValues)[];
    if (!errorsKeys[0]) return;
    noticeError(errorsKeys[0]);
  }

  function noticeError(errorKey: keyof FormValues, message?: string) {
    switch (errorKey) {
      case 'experience':
      case 'specialNotes':
      case 'userType':
        ToastUtils.show(message || '사용한 이동보조기기를 선택해주세요.');
        break;
      case 'mobilityTool':
        ToastUtils.show(message || '추천 대상을 선택해주세요.');
        break;
      case 'useful':
        ToastUtils.show(message || '내부 공간에 대해 선택해주세요.');
        break;
      case 'seats':
        ToastUtils.show(message || '매장 이용 좌석 구성을 선택해주세요.');
        break;
      case 'order':
        ToastUtils.show(message || '매장 주문 방법을 선택해주세요.');
        break;
      default:
        ToastUtils.show(message || '필수 정보를 입력해주세요.');
    }
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
        onSave={form.handleSubmit(onValid, onInvalid)}
        onSaveAndToiletReview={form.handleSubmit(onValidAfterToilet, onInvalid)}
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
