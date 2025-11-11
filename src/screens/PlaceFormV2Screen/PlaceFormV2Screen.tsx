import {placeFormV2GuideDismissedAtom} from '@/atoms/User';
import {ScreenLayout} from '@/components/ScreenLayout';
import {color} from '@/constant/color';
import {Building, Place} from '@/generated-sources/openapi';
import {LogParamsProvider} from '@/logging/LogParamsProvider';
import {ScreenProps} from '@/navigation/Navigation.screens';
import {useBackHandler} from '@react-native-community/hooks';
import {useAtom} from 'jotai';
import {ReactElement, useEffect, useState} from 'react';
import styled from 'styled-components/native';
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

type Step = 'floor' | 'info' | 'floorMovement';

const STEPS: Step[] = ['floor', 'info', 'floorMovement'];

export default function PlaceFormV2Screen({
  route,
  navigation,
}: ScreenProps<'PlaceFormV2'>) {
  const {place, building} = route.params;
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<FloorOptionKey | null>(
    null,
  );
  const [selectedStandaloneType, setSelectedStandaloneType] =
    useState<StandaloneBuildingType | null>(null);
  const [selectedFloor, setSelectedFloor] = useState<number | undefined>(
    undefined,
  );

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
  const handleSubmit = async () => {
    try {
      // 단독건물이 아닐 경우에만 event를 넘긴다.
      const event =
        selectedOption === 'standalone' ? undefined : 'registration-suggest';

      navigation.navigate('RegistrationComplete', {
        target: 'place',
        event,
        placeInfo: {
          place,
          building,
        },
      });
    } catch (error) {
      // TODO: 로깅
      console.error('Registration failed:', error);
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
    setStepIndex(prev => Math.max(prev - 1, 0));
  };

  // InfoStep에서 다음 버튼 핸들러
  const handleInfoSubmit = () => {
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
      <ScreenLayout isHeaderVisible={true}>{stepConfig[step]}</ScreenLayout>
      <GuideModal
        visible={isGuideModalVisible}
        onDismissPermanently={handleDismissPermanently}
        onConfirm={handleConfirmGuide}
        onRequestClose={handleBack}
      />
    </LogParamsProvider>
  );
}

export const SectionSeparator = styled.View({
  backgroundColor: color.gray10,
  height: 6,
});
