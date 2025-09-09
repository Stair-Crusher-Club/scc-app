import {useAtom, useSetAtom} from 'jotai';
import {throttle} from 'lodash';
import React, {useMemo} from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import {ScrollView} from 'react-native';

import {loadingState} from '@/components/LoadingView';
import {SccButton} from '@/components/atoms';
import {
  Building,
  DefaultApi,
  EntranceDoorType,
  Place,
  StairHeightLevel,
  StairInfo,
} from '@/generated-sources/openapi';
import useAppComponents from '@/hooks/useAppComponents';
import {LogParamsProvider} from '@/logging/LogParamsProvider';
import ImageFile from '@/models/ImageFile';
import {ScreenProps} from '@/navigation/Navigation.screens';
import ImageFileUtils from '@/utils/ImageFileUtils';
import ToastUtils from '@/utils/ToastUtils';

import {SafeAreaWrapper} from '@/components/SafeAreaWrapper';
import {ScreenLayout} from '@/components/ScreenLayout';
import {pushItemsAtom} from '../SearchScreen/atoms/quest';
import * as S from './PlaceFormScreen.style';
import CommentsSection from './sections/CommentsSection';
import EnteranceSection from './sections/EnteranceSection';
import FloorSection, {FloorType} from './sections/FloorSection';
import HeaderSection from './sections/HeaderSection';

export interface PlaceFormScreenParams {
  place: Place;
  building: Building;
}

interface FormValues {
  floorType: FloorType;
  isStairOnlyOption: boolean;
  stairHeightLevel: StairHeightLevel;
  exactFloor: string;

  enterancePhotos: ImageFile[];
  hasStairs: boolean;
  stairInfo: StairInfo;
  hasSlope: boolean;
  doorType: EntranceDoorType[];
  comment: undefined;
}
export default function PlaceFormScreen({
  route,
  navigation,
}: ScreenProps<'PlaceForm'>) {
  const {api} = useAppComponents();
  const {place, building} = route.params;
  const form = useForm<FormValues>();
  const [loading, setLoading] = useAtom(loadingState);
  const pushItems = useSetAtom(pushItemsAtom);

  async function submit() {
    const isValid = await form.trigger();
    if (!isValid) {
      const errors = Object.keys(form.formState.errors) as (keyof FormValues)[];
      if (!errors[0]) return;
      noticeError(errors[0], form.formState.errors[errors[0]]?.message);
      return;
    }
    const values = form.watch();
    registerPlace(values);
  }

  function noticeError(errorKey: keyof FormValues, message?: string) {
    switch (errorKey) {
      case 'floorType':
      case 'exactFloor':
        ToastUtils.show(message || '층 정보를 입력해주세요.');
        break;
      case 'enterancePhotos':
        ToastUtils.show(message || '입구 사진을 등록해주세요.');
        break;
      case 'stairInfo':
      case 'hasStairs':
      case 'stairHeightLevel':
      case 'isStairOnlyOption':
        ToastUtils.show(message || '계단 정보를 입력해주세요.');
        break;
      case 'hasSlope':
        ToastUtils.show(message || '경사로 정보를 입력해주세요.');
        break;
      case 'doorType':
        ToastUtils.show(message || '출입문 종류를 선택해주세요.');
        break;
      default:
        ToastUtils.show(message || '필수 정보를 입력해주세요.');
    }
  }

  const registerPlace = useMemo(
    () =>
      throttle(async (values: FormValues) => {
        setLoading(new Map(loading).set('PlaceForm', true));
        const registered = await register(api, place.id, values);
        setLoading(new Map(loading).set(PlaceFormScreen.name, false));

        // 장소 정보 등록에 실패, 이후 과정을 진행하지 않음
        if (!registered.success) {
          return;
        }

        if (registered.data) {
          pushItems(registered.data);
        }

        // 네비게이션 스택 확인
        const state = navigation.getState();
        const currentIndex = state.index;
        const previousRoute =
          currentIndex > 0 ? state.routes[currentIndex - 1] : null;
        const isPreviousPlaceDetail = previousRoute?.name === 'PlaceDetail';

        if (isPreviousPlaceDetail) {
          // 이전 화면이 PlaceDetail인 경우: 기존 로직 유지
          // PlaceForm 을 없애고 PlaceDetail로 이동
          navigation.pop(1);
          // PlaceDetail에서 장소 등록 완료 모달을 열어주기
          navigation.replace('PlaceDetail', {
            placeInfo: {
              place,
              building,
            },
            event: 'submit-place',
          });
        } else {
          // 이전 화면이 PlaceDetail이 아닌 경우 (예: Search에서 직접 진입)
          // PlaceForm을 pop하고 PlaceDetail을 push하여 히스토리 유지
          navigation.pop(1);
          navigation.navigate('PlaceDetail', {
            placeInfo: {
              place,
              building,
            },
            event: 'submit-place',
          });
        }
      }, 1000),
    [api, place, building, navigation, loading, setLoading],
  );

  return (
    <LogParamsProvider params={{place_id: place.id}}>
      <ScreenLayout isHeaderVisible={true}>
        <ScrollView>
          <SafeAreaWrapper edges={['bottom']}>
            <FormProvider {...form}>
              <HeaderSection place={place} />
              <S.SectionSeparator />
              <FloorSection />
              <S.SectionSeparatorLine />
              <EnteranceSection />
              <S.SectionSeparator />
              <CommentsSection />
              <S.SubmitButtonWrapper>
                <SccButton
                  text="등록하기"
                  buttonColor="blue50"
                  onPress={submit}
                  elementName="place_form_submit"
                />
              </S.SubmitButtonWrapper>
            </FormProvider>
          </SafeAreaWrapper>
        </ScrollView>
      </ScreenLayout>
    </LogParamsProvider>
  );
}

async function register(api: DefaultApi, placeId: string, values: FormValues) {
  try {
    const images = await ImageFileUtils.uploadImages(
      api,
      values.enterancePhotos,
    );
    try {
      const res = await api.registerPlaceAccessibilityPost({
        placeId,
        floors: getFloors(values),
        isStairOnlyOption: values.isStairOnlyOption,
        stairInfo: values.hasStairs ? values.stairInfo : StairInfo.None,
        hasSlope: values.hasSlope || false,
        imageUrls: images,
        entranceDoorTypes: values.doorType,
        comment: values.comment || undefined,
        stairHeightLevel: values.stairHeightLevel,
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

function getFloors(values: FormValues) {
  switch (values.floorType) {
    case FloorType.MultipleFloors:
      return [1, 2];
    case FloorType.FirstFloor:
      return [1];
    case FloorType.NotFirstFloor:
      return [parseInt(values.exactFloor, 10)];
    default:
      return [0];
  }
}
