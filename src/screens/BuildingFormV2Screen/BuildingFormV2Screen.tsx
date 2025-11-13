import {useQueryClient} from '@tanstack/react-query';
import {useAtom, useSetAtom} from 'jotai';
import {throttle} from 'lodash';
import React, {useMemo} from 'react';
import {Controller, FormProvider, useForm} from 'react-hook-form';
import {Image, ScrollView, View} from 'react-native';

import {loadingState} from '@/components/LoadingView';
import {SccButton} from '@/components/atoms';
import {MAX_NUMBER_OF_TAKEN_PHOTOS} from '@/constant/constant';
import {font} from '@/constant/font';
import {makeDoorTypeOptions} from '@/constant/options';
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
import Logger from '@/logging/Logger';
import ImageFile from '@/models/ImageFile';
import {ScreenProps} from '@/navigation/Navigation.screens';
import ImageFileUtils from '@/utils/ImageFileUtils';
import ToastUtils from '@/utils/ToastUtils';

import {SafeAreaWrapper} from '@/components/SafeAreaWrapper';
import {ScreenLayout} from '@/components/ScreenLayout';
import OptionsV2 from '../PlaceFormV2Screen/components/OptionsV2';
import PhotosV2 from '../PlaceFormV2Screen/components/PhotosV2';
import TextAreaV2 from '../PlaceFormV2Screen/components/TextAreaV2';
import PlaceInfoSection from '../PlaceReviewFormScreen/sections/PlaceInfoSection';
import {pushItemsAtom} from '../SearchScreen/atoms/quest';
import * as S from './BuildingFormV2Screen.style';

export interface BuildingFormV2ScreenParams {
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

export default function BuildingFormV2Screen({
  route,
  navigation,
}: ScreenProps<'BuildingForm'>) {
  const {place, building} = route.params;
  const form = useForm<FormValues>();
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
        const isPreviousPlaceDetail = previousRoute?.name === 'PlaceDetail';

        if (isPreviousPlaceDetail) {
          // 이전 화면이 PlaceDetail인 경우: 기존 로직 유지
          // BuildingForm 을 없애고 PlaceDetail로 이동
          navigation.pop(1);
          // PlaceDetail에서 장소 등록 완료 모달을 열어주기
          navigation.replace('PlaceDetail', {
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
          navigation.navigate('PlaceDetail', {
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
      <FormProvider {...form}>
        <ScreenLayout isHeaderVisible={true}>
          <ScrollView>
            <SafeAreaWrapper edges={['bottom']}>
              <PlaceInfoSection
                target="building"
                name={place.name}
                address={place.name + '가 있는 건물'}
              />
              <S.SectionSeparator />
              <S.FormContainer>
                {/* 건물 입구 정보 */}
                <S.SubSection>
                  <S.QuestionSection>
                    <S.SectionLabel>건물입구정보</S.SectionLabel>
                    <S.QuestionText>건물 입구 사진을 찍어주세요</S.QuestionText>
                  </S.QuestionSection>
                  <Controller
                    name="enterancePhotos"
                    rules={{required: true}}
                    render={({field}) => (
                      <PhotosV2
                        value={field.value ?? []}
                        onChange={field.onChange}
                        target="building"
                        maxPhotos={MAX_NUMBER_OF_TAKEN_PHOTOS}
                      />
                    )}
                  />
                </S.SubSection>

                <S.SubSection>
                  <S.Label>건물 입구에 계단이 있나요?</S.Label>
                  <Controller
                    name="hasStairs"
                    rules={{validate: v => typeof v === 'boolean'}}
                    render={({field}) => (
                      <OptionsV2
                        value={field.value}
                        options={[
                          {label: '있어요', value: true},
                          {label: '없어요', value: false},
                        ]}
                        onSelect={field.onChange}
                      />
                    )}
                  />
                  {form.watch('hasStairs') && (
                    <Controller
                      name="stairInfo"
                      rules={{required: true}}
                      render={({field}) => (
                        <OptionsV2
                          value={field.value}
                          columns={3}
                          options={[
                            {label: '1칸', value: StairInfo.One},
                            {label: '2-5칸', value: StairInfo.TwoToFive},
                            {label: '6칸 이상', value: StairInfo.OverSix},
                          ]}
                          onSelect={field.onChange}
                        />
                      )}
                    />
                  )}
                </S.SubSection>

                {form.watch('hasStairs') &&
                  form.watch('stairInfo') === StairInfo.One && (
                    <S.SubSection>
                      <S.Label>계단 1칸의 높이를 알려주세요</S.Label>
                      <S.MeasureGuide>
                        <Image
                          source={require('@/assets/img/stair_thumb.jpg')}
                          style={{width: '100%', height: '100%'}}
                        />
                      </S.MeasureGuide>
                      <View style={{gap: 16}}>
                        <Controller
                          name="entranceStairHeightLevel"
                          rules={{required: true}}
                          render={({field}) => (
                            <OptionsV2
                              value={field.value}
                              options={[
                                {
                                  label: '엄지 한마디',
                                  value: StairHeightLevel.HalfThumb,
                                },
                                {
                                  label: '엄지 손가락',
                                  value: StairHeightLevel.Thumb,
                                },
                                {
                                  label: '엄지 손가락 이상',
                                  value: StairHeightLevel.OverThumb,
                                },
                              ]}
                              onSelect={field.onChange}
                            />
                          )}
                        />
                      </View>
                    </S.SubSection>
                  )}

                <S.SubSection>
                  <S.Label>건물 입구에 경사로가 있나요?</S.Label>
                  <Controller
                    name="hasSlope"
                    rules={{validate: v => typeof v === 'boolean'}}
                    render={({field}) => (
                      <OptionsV2
                        value={field.value}
                        options={[
                          {label: '있어요', value: true},
                          {label: '없어요', value: false},
                        ]}
                        onSelect={field.onChange}
                      />
                    )}
                  />
                </S.SubSection>

                <S.SubSection>
                  <S.Label>출입문은 어떤 종류인가요?</S.Label>
                  <Controller
                    name="doorTypes"
                    rules={{required: true}}
                    render={({field}) => (
                      <OptionsV2.Multiple
                        values={field.value}
                        columns={3}
                        options={makeDoorTypeOptions(
                          form.watch('doorTypes') ?? [],
                        )}
                        onSelect={field.onChange}
                      />
                    )}
                  />
                </S.SubSection>

                {/* 의견 추가 */}
                <S.SubSection>
                  <S.Label>더 도움이 될 정보가 있다면 알려주세요</S.Label>
                  <Controller
                    name="comment"
                    render={({field}) => (
                      <TextAreaV2
                        placeholder="예시) 후문에는 계단이 없어 편하게 갈 수 있습니다 (최대 100자)"
                        value={field.value}
                        onChangeText={field.onChange}
                      />
                    )}
                  />
                </S.SubSection>

                {/* 엘리베이터 정보 */}
                <S.SubSection>
                  <S.QuestionSection>
                    <S.SectionLabel>엘리베이터 정보</S.SectionLabel>
                    <S.QuestionText>건물에 엘리베이터가 있나요?</S.QuestionText>
                  </S.QuestionSection>
                  <Controller
                    name="hasElevator"
                    rules={{validate: v => typeof v === 'boolean'}}
                    render={({field}) => (
                      <OptionsV2
                        value={field.value}
                        options={[
                          {label: '있어요', value: true},
                          {label: '없어요', value: false},
                        ]}
                        onSelect={field.onChange}
                      />
                    )}
                  />
                </S.SubSection>

                {form.watch('hasElevator') && (
                  <>
                    <S.SubSection>
                      <S.Label>엘리베이터 사진을 찍어주세요</S.Label>
                      <Controller
                        name="elevatorPhotos"
                        rules={{required: true}}
                        render={({field}) => (
                          <PhotosV2
                            value={field.value ?? []}
                            onChange={field.onChange}
                            target="building"
                            maxPhotos={MAX_NUMBER_OF_TAKEN_PHOTOS}
                          />
                        )}
                      />
                    </S.SubSection>

                    <S.SubSection>
                      <S.Label>엘리베이터까지 가는 길에 계단이 있나요?</S.Label>
                      <Controller
                        name="elevatorHasStairs"
                        rules={{validate: v => typeof v === 'boolean'}}
                        render={({field}) => (
                          <OptionsV2
                            value={field.value}
                            options={[
                              {label: '있어요', value: true},
                              {label: '없어요', value: false},
                            ]}
                            onSelect={field.onChange}
                          />
                        )}
                      />
                      {form.watch('elevatorHasStairs') && (
                        <Controller
                          name="elevatorStairInfo"
                          rules={{required: true}}
                          render={({field}) => (
                            <OptionsV2
                              value={field.value}
                              columns={3}
                              options={[
                                {label: '1칸', value: StairInfo.One},
                                {label: '2-5칸', value: StairInfo.TwoToFive},
                                {label: '6칸 이상', value: StairInfo.OverSix},
                              ]}
                              onSelect={field.onChange}
                            />
                          )}
                        />
                      )}
                    </S.SubSection>

                    {form.watch('elevatorHasStairs') &&
                      form.watch('elevatorStairInfo') === StairInfo.One && (
                        <S.SubSection>
                          <S.Label>계단 1칸의 높이를 알려주세요</S.Label>
                          <S.MeasureGuide>
                            <Image
                              source={require('@/assets/img/stair_thumb.jpg')}
                              style={{width: '100%', height: '100%'}}
                            />
                          </S.MeasureGuide>
                          <View style={{gap: 16}}>
                            <Controller
                              name="elevatorStairHeightLevel"
                              rules={{required: true}}
                              render={({field}) => (
                                <OptionsV2
                                  value={field.value}
                                  options={[
                                    {
                                      label: '엄지 한마디',
                                      value: StairHeightLevel.HalfThumb,
                                    },
                                    {
                                      label: '엄지 손가락',
                                      value: StairHeightLevel.Thumb,
                                    },
                                    {
                                      label: '엄지 손가락 이상',
                                      value: StairHeightLevel.OverThumb,
                                    },
                                  ]}
                                  onSelect={field.onChange}
                                />
                              )}
                            />
                          </View>
                        </S.SubSection>
                      )}
                  </>
                )}
              </S.FormContainer>
            </SafeAreaWrapper>
          </ScrollView>
          <S.SubmitButtonWrapper>
            <SccButton
              text="등록하기"
              buttonColor="brandColor"
              fontFamily={font.pretendardMedium}
              onPress={submit}
              elementName="building_form_submit"
            />
          </S.SubmitButtonWrapper>
        </ScreenLayout>
      </FormProvider>
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

      // PlaceDetailScreen 전체 데이터 갱신
      queryClient.invalidateQueries({
        queryKey: ['PlaceDetail', placeId],
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
  } catch (error: any) {
    Logger.logError(error);
    ToastUtils.show('사진 업로드를 실패했습니다.');
    return {
      success: false,
    };
  }
}
