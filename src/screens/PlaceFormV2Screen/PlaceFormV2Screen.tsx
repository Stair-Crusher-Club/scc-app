import {placeFormV2GuideDismissedAtom} from '@/atoms/User';
import {ScreenLayout} from '@/components/ScreenLayout';
import {color} from '@/constant/color';
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
import {LogParamsProvider} from '@/logging/LogParamsProvider';
import ImageFile from '@/models/ImageFile';
import {ScreenProps} from '@/navigation/Navigation.screens';
import ToastUtils from '@/utils/ToastUtils';
import {useBackHandler} from '@react-native-community/hooks';
import {useQueryClient} from '@tanstack/react-query';
import {useAtom, useSetAtom} from 'jotai';
import {ReactElement, useEffect, useState} from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import {Alert} from 'react-native';
import styled from 'styled-components/native';
import {BuildingRegistrationEvent} from '../PlaceDetailV2Screen/constants';
import {pushItemsAtom} from '../SearchScreen/atoms/quest';
import FloorMovementStep from './components/FloorMovementStep';
import FloorStep from './components/FloorStep';
import GuideModal from './components/GuideModal';
import InfoStep from './components/InfoStep';

export interface PlaceFormV2ScreenParams {
  place: Place;
  building: Building;
}

type FloorOptionKey =
  | 'firstFloor'
  | 'otherFloor'
  | 'multipleFloors'
  | 'standalone';

type StandaloneBuildingType = 'singleFloor' | 'multipleFloors';

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
  floorMovementMethod: FloorMovingMethodTypeDto;
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

  const [stepIndex, setStepIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<FloorOptionKey | null>(
    null,
  );
  const [selectedStandaloneType, setSelectedStandaloneType] =
    useState<StandaloneBuildingType | null>(null);
  const [selectedFloor, setSelectedFloor] = useState<number>();
  const [doorDirection, setDoorDirection] =
    useState<BuildingDoorDirectionType>();

  const form = useForm<PlaceFormV2Values>();
  const step = STEPS[stepIndex];

  // Guide 모달 표시 여부
  const [isGuideModalVisible, setIsGuideModalVisible] = useState(false);

  // Guide 모달 "다시보지않기" 상태 (읽기/쓰기)
  const [guideDismissed, setGuideDismissed] = useAtom(
    placeFormV2GuideDismissedAtom,
  );

  // 현재 세션에서 본 guide 추적
  const [viewedGuidesInSession, setViewedGuidesInSession] = useState<
    Set<string>
  >(new Set());

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

    // 현재 세션에서 이미 본 경우
    if (viewedGuidesInSession.has(guideKey)) return false;

    return true;
  })();

  // 단독건물 선택 후 다른 옵션으로 변경하면 단독건물 타입 초기화
  useEffect(() => {
    if (selectedOption !== 'standalone') {
      setSelectedStandaloneType(null);
    }
  }, [selectedOption]);

  // "아니요, 다른층이에요" 선택 후 다른 옵션으로 변경하면 층 정보 초기화
  useEffect(() => {
    if (selectedOption !== 'otherFloor') {
      setSelectedFloor(undefined);
    }
  }, [selectedOption]);

  // API 호출 및 완료 처리
  const handleSubmit = async (door?: BuildingDoorDirectionType) => {
    const values = form.getValues();

    try {
      // Upload images first
      // const uploadedImageUrls = await ImageFileUtils.uploadImages(
      //   api,
      //   values.entrancePhotos,
      // );

      // Prepare floor moving elevator accessibility if needed
      // 단독건물 여러층이면서 엘리베이터를 선택한 경우에만 필요
      let floorMovingElevatorAccessibility;
      // const isStandaloneMultipleFloors =
      //   selectedOption === 'standalone' &&
      //   selectedStandaloneType === 'multipleFloors';
      // if (
      //   isStandaloneMultipleFloors &&
      //   values.floorMovementMethod === FloorMovingMethodTypeDto.PlaceElevator
      // ) {
      //   const elevatorImageUrls = await ImageFileUtils.uploadImages(
      //     api,
      //     values.elevatorPhotos || [],
      //   );

      //   floorMovingElevatorAccessibility = {
      //     imageUrls: elevatorImageUrls,
      //     stairInfo: values.elevatorHasStairs
      //       ? values.elevatorStairInfo
      //       : StairInfo.None,
      //     stairHeightLevel:
      //       values.elevatorHasStairs &&
      //       values.elevatorStairInfo === StairInfo.One
      //         ? values.elevatorStairHeightLevel
      //         : undefined,
      //     hasSlope: values.elevatorHasSlope || false,
      //   };
      // }

      // API request
      const requestData: RegisterPlaceAccessibilityRequestDtoV2 = {
        placeId: place.id,
        isStandaloneBuildingBuilding: selectedOption === 'standalone',
        doorDirectionType:
          selectedOption === 'standalone'
            ? PlaceDoorDirectionTypeDto.OutsideBuilding
            : door === 'outside' || doorDirection === 'outside'
              ? PlaceDoorDirectionTypeDto.OutsideBuilding
              : PlaceDoorDirectionTypeDto.InsideBuilding,
        floors: getFloors(selectedOption, selectedFloor),
        imageUrls: [], // uploadedImageUrls
        stairInfo: values.hasStairs ? values.stairInfo : StairInfo.None,
        stairHeightLevel:
          values.hasStairs && values.stairInfo === StairInfo.One
            ? values.entranceStairHeightLevel
            : undefined,
        hasSlope: values.hasSlope || false,
        entranceDoorTypes: values.doorType,
        features: values.additionalInfo,
        entranceComment: values.comment,
        floorMovingMethodType: values.floorMovementMethod,
        floorMovingMethodComment: values.floorMovementComment,
        floorMovingElevatorAccessibility,
      };

      console.log(requestData);

      // // Call API
      // const res = await api.registerPlaceAccessibilityV2Post(requestData);

      // // Invalidate queries to refresh data
      // queryClient.invalidateQueries({
      //   queryKey: ['PlaceDetail', place.id, 'Accessibility'],
      // });
      // queryClient.invalidateQueries({
      //   queryKey: ['PlaceDetail', place.id],
      // });

      // // Push completed quest items
      // if (res.data.contributedChallengeInfos) {
      //   const items = res.data.contributedChallengeInfos.flatMap(info =>
      //     info.completedQuestsByContribution.map(quest => ({
      //       challengeId: info.challenge.id,
      //       type: quest.completeStampType,
      //       title: quest.title,
      //     })),
      //   );
      //   pushItems(items);
      // }

      // Navigate to completion screen
      const event = getEvent(selectedOption, door ?? doorDirection);
      console.log(event);
      // navigation.navigate('RegistrationComplete', {
      //   target: 'place',
      //   event,
      //   placeInfo: {
      //     place,
      //     building,
      //   },
      // });
    } catch (error: any) {
      ToastUtils.showOnApiError(error);
    }
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
      if (guideKey) {
        setViewedGuidesInSession(prev => new Set(prev).add(guideKey));
      }
      setIsGuideModalVisible(false);
      return;
    }

    // InfoStep에서 FloorStep으로 돌아갈 때 확인 Alert (입력한 내용이 있을 때만)
    if (step === 'info') {
      const values = form.getValues();
      const hasInputData =
        values.doorDirection ||
        (values.entrancePhotos && values.entrancePhotos.length > 0) ||
        values.hasStairs !== undefined ||
        values.stairInfo ||
        values.entranceStairHeightLevel ||
        values.hasSlope !== undefined ||
        (values.doorType && values.doorType.length > 0) ||
        (values.additionalInfo && values.additionalInfo.length > 0) ||
        values.comment;

      if (hasInputData) {
        Alert.alert(
          '층 정보를 다시 입력하시겠어요?',
          '이전 단계로 돌아가면 입력한 내용이 모두 사라집니다.',
          [
            {
              text: '취소',
              style: 'cancel',
            },
            {
              text: '확인',
              onPress: () => {
                // 폼 초기화
                form.reset();
                // FloorStep으로 이동
                setStepIndex(prev => Math.max(prev - 1, 0));
              },
            },
          ],
        );
        return;
      }

      // 입력한 내용이 없으면 바로 이동
      setStepIndex(prev => Math.max(prev - 1, 0));
      return;
    }

    setStepIndex(prev => Math.max(prev - 1, 0));
  };

  // InfoStep에서 다음 버튼 핸들러
  const handleInfoSubmit = (door?: BuildingDoorDirectionType) => {
    // doorDirection 저장
    if (door) {
      setDoorDirection(door);
    }

    // floorMovement 단계가 필요한지 확인
    const needsFloorMovement =
      selectedOption === 'multipleFloors' ||
      (selectedOption === 'standalone' &&
        selectedStandaloneType === 'multipleFloors');

    if (needsFloorMovement) {
      const floorMovementIndex = STEPS.indexOf('floorMovement');
      if (floorMovementIndex !== -1) {
        setStepIndex(floorMovementIndex);
      }
    } else {
      // floorMovement가 필요없으면 바로 제출
      handleSubmit(door);
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

  // "확인했어요!" 버튼 핸들러: 현재 세션에서 본 것으로 표시
  const handleConfirmGuide = () => {
    if (guideKey) {
      setViewedGuidesInSession(prev => new Set(prev).add(guideKey));
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
    return false;
  });

  const stepConfig: Record<Step, ReactElement> = {
    floor: (
      <FloorStep
        place={place}
        selectedOption={selectedOption}
        selectedStandaloneType={selectedStandaloneType}
        selectedFloor={selectedFloor}
        onOptionChange={setSelectedOption}
        onStandaloneTypeChange={setSelectedStandaloneType}
        onFloorChange={setSelectedFloor}
        onNext={handleNext}
      />
    ),
    info: (
      <InfoStep
        place={place}
        isStandaloneBuilding={selectedOption === 'standalone'}
        hasFloorMovementStep={
          selectedOption === 'multipleFloors' ||
          (selectedOption === 'standalone' &&
            selectedStandaloneType === 'multipleFloors')
        }
        onSubmit={handleInfoSubmit}
        onBack={handleBack}
      />
    ),
    floorMovement: (
      <FloorMovementStep
        place={place}
        isStandaloneBuilding={selectedOption === 'standalone'}
        onSubmit={handleSubmit}
        onBack={handleBack}
      />
    ),
  };

  return (
    <LogParamsProvider params={{place_id: place.id}}>
      <FormProvider {...form}>
        <ScreenLayout isHeaderVisible={true}>{stepConfig[step]}</ScreenLayout>
        <GuideModal
          visible={isGuideModalVisible}
          onDismissPermanently={handleDismissPermanently}
          onConfirm={handleConfirmGuide}
          onRequestClose={handleBack}
        />
      </FormProvider>
    </LogParamsProvider>
  );
}

export const SectionSeparator = styled.View({
  backgroundColor: color.gray10,
  height: 6,
});

function getFloors(
  selectedOption: FloorOptionKey | null,
  selectedFloor: number | undefined,
): number[] {
  switch (selectedOption) {
    case 'firstFloor':
      return [1];
    case 'otherFloor':
      return selectedFloor ? [selectedFloor] : [1];
    case 'multipleFloors':
      return [1, 2];
    case 'standalone':
      return [1];
    default:
      return [1];
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
