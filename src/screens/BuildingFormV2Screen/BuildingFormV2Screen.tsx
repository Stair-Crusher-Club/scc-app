import {useQueryClient} from '@tanstack/react-query';
import {useAtom, useSetAtom} from 'jotai';
import {throttle} from 'lodash';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Controller, FormProvider, useForm} from 'react-hook-form';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  View,
} from 'react-native';

import {loadingState} from '@/components/LoadingView';
import TabBar from '@/components/TabBar';
import {SccButton} from '@/components/atoms';
import {MAX_NUMBER_OF_TAKEN_PHOTOS} from '@/constant/constant';
import {font} from '@/constant/font';
import {makeDoorTypeOptions} from '@/constant/options';
import {
  Building,
  BuildingDoorDirectionTypeDto,
  DefaultApi,
  EntranceDoorType,
  Place,
  StairHeightLevel,
  StairInfo,
} from '@/generated-sources/openapi';
import useAppComponents from '@/hooks/useAppComponents';
import {useKeyboardVisible} from '@/hooks/useKeyboardVisible';
import {LogParamsProvider} from '@/logging/LogParamsProvider';
import Logger from '@/logging/Logger';
import ImageFile from '@/models/ImageFile';
import {ScreenProps} from '@/navigation/Navigation.screens';
import ImageFileUtils from '@/utils/ImageFileUtils';
import {updateSearchCacheForPlaceAsync} from '@/utils/SearchPlacesUtils';
import ToastUtils from '@/utils/ToastUtils';

import {SafeAreaWrapper} from '@/components/SafeAreaWrapper';
import {ScreenLayout} from '@/components/ScreenLayout';
import FormQuestion from '../PlaceFormV2Screen/components/FormQuestion';
import {
  HeaderBorder,
  SectionSeparator,
} from '../PlaceFormV2Screen/components/FormStyles';
import GuideLink from '../PlaceFormV2Screen/components/GuideLink';
import MeasureGuide from '../PlaceFormV2Screen/components/MeasureGuide';
import OptionsV2 from '../PlaceFormV2Screen/components/OptionsV2';
import PhotosV2 from '../PlaceFormV2Screen/components/PhotosV2';
import TextAreaV2 from '../PlaceFormV2Screen/components/TextAreaV2';
import {formImages} from '../PlaceFormV2Screen/constants';
import PlaceInfoSection from '../PlaceReviewFormScreen/sections/PlaceInfoSection';
import {pushItemsAtom} from '../SearchScreen/atoms/quest';

type TabType = 'entrance' | 'elevator';

const tabItems = [
  {label: '건물 입구 정보', value: 'entrance' as TabType},
  {label: '엘리베이터 정보', value: 'elevator' as TabType},
];

export interface BuildingFormV2ScreenParams {
  place: Place;
  building: Building;
}

interface FormValues {
  entranceDirection: string;
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
  const [currentTab, setCurrentTab] = useState<TabType>('entrance');
  const isKeyboardVisible = useKeyboardVisible();

  const scrollViewRef = useRef<ScrollView>(null);
  const entranceRef = useRef<View>(null);
  const elevatorRef = useRef<View>(null);

  const entranceY = useRef<number>(0);
  const elevatorY = useRef<number>(0);
  const isScrollingToSection = useRef<boolean>(false);

  // Watch all required fields
  const entranceDirection = form.watch('entranceDirection');
  const enterancePhotos = form.watch('enterancePhotos');
  const hasStairs = form.watch('hasStairs');
  const stairInfo = form.watch('stairInfo');
  const entranceStairHeightLevel = form.watch('entranceStairHeightLevel');
  const hasSlope = form.watch('hasSlope');
  const doorTypes = form.watch('doorTypes');
  const hasElevator = form.watch('hasElevator');
  const elevatorPhotos = form.watch('elevatorPhotos');
  const elevatorHasStairs = form.watch('elevatorHasStairs');
  const elevatorStairInfo = form.watch('elevatorStairInfo');
  const elevatorStairHeightLevel = form.watch('elevatorStairHeightLevel');

  // Reset elevator related fields when hasElevator changes to false
  useEffect(() => {
    if (hasElevator === false) {
      form.setValue('elevatorPhotos', undefined as any);
      form.setValue('elevatorHasStairs', undefined as any);
      form.setValue('elevatorStairInfo', undefined as any);
      form.setValue('elevatorStairHeightLevel', undefined as any);
    }
  }, [hasElevator, form]);

  // Reset entrance stair related fields when hasStairs changes to false
  useEffect(() => {
    if (hasStairs === false) {
      form.setValue('stairInfo', undefined as any);
      form.setValue('entranceStairHeightLevel', undefined as any);
    }
  }, [hasStairs, form]);

  // Reset elevator stair related fields when elevatorHasStairs changes to false
  useEffect(() => {
    if (elevatorHasStairs === false) {
      form.setValue('elevatorStairInfo', undefined as any);
      form.setValue('elevatorStairHeightLevel', undefined as any);
    }
  }, [elevatorHasStairs, form]);

  // Reset entrance stair height when stairInfo is not One
  useEffect(() => {
    if (stairInfo && stairInfo !== StairInfo.One) {
      form.setValue('entranceStairHeightLevel', undefined as any);
    }
  }, [stairInfo, form]);

  // Reset elevator stair height when elevatorStairInfo is not One
  useEffect(() => {
    if (elevatorStairInfo && elevatorStairInfo !== StairInfo.One) {
      form.setValue('elevatorStairHeightLevel', undefined as any);
    }
  }, [elevatorStairInfo, form]);

  // Check if all required fields are filled
  const isFormValid = (() => {
    // 출입구 방향은 필수
    if (!entranceDirection) {
      return false;
    }

    // 입구 사진은 필수
    if (!enterancePhotos || enterancePhotos.length === 0) {
      return false;
    }

    // 계단 여부는 필수 (boolean)
    if (typeof hasStairs !== 'boolean') {
      return false;
    }

    // 계단이 있을 경우 계단 정보 필수
    if (hasStairs && !stairInfo) {
      return false;
    }

    // 계단이 1칸일 경우 높이 정보 필수
    if (hasStairs && stairInfo === StairInfo.One && !entranceStairHeightLevel) {
      return false;
    }

    // 경사로 여부는 필수 (boolean)
    if (typeof hasSlope !== 'boolean') {
      return false;
    }

    // 출입문 종류는 필수
    if (!doorTypes || doorTypes.length === 0) {
      return false;
    }

    // 엘리베이터 여부는 필수 (boolean)
    if (typeof hasElevator !== 'boolean') {
      return false;
    }

    // 엘리베이터가 있을 경우 추가 검증
    if (hasElevator) {
      // 엘리베이터 사진은 필수
      if (!elevatorPhotos || elevatorPhotos.length === 0) {
        return false;
      }

      // 엘리베이터 계단 여부는 필수 (boolean)
      if (typeof elevatorHasStairs !== 'boolean') {
        return false;
      }

      // 계단이 있을 경우 계단 정보 필수
      if (elevatorHasStairs && !elevatorStairInfo) {
        return false;
      }

      // 계단이 1칸일 경우 높이 정보 필수
      if (
        elevatorHasStairs &&
        elevatorStairInfo === StairInfo.One &&
        !elevatorStairHeightLevel
      ) {
        return false;
      }
    }
    return true;
  })();

  // Measure section positions on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      entranceRef.current?.measureLayout(
        scrollViewRef.current as any,
        (_x, y) => {
          entranceY.current = y - 50;
        },
        () => {},
      );
      elevatorRef.current?.measureLayout(
        scrollViewRef.current as any,
        (_x, y) => {
          elevatorY.current = y - 50;
        },
        () => {},
      );
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const updateTabBasedOnScroll = useMemo(
    () =>
      throttle(
        (scrollY: number, contentHeight: number, layoutHeight: number) => {
          // Check if scrolled to bottom
          const isAtBottom = scrollY + layoutHeight >= contentHeight - 50;

          // Determine which section is currently visible
          if (scrollY < elevatorY.current - 100 && !isAtBottom) {
            if (currentTab !== 'entrance') {
              setCurrentTab('entrance');
            }
          } else {
            if (currentTab !== 'elevator') {
              setCurrentTab('elevator');
            }
          }
        },
        100,
      ),
    [currentTab],
  );

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isScrollingToSection.current) {
      return;
    }

    const scrollY = event.nativeEvent.contentOffset.y;
    const contentHeight = event.nativeEvent.contentSize.height;
    const layoutHeight = event.nativeEvent.layoutMeasurement.height;

    if (typeof scrollY !== 'number') {
      return;
    }

    updateTabBasedOnScroll(scrollY, contentHeight, layoutHeight);
  };

  const handleTabChange = (tab: TabType) => {
    setCurrentTab(tab);
    isScrollingToSection.current = true;

    const targetY = tab === 'entrance' ? entranceY.current : elevatorY.current;
    scrollViewRef.current?.scrollTo({y: targetY, animated: true});

    setTimeout(() => {
      isScrollingToSection.current = false;
    }, 500);
  };

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

        // 등록 완료 화면으로 이동
        navigation.navigate('RegistrationComplete', {
          target: 'building',
          placeInfo: {
            place,
            building,
          },
        });
      }, 1000),
    [api, place, building, navigation, loading, setLoading],
  );

  function noticeError(errorKey: keyof FormValues, message?: string) {
    switch (errorKey) {
      case 'entranceDirection':
        ToastUtils.show(message || '출입구 방향을 선택해주세요.');
        break;
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
          <HeaderBorder />
          <ScrollView
            ref={scrollViewRef}
            stickyHeaderIndices={[2]}
            onScroll={handleScroll}
            scrollEventThrottle={16}>
            <PlaceInfoSection
              target="building"
              name={place.name}
              address={place.name + ' 장소가 있는 건물'}
            />
            <SectionSeparator />
            <View className="bg-white">
              <TabBar
                items={tabItems}
                current={currentTab}
                onChange={handleTabChange}
              />
            </View>
            <View className="bg-white py-[40px] px-[20px] gap-[20px]">
              {/* 건물 입구 정보 */}
              <View
                ref={entranceRef}
                collapsable={false}
                className="gap-[48px]">
                <FormQuestion
                  label="건물입구정보"
                  question="건물의 출입구가 어느 방향에 있나요?">
                  <Controller
                    name="entranceDirection"
                    rules={{required: true}}
                    render={({field}) => (
                      <OptionsV2
                        value={field.value}
                        options={[
                          {label: '도로 방향 문', value: 'road'},
                          {label: '주차장 쪽 연결 문', value: 'parking'},
                          {label: '기타', value: 'etc'},
                        ]}
                        onSelect={field.onChange}
                      />
                    )}
                  />
                </FormQuestion>

                <FormQuestion question="건물 입구 사진을 찍어주세요">
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
                </FormQuestion>

                <FormQuestion question="건물 입구에 계단이 있나요?">
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
                  <GuideLink
                    type="stairs"
                    elementName="building_entrance_stair_guide"
                  />
                </FormQuestion>

                {form.watch('hasStairs') &&
                  form.watch('stairInfo') === StairInfo.One && (
                    <FormQuestion question="계단 1칸의 높이를 알려주세요">
                      <MeasureGuide source={formImages.stair} />
                      <View className="gap-[16px]">
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
                    </FormQuestion>
                  )}

                <FormQuestion question="건물 입구에 경사로가 있나요?">
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
                  <GuideLink
                    type="slope"
                    elementName="building_entrance_slope_guide"
                  />
                </FormQuestion>

                <FormQuestion question="출입문은 어떤 종류인가요?">
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
                </FormQuestion>

                {/* 의견 추가 */}
                <FormQuestion question="더 도움이 될 정보가 있다면 알려주세요">
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
                </FormQuestion>
              </View>

              {/* 엘리베이터 정보 */}
              <View
                ref={elevatorRef}
                collapsable={false}
                className="gap-[48px] mt-[80px]">
                <FormQuestion
                  label="엘리베이터 정보"
                  question="건물에 엘리베이터가 있나요?">
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
                </FormQuestion>

                {form.watch('hasElevator') && (
                  <>
                    <FormQuestion question="엘리베이터 사진을 찍어주세요">
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
                    </FormQuestion>

                    <FormQuestion question="엘리베이터까지 가는 길에 계단이 있나요?">
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
                    </FormQuestion>

                    {form.watch('elevatorHasStairs') &&
                      form.watch('elevatorStairInfo') === StairInfo.One && (
                        <FormQuestion question="계단 1칸의 높이를 알려주세요">
                          <MeasureGuide source={formImages.stair} />
                          <View className="gap-[16px]">
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
                        </FormQuestion>
                      )}
                  </>
                )}
              </View>
            </View>
          </ScrollView>
          <SafeAreaWrapper edges={isKeyboardVisible ? [] : ['bottom']}>
            <View className="bg-white py-[12px] px-[20px] border-t border-gray-15">
              <SccButton
                text="등록하기"
                buttonColor="brandColor"
                fontFamily={font.pretendardMedium}
                onPress={submit}
                elementName="building_form_submit"
                isDisabled={!isFormValid}
              />
            </View>
          </SafeAreaWrapper>
        </ScreenLayout>
      </FormProvider>
    </LogParamsProvider>
  );
}

function mapEntranceDirectionToDoorDirectionType(
  entranceDirection: string,
): BuildingDoorDirectionTypeDto {
  switch (entranceDirection) {
    case 'road':
      return BuildingDoorDirectionTypeDto.RoadDirection;
    case 'parking':
      return BuildingDoorDirectionTypeDto.ParkingDirection;
    case 'etc':
      return BuildingDoorDirectionTypeDto.Etc;
    default:
      return BuildingDoorDirectionTypeDto.Etc;
  }
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
      const res = await api.registerBuildingAccessibilityV2Post({
        buildingId,
        doorDirectionType: mapEntranceDirectionToDoorDirectionType(
          values.entranceDirection,
        ),
        entranceStairInfo: values.hasStairs ? values.stairInfo : StairInfo.None,
        entranceStairHeightLevel: values.entranceStairHeightLevel,
        entranceDoorTypes: values.doorTypes,
        hasSlope: values.hasSlope || false,
        entranceImageUrls: enteranceImages,
        hasElevator: values.hasElevator || false,
        elevatorAccessibility: values.hasElevator
          ? {
              imageUrls: elevatorImages,
              stairInfo: values.elevatorHasStairs
                ? values.elevatorStairInfo
                : StairInfo.None,
              stairHeightLevel: values.elevatorStairHeightLevel,
            }
          : undefined,
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
