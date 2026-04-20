import {
  placeFormV2GuideDismissedAtom,
  placeFormV2GuideDismissedUntilAtom,
} from '@/atoms/User';
import {ScreenLayout} from '@/components/ScreenLayout';
import {UploadProgressOverlay} from '@/components/UploadProgressOverlay';
import {
  useImageUploadWithProgress,
  UploadImagesFn,
} from '@/hooks/useImageUploadWithProgress';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {
  Building,
  EntranceDoorType,
  FloorMovingMethodTypeDto,
  Place,
  PlaceDoorDirectionTypeDto,
  RegisterPlaceAccessibilityRequestDtoV2,
  StairHeightLevel,
  StairInfo,
} from '@/generated-sources/openapi';
import useAppComponents from '@/hooks/useAppComponents';
import {useFormExitConfirm} from '@/hooks/useFormExitConfirm';
import usePost from '@/hooks/usePost';
import Logger from '@/logging/Logger';
import {LogParamsProvider} from '@/logging/LogParamsProvider';
import FormExitConfirmBottomSheet from '@/modals/FormExitConfirmBottomSheet';
import ImageFile from '@/models/ImageFile';
import {ScreenProps} from '@/navigation/Navigation.screens';
import {updateSearchCacheForPlaceAsync} from '@/utils/SearchPlacesUtils';
import ToastUtils from '@/utils/ToastUtils';
import {useBackHandler} from '@react-native-community/hooks';
import {useQueryClient} from '@tanstack/react-query';
import {useAtom, useSetAtom} from 'jotai';
import {ReactElement, useEffect, useMemo, useState} from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import styled from 'styled-components/native';
import {BuildingRegistrationEvent} from '../PlaceDetailV2Screen/constants';
import {pushItemsAtom} from '../SearchScreen/atoms/quest';
import FloorMovementStep from './components/FloorMovementStep';
import FloorStep from './components/FloorStep';
import GuideModal from './components/GuideModal';
import InfoStep from './components/InfoStep';
import {GUIDE_CONTENTS} from './constants';
import {getFloorConditions, computeFloors} from './hooks';
import type {FloorOptionKey, StandaloneBuildingType} from './types';

export interface PlaceFormV2ScreenParams {
  place: Place;
  building: Building;
}

type BuildingDoorDirectionType = 'inside' | 'outside';

type Step = 'floor' | 'info' | 'floorMovement';

const STEPS: Step[] = ['floor', 'info', 'floorMovement'];

// Form values for the entire PlaceFormV2
interface PlaceFormV2Values {
  // Floor step data
  floorOption: FloorOptionKey | null;
  standaloneType: StandaloneBuildingType | null;
  selectedFloor: number | undefined;

  // Info step data
  doorDirection: BuildingDoorDirectionType;
  entrancePhotos: ImageFile[];
  hasStairs: boolean;
  stairInfo: StairInfo;
  entranceStairHeightLevel: StairHeightLevel;
  hasSlope: boolean;
  doorType: EntranceDoorType[];
  additionalInfo: string[];
  comment: string | undefined;

  // Floor movement step data
  floorMovementMethod: FloorMovingMethodTypeDto[];
  elevatorPhotos: ImageFile[];
  elevatorHasStairs: boolean;
  elevatorStairInfo: StairInfo;
  elevatorStairHeightLevel: StairHeightLevel;
  elevatorHasSlope: boolean;
  floorMovementComment: string | undefined;
}

export default function PlaceFormV2Screen({
  route,
  navigation,
}: ScreenProps<'PlaceFormV2'>) {
  const {place, building} = route.params;
  const {api} = useAppComponents();
  const queryClient = useQueryClient();
  const pushItems = useSetAtom(pushItemsAtom);

  const {uploadImages, uploadProgress} = useImageUploadWithProgress();
  const [stepIndex, setStepIndex] = useState(0);

  // 뒤로가기 confirm
  const formExitConfirm = useFormExitConfirm(action => {
    navigation.dispatch(action);
  });

  const form = useForm<PlaceFormV2Values>();
  const step = STEPS[stepIndex];

  // form.watch()로 값 읽기
  const selectedOption = form.watch('floorOption');
  const selectedStandaloneType = form.watch('standaloneType');
  const selectedFloor = form.watch('selectedFloor');
  const doorDirection = form.watch('doorDirection');

  // Guide 모달 표시 여부
  const [isGuideModalVisible, setIsGuideModalVisible] = useState(false);

  // Guide 모달 "다시보지않기" 상태 (읽기/쓰기)
  const [guideDismissed, setGuideDismissed] = useAtom(
    placeFormV2GuideDismissedAtom,
  );

  // Guide 모달 "확인했어요" 상태 (1일간 안 보기 - timestamp)
  const [guideDismissedUntil, setGuideDismissedUntil] = useAtom(
    placeFormV2GuideDismissedUntilAtom,
  );

  // 현재 선택에 따른 Guide 모달 키 결정
  const guideKey = (() => {
    if (selectedOption === 'standalone') {
      if (selectedStandaloneType === 'singleFloor') {
        return 'standaloneSingleFloor';
      }
      if (selectedStandaloneType === 'multipleFloors') {
        return 'standaloneMultipleFloors';
      }
      return null;
    }
    return selectedOption;
  })();

  // Guide 모달 표시 여부 확인
  const shouldShowGuide = (() => {
    if (!guideKey) return false;

    // 영구적으로 차단된 경우
    const isPermanentlyDismissed = (() => {
      switch (guideKey) {
        case 'firstFloor':
          return guideDismissed.firstFloor;
        case 'otherFloor':
          return guideDismissed.otherFloor;
        case 'multipleFloors':
          return guideDismissed.multipleFloors;
        case 'standaloneSingleFloor':
          return guideDismissed.standaloneSingleFloor;
        case 'standaloneMultipleFloors':
          return guideDismissed.standaloneMultipleFloors;
        default:
          return false;
      }
    })();

    if (isPermanentlyDismissed) return false;

    // 1일간 안 보기 체크
    const dismissedUntilTimestamp = (() => {
      switch (guideKey) {
        case 'firstFloor':
          return guideDismissedUntil.firstFloor;
        case 'otherFloor':
          return guideDismissedUntil.otherFloor;
        case 'multipleFloors':
          return guideDismissedUntil.multipleFloors;
        case 'standaloneSingleFloor':
          return guideDismissedUntil.standaloneSingleFloor;
        case 'standaloneMultipleFloors':
          return guideDismissedUntil.standaloneMultipleFloors;
        default:
          return null;
      }
    })();

    if (dismissedUntilTimestamp && Date.now() < dismissedUntilTimestamp) {
      return false;
    }

    return true;
  })();

  // guideKey에 따른 가이드 콘텐츠 가져오기
  const guideContent = useMemo(() => {
    if (!guideKey) return GUIDE_CONTENTS.firstFloor;
    return GUIDE_CONTENTS[guideKey] || GUIDE_CONTENTS.firstFloor;
  }, [guideKey]);

  // 단독건물 선택 후 다른 옵션으로 변경하면 단독건물 타입 초기화
  useEffect(() => {
    if (selectedOption !== 'standalone') {
      form.setValue('standaloneType', null);
    }
  }, [selectedOption, form]);

  // "아니요, 다른층이에요" 선택 후 다른 옵션으로 변경하면 층 정보 초기화
  useEffect(() => {
    if (selectedOption !== 'otherFloor') {
      form.setValue('selectedFloor', undefined);
    }
  }, [selectedOption, form]);

  const submitMutation = usePost(
    ['PlaceFormV2', 'Submit'],
    async ({
      values,
      uploaded,
    }: {
      values: PlaceFormV2Values;
      uploaded: UploadedPhotos;
    }) =>
      submitRegistration(
        api,
        queryClient,
        place.id,
        values,
        selectedOption,
        selectedStandaloneType,
        selectedFloor,
        doorDirection,
        uploaded,
      ),
  );

  const handleSubmit = async () => {
    if (submitMutation.isPending) {
      return;
    }
    const values = form.getValues();

    let uploaded: UploadedPhotos;
    try {
      uploaded = await uploadAllPhotos(
        api,
        values,
        selectedOption,
        selectedStandaloneType,
        uploadImages,
      );
    } catch {
      ToastUtils.show('사진 업로드를 실패했습니다.');
      return;
    }

    const registered = await submitMutation.mutateAsync({values, uploaded});

    if (!registered.success) {
      return;
    }

    if (registered.data) {
      pushItems(registered.data);
    }

    // Navigate to completion screen
    const event = getEvent(selectedOption, doorDirection);
    navigation.navigate('RegistrationComplete', {
      target: 'place',
      event,
      placeInfo: {
        place,
        building,
      },
    });
  };

  // 다음 단계로 이동
  const handleNext = () => {
    if (step === 'floor') {
      // floor에서 다음으로: guide가 필요하면 모달 표시
      if (shouldShowGuide) {
        setIsGuideModalVisible(true);
        return;
      }

      // floor에서는 항상 info로
      const infoIndex = STEPS.indexOf('info');
      if (infoIndex !== -1) {
        setStepIndex(infoIndex);
      }
    } else {
      // 다른 step에서는 순차적으로 다음으로
      setStepIndex(prev => Math.min(prev + 1, STEPS.length - 1));
    }
  };

  // 이전 단계로 이동
  const handleBack = () => {
    // guide 모달이 열려있으면 모달 닫기
    if (isGuideModalVisible) {
      setIsGuideModalVisible(false);
      return;
    }

    // 입력한 정보를 유지한 채로 이전 단계로 이동
    setStepIndex(prev => Math.max(prev - 1, 0));
  };

  // InfoStep에서 다음 버튼 핸들러
  const handleInfoSubmit = () => {
    // floorMovement 단계가 필요한지 확인
    const {showFloorMovement} = getFloorConditions({
      floorOption: selectedOption,
      standaloneType: selectedStandaloneType,
    });

    if (showFloorMovement) {
      const floorMovementIndex = STEPS.indexOf('floorMovement');
      if (floorMovementIndex !== -1) {
        setStepIndex(floorMovementIndex);
      }
    } else {
      // floorMovement가 필요없으면 바로 제출
      handleSubmit();
    }
  };

  // "다시보지 않기" 버튼 핸들러
  const handleDismissPermanently = () => {
    if (!guideKey) return;

    setGuideDismissed(prev => {
      switch (guideKey) {
        case 'firstFloor':
          return {...prev, firstFloor: true};
        case 'otherFloor':
          return {...prev, otherFloor: true};
        case 'multipleFloors':
          return {...prev, multipleFloors: true};
        case 'standaloneSingleFloor':
          return {...prev, standaloneSingleFloor: true};
        case 'standaloneMultipleFloors':
          return {...prev, standaloneMultipleFloors: true};
        default:
          return prev;
      }
    });

    // 모달 닫고 info로 이동
    setIsGuideModalVisible(false);
    const infoIndex = STEPS.indexOf('info');
    if (infoIndex !== -1) {
      setStepIndex(infoIndex);
    }
  };

  // "가이드 보기 >" 링크 핸들러: shouldShowGuide 체크 없이 무조건 모달 표시
  const handleOpenGuide = () => {
    setIsGuideModalVisible(true);
  };

  // "확인했어요!" 버튼 핸들러: 1일간 안 보기
  const handleConfirmGuide = () => {
    if (guideKey) {
      const oneDayFromNow = Date.now() + 24 * 60 * 60 * 1000;
      setGuideDismissedUntil(prev => ({...prev, [guideKey]: oneDayFromNow}));
    }
    // 모달 닫고 info로 이동
    setIsGuideModalVisible(false);
    const infoIndex = STEPS.indexOf('info');
    if (infoIndex !== -1) {
      setStepIndex(infoIndex);
    }
  };

  // 안드로이드 백 버튼 처리
  useBackHandler(() => {
    // guide 모달이 열려있으면 모달 닫기
    if (isGuideModalVisible) {
      handleBack();
      return true;
    }
    // 다른 step에서도 이전 step이 있으면 뒤로가기
    if (stepIndex > 0) {
      handleBack();
      return true;
    }

    // 첫 step에서는 기본 back 동작 허용 → usePreventRemove가 종료 확인 다이얼로그 표시
    return false;
  });

  const stepConfig: Record<Step, ReactElement> = {
    floor: <FloorStep place={place} onNext={handleNext} />,
    info: (
      <InfoStep
        place={place}
        isStandaloneBuilding={selectedOption === 'standalone'}
        hasFloorMovementStep={
          getFloorConditions({
            floorOption: selectedOption,
            standaloneType: selectedStandaloneType,
          }).showFloorMovement
        }
        onSubmit={handleInfoSubmit}
        onBack={handleBack}
        onGuidePress={handleOpenGuide}
      />
    ),
    floorMovement: (
      <FloorMovementStep
        place={place}
        isStandaloneBuilding={selectedOption === 'standalone'}
        onSubmit={handleSubmit}
        onBack={handleBack}
        onGuidePress={handleOpenGuide}
      />
    ),
  };

  return (
    <LogParamsProvider params={{place_id: place.id}}>
      <FormProvider {...form}>
        <ScreenLayout isHeaderVisible={true}>
          <HeaderBorder />
          {stepConfig[step]}
        </ScreenLayout>
        <GuideModal
          visible={isGuideModalVisible}
          guideContent={guideContent}
          onDismissPermanently={handleDismissPermanently}
          onConfirm={handleConfirmGuide}
          onRequestClose={handleBack}
        />
        <FormExitConfirmBottomSheet
          isVisible={formExitConfirm.isVisible}
          onConfirm={formExitConfirm.onConfirm}
          onCancel={formExitConfirm.onCancel}
        />
        <UploadProgressOverlay {...uploadProgress} />
      </FormProvider>
    </LogParamsProvider>
  );
}

export const HeaderBorder = styled.View({
  borderBottomWidth: 1,
  borderBottomColor: color.blue5,
});

export const SectionSeparator = styled.View({
  backgroundColor: color.gray10,
  height: 6,
});

// Common styled components shared across PlaceFormV2 and BuildingFormV2
export const SectionLabel = styled.Text({
  fontSize: 14,
  lineHeight: 20,
  fontFamily: font.pretendardBold,
  color: color.brand50,
  letterSpacing: -0.28,
});

export const QuestionSection = styled.View({
  gap: 8,
});

export const QuestionText = styled.Text({
  fontSize: 18,
  lineHeight: 26,
  fontFamily: font.pretendardSemibold,
  color: color.gray80,
  letterSpacing: -0.4,
});

export const SubSection = styled.View({
  gap: 20,
});

export const Label = styled.Text({
  fontSize: 18,
  lineHeight: 26,
  fontFamily: font.pretendardSemibold,
  color: color.gray80,
  letterSpacing: -0.4,
});

export const RequiredMark = styled.Text({
  color: 'red',
  fontSize: 18,
  lineHeight: 26,
  letterSpacing: -0.36,
});

export const MeasureGuide = styled.View({
  aspectRatio: '315/152',
  borderRadius: 8,
  overflow: 'hidden',
  borderWidth: 1,
  borderColor: color.gray20,
});

export const GuideButton = styled.View``;

export const GuideText = styled.Text`
  color: ${color.brandColor};
  font-size: 14px;
  font-family: ${font.pretendardMedium};
  text-align: right;
  letter-spacing: -0.28px;
`;

export const SubmitButtonWrapper = styled.View`
  background-color: ${color.white};
  padding-vertical: 12px;
  padding-horizontal: 20px;
  border-top-width: 1px;
  border-top-color: ${color.gray15};
  flex-direction: row;
  gap: 8px;
`;

export const OptionsGroup = styled.View`
  gap: 8px;
`;

export const Hint = styled.Text`
  font-size: 14px;
  line-height: 20px;
  font-family: ${font.pretendardRegular};
  color: ${color.gray45};
  letter-spacing: -0.28px;
`;

export const DoorDirectionContainer = styled.View`
  flex-direction: row;
  gap: 8px;
`;

export const DoorDirectionOption = styled.View`
  flex: 1;
  gap: 8px;
`;

export const DoorDirectionImageContainer = styled.View<{disabled?: boolean}>`
  width: 100%;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  border-width: 1px;
  border-color: ${color.gray20};
  opacity: ${({disabled}) => (disabled ? 0.4 : 1)};
`;

interface UploadedPhotos {
  entranceUrls: string[];
  elevatorUrls?: string[];
  hasMultipleFloors: boolean;
  durationMillisImageUpload: number;
}

async function uploadAllPhotos(
  api: ReturnType<typeof useAppComponents>['api'],
  values: PlaceFormV2Values,
  selectedOption: FloorOptionKey | null,
  selectedStandaloneType: StandaloneBuildingType | null,
  uploadImages: UploadImagesFn,
): Promise<UploadedPhotos> {
  const startImageUpload = Date.now();
  const entranceUrls = await uploadImages(
    api,
    values.entrancePhotos,
    undefined,
    '입구 사진',
  );

  const hasMultipleFloors = getFloorConditions({
    floorOption: selectedOption,
    standaloneType: selectedStandaloneType,
  }).showFloorMovement;

  let elevatorUrls: string[] | undefined;
  if (
    hasMultipleFloors &&
    values.floorMovementMethod?.includes(FloorMovingMethodTypeDto.PlaceElevator)
  ) {
    elevatorUrls = await uploadImages(
      api,
      values.elevatorPhotos || [],
      undefined,
      '엘리베이터 사진',
    );
  }

  return {
    entranceUrls,
    elevatorUrls,
    hasMultipleFloors,
    durationMillisImageUpload: Date.now() - startImageUpload,
  };
}

async function submitRegistration(
  api: ReturnType<typeof useAppComponents>['api'],
  queryClient: ReturnType<typeof useQueryClient>,
  placeId: string,
  values: PlaceFormV2Values,
  selectedOption: FloorOptionKey | null,
  selectedStandaloneType: StandaloneBuildingType | null,
  selectedFloor: number | undefined,
  doorDirection: BuildingDoorDirectionType | undefined,
  uploaded: UploadedPhotos,
) {
  const startTotal = Date.now();
  const imageCount =
    (values.entrancePhotos?.length ?? 0) + (values.elevatorPhotos?.length ?? 0);
  const {
    entranceUrls,
    elevatorUrls,
    hasMultipleFloors,
    durationMillisImageUpload,
  } = uploaded;

  let floorMovingElevatorAccessibility;
  if (elevatorUrls) {
    floorMovingElevatorAccessibility = {
      imageUrls: elevatorUrls,
      stairInfo:
        typeof values.elevatorHasStairs === 'boolean'
          ? values.elevatorHasStairs
            ? values.elevatorStairInfo
            : StairInfo.None
          : undefined,
      stairHeightLevel:
        values.elevatorHasStairs && values.elevatorStairInfo === StairInfo.One
          ? values.elevatorStairHeightLevel
          : undefined,
      hasSlope:
        typeof values.elevatorHasSlope === 'boolean'
          ? values.elevatorHasSlope
          : undefined,
    };
  }

  const requestData: RegisterPlaceAccessibilityRequestDtoV2 = {
    placeId,
    isStandaloneBuilding: selectedOption === 'standalone',
    doorDirectionType:
      selectedOption === 'standalone'
        ? PlaceDoorDirectionTypeDto.OutsideBuilding
        : doorDirection === 'outside'
          ? PlaceDoorDirectionTypeDto.OutsideBuilding
          : PlaceDoorDirectionTypeDto.InsideBuilding,
    floors: computeFloors(
      selectedOption,
      selectedFloor,
      selectedStandaloneType,
    ),
    imageUrls: entranceUrls,
    stairInfo: values.hasStairs ? values.stairInfo : StairInfo.None,
    stairHeightLevel:
      values.hasStairs && values.stairInfo === StairInfo.One
        ? values.entranceStairHeightLevel
        : undefined,
    hasSlope: values.hasSlope || false,
    entranceDoorTypes: values.doorType,
    features: values.additionalInfo,
    entranceComment: values.comment,
    floorMovingMethodTypes: hasMultipleFloors
      ? values.floorMovementMethod
      : undefined,
    floorMovingMethodComment: hasMultipleFloors
      ? values.floorMovementComment
      : undefined,
    floorMovingElevatorAccessibility,
  };

  try {
    const startApiCall = Date.now();
    const res = await api.registerPlaceAccessibilityV2Post(requestData);
    const durationApiCall = Date.now() - startApiCall;

    await Logger.logAccessibilityRegistration({
      type: 'place',
      durationMillisImageUpload,
      durationMillisApiCall: durationApiCall,
      durationMillisTotal:
        durationMillisImageUpload + (Date.now() - startTotal),
      imageCount,
      success: true,
    });

    queryClient.invalidateQueries({
      queryKey: ['PlaceDetailV2', placeId, 'Accessibility'],
    });
    queryClient.invalidateQueries({
      queryKey: ['PlaceDetailV2', placeId],
    });

    updateSearchCacheForPlaceAsync(api, queryClient, placeId);

    return {
      success: true as const,
      data: res.data.contributedChallengeInfos?.flatMap(info =>
        info.completedQuestsByContribution.map(quest => ({
          challengeId: info.challenge.id,
          type: quest.completeStampType,
          title: quest.title,
        })),
      ),
    };
  } catch (error: any) {
    await Logger.logAccessibilityRegistration({
      type: 'place',
      durationMillisImageUpload,
      durationMillisApiCall: Date.now() - startTotal,
      durationMillisTotal:
        durationMillisImageUpload + (Date.now() - startTotal),
      imageCount,
      success: false,
    });
    ToastUtils.showOnApiError(error);
    return {
      success: false as const,
    };
  }
}

function getEvent(
  selectedOption: FloorOptionKey | null,
  doorDirection?: BuildingDoorDirectionType,
): BuildingRegistrationEvent | undefined {
  if (selectedOption === 'standalone') {
    // 단독건물이면 event 없음
    return undefined;
  } else {
    // 단독건물이 아닌 경우
    // 1. 1층 + 건물 밖 문 => event 없음
    // 2. 다른층 + 건물 밖 문 => registration-suggest
    // 3. 그 외 => registration-force
    const isFirstFloorWithOutsideDoor =
      selectedOption === 'firstFloor' && doorDirection === 'outside';
    const isOtherFloorWithOutsideDoor =
      selectedOption === 'otherFloor' && doorDirection === 'outside';

    if (isFirstFloorWithOutsideDoor) {
      return undefined;
    } else if (isOtherFloorWithOutsideDoor) {
      return 'registration-suggest';
    } else {
      return 'registration-force';
    }
  }
}
