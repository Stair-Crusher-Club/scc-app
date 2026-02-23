import {useQueryClient} from '@tanstack/react-query';
import {useAtom, useSetAtom} from 'jotai';
import {throttle} from 'lodash';
import React, {useMemo, useState} from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import {ScrollView, View} from 'react-native';

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
import {usePlaceDetailScreenName} from '@/hooks/useFeatureFlags';
import {LogParamsProvider} from '@/logging/LogParamsProvider';
import Logger from '@/logging/Logger';
import ImageFile from '@/models/ImageFile';
import {ScreenProps} from '@/navigation/Navigation.screens';
import ImageFileUtils from '@/utils/ImageFileUtils';
import {updateSearchCacheForPlaceAsync} from '@/utils/SearchPlacesUtils';
import ToastUtils from '@/utils/ToastUtils';

import {ScreenLayout} from '@/components/ScreenLayout';
import CommentsSection from '../PlaceFormScreen/sections/CommentsSection';
import {pushItemsAtom} from '../SearchScreen/atoms/quest';
import * as S from './BuildingFormScreen.style';
import ElevatorSection from './sections/ElevatorSection';
import EnteranceSection from './sections/EnteranceSection';
import HeaderSection from './sections/HeaderSection';
import StickyScrollNavigation from './sections/StickyScrollNavigation';
import {SafeAreaWrapper} from '@/components/SafeAreaWrapper';

export interface BuildingFormScreenParams {
  place: Place;
  building: Building;
}

interface FormValues {
  hasStairs: boolean;
  stairInfo: StairInfo;
  hasSlope: boolean;
  enterancePhotos: ImageFile[];
  entranceStairHeightLevel: StairHeightLevel;
  doorTypes: EntranceDoorType[];
  hasElevator: boolean;
  elevatorHasStairs: boolean;
  elevatorStairInfo: StairInfo;
  elevatorStairHeightLevel: StairHeightLevel;
  elevatorPhotos: ImageFile[];
  comment: string;
}

export default function BuildingFormScreen({
  route,
  navigation,
}: ScreenProps<'BuildingForm'>) {
  const pdpScreen = usePlaceDetailScreenName();
  const [scrollY, setScrollY] = useState(0);
  const {place, building} = route.params;
  const form = useForm<FormValues>();
  const scrollView = React.useRef<ScrollView>(null);
  const buildingEntranceSection = React.useRef<View>(null);
  const elevatorSection = React.useRef<View>(null);
  const {api} = useAppComponents();
  const pushItems = useSetAtom(pushItemsAtom);
  const queryClient = useQueryClient();

  const [loading, setLoading] = useAtom(loadingState);

  async function submit() {
    const isValid = await form.trigger();
    if (!isValid) {
      const errors = Object.keys(form.formState.errors) as (keyof FormValues)[];
      if (!errors[0]) return;
      noticeError(errors[0], form.formState.errors[errors[0]]?.message);
      return;
    }

    const values = form.watch();
    registerBuilding(values);
  }

  const registerBuilding = useMemo(
    () =>
      throttle(async (values: FormValues) => {
        setLoading(new Map(loading).set('BuildingForm', true));
        const registered = await register(
          api,
          queryClient,
          place.id,
          building.id,
          values,
        );
        setLoading(new Map(loading).set('BuildingForm', false));

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
        const isPreviousPlaceDetail =
          previousRoute?.name === 'PlaceDetail' ||
          previousRoute?.name === 'PlaceDetailV2';

        if (isPreviousPlaceDetail) {
          // 이전 화면이 PlaceDetail인 경우: 기존 로직 유지
          // BuildingForm 을 없애고 PlaceDetail로 이동
          navigation.pop(1);
          // PlaceDetail에서 장소 등록 완료 모달을 열어주기
          navigation.replace(pdpScreen, {
            placeInfo: {
              place,
              building,
            },
            event: 'submit-building',
          });
        } else {
          // 이전 화면이 PlaceDetail이 아닌 경우 (예: Search에서 직접 진입)
          // BuildingForm을 pop하고 PlaceDetail을 push하여 히스토리 유지
          navigation.pop(1);
          navigation.navigate(pdpScreen, {
            placeInfo: {
              place,
              building,
            },
            event: 'submit-building',
          });
        }
      }, 1000),
    [api, place, building, navigation, loading, setLoading],
  );

  function noticeError(errorKey: keyof FormValues, message?: string) {
    switch (errorKey) {
      case 'enterancePhotos':
        ToastUtils.show(message || '입구 사진을 등록해주세요.');
        break;
      case 'stairInfo':
      case 'hasStairs':
      case 'entranceStairHeightLevel':
        ToastUtils.show(message || '계단 정보를 입력해주세요.');
        break;
      case 'hasElevator':
        ToastUtils.show(message || '엘리베이터 정보를 입력해주세요.');
        break;
      case 'elevatorPhotos':
        ToastUtils.show(message || '엘리베이터 사진을 등록해주세요.');
        break;
      case 'elevatorHasStairs':
      case 'elevatorStairHeightLevel':
      case 'elevatorStairInfo':
        ToastUtils.show(message || '엘리베이터 계단 정보를 입력해주세요.');
        break;
      case 'hasSlope':
        ToastUtils.show(message || '경사로 정보를 입력해주세요.');
        break;
      case 'doorTypes':
        ToastUtils.show(message || '출입문 종류를 선택해주세요.');
        break;
      default:
        ToastUtils.show(message || '필수 정보를 입력해주세요.');
    }
  }

  return (
    <LogParamsProvider params={{building_id: building.id}}>
      <ScreenLayout isHeaderVisible={true}>
        <ScrollView
          ref={scrollView}
          stickyHeaderIndices={[0]}
          onScroll={e => {
            const y = e.nativeEvent.contentOffset.y;
            const scrollNavigationHeight = 60;
            // 엘리베이터 정보 섹션 하단이 짧을 때 눌러도 active menu가 안 바뀌는 문제가 있어 매직넘버로 대응...
            setScrollY(y + scrollNavigationHeight + 30);
          }}
          scrollEventThrottle={100}>
          <StickyScrollNavigation
            scrollContainer={scrollView}
            scrollY={scrollY}
            menus={[
              {label: '건물 입구 정보', ref: buildingEntranceSection},
              {label: '엘리베이터 정보', ref: elevatorSection},
            ]}
          />
          <SafeAreaWrapper edges={['bottom']}>
            <FormProvider {...form}>
              <HeaderSection place={place} building={building} />
              <S.SectionSeparator />
              <View ref={buildingEntranceSection} collapsable={false}>
                <EnteranceSection />
                <S.SectionSeparatorLine />
              </View>
              <View ref={elevatorSection} collapsable={false}>
                <ElevatorSection />
              </View>
              <S.SectionSeparator />
              <CommentsSection />
              <S.SubmitButtonWrapper>
                <SccButton
                  text="등록하기"
                  buttonColor="blue50"
                  onPress={submit}
                  elementName="building_form_submit"
                />
              </S.SubmitButtonWrapper>
            </FormProvider>
          </SafeAreaWrapper>
        </ScrollView>
      </ScreenLayout>
    </LogParamsProvider>
  );
}

async function register(
  api: DefaultApi,
  queryClient: ReturnType<typeof useQueryClient>,
  placeId: string,
  buildingId: string,
  values: FormValues,
) {
  try {
    const enteranceImages = await ImageFileUtils.uploadImages(
      api,
      values.enterancePhotos,
    );
    const elevatorImages = await ImageFileUtils.uploadImages(
      api,
      values.elevatorPhotos,
    );
    try {
      const res = await api.registerBuildingAccessibilityPost({
        buildingId,
        entranceStairInfo: values.hasStairs ? values.stairInfo : StairInfo.None,
        entranceStairHeightLevel: values.entranceStairHeightLevel,
        entranceDoorTypes: values.doorTypes,
        hasSlope: values.hasSlope || false,
        entranceImageUrls: enteranceImages,
        hasElevator: values.hasElevator || false,
        elevatorStairInfo: values.hasElevator
          ? values.elevatorHasStairs
            ? values.elevatorStairInfo
            : StairInfo.None
          : StairInfo.Undefined,
        elevatorImageUrls: elevatorImages,
        elevatorStairHeightLevel: values.elevatorStairHeightLevel,
        comment: values.comment || undefined,
      });

      // PlaceDetailScreen 접근성 정보 갱신
      queryClient.invalidateQueries({
        queryKey: ['PlaceDetail', placeId, 'Accessibility'],
      });
      queryClient.invalidateQueries({
        queryKey: ['PlaceDetailV2', placeId, 'Accessibility'],
      });

      // PlaceDetailScreen 전체 데이터 갱신
      queryClient.invalidateQueries({
        queryKey: ['PlaceDetail', placeId],
      });
      queryClient.invalidateQueries({
        queryKey: ['PlaceDetailV2', placeId],
      });

      // Asynchronously update search cache with full latest data
      updateSearchCacheForPlaceAsync(api, queryClient, placeId);

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
  } catch (error: any) {
    Logger.logError(error);
    ToastUtils.show('사진 업로드를 실패했습니다.');
    return {
      success: false,
    };
  }
}
