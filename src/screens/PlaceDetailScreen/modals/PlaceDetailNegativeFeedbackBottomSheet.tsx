import React, {useCallback, useState} from 'react';
import {Platform, View} from 'react-native';
import styled from 'styled-components/native';

import {match} from 'ts-pattern';

import {SccButton} from '@/components/atoms';
import TextArea from '@/components/form/TextArea';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {
  AccessibilityReportReason,
  ClosedSubTypeDto,
  ElevatorCorrectionTargetDto,
  EntranceDoorType,
  InaccurateInfoCategoryDto,
} from '@/generated-sources/openapi';
import {doorTypeMap} from '@/constant/options';
import BottomSheet from '@/modals/BottomSheet';

type Step = 'reason' | 'inaccurateCategory' | 'closedSubType' | 'text';

/** PA/BA 데이터에서 동적 라벨 생성에 필요한 최소 정보 */
interface PlaceAccessibilitySnapshot {
  floors?: number[];
  isStandaloneBuilding?: boolean;
  entranceDoorTypes?: EntranceDoorType[];
  accessibilityScore?: number;
}

interface PlaceDetailNegativeFeedbackBottomSheetProps {
  isVisible: boolean;
  placeId: string;
  hasBuildingAccessibility?: boolean;
  elevatorTargets?: ElevatorCorrectionTargetDto[];
  placeAccessibilitySnapshot?: PlaceAccessibilitySnapshot;
  onPressCloseButton: () => void;
  onPressSubmitButton: (
    placeId: string,
    reason: AccessibilityReportReason,
    text: string,
  ) => void;
  onPressNavigateToCorrection: (params: {
    placeId: string;
    reason: AccessibilityReportReason;
    inaccurateCategories: InaccurateInfoCategoryDto[];
    elevatorTarget?: ElevatorCorrectionTargetDto;
  }) => void;
  onPressSubmitClosed: (params: {
    placeId: string;
    closedSubType: ClosedSubTypeDto;
    detail?: string;
  }) => void;
}

/** 실제 데이터 기반으로 동적 카테고리 라벨을 생성한다. 질문이 적은 카테고리는 실제 값을 보여준다. */
function getCategoryLabel(
  category: InaccurateInfoCategoryDto,
  snapshot?: PlaceAccessibilitySnapshot,
  hasBa?: boolean,
): string {
  switch (category) {
    case InaccurateInfoCategoryDto.PlaceEntrance:
      return hasBa
        ? '계단 / 경사로 / 문 방향이 잘못됐어요'
        : '입구 계단 / 경사로 / 문 방향이 잘못됐어요';
    case InaccurateInfoCategoryDto.BuildingEntrance:
      return '건물 입구 계단 / 경사로가 잘못됐어요';
    case InaccurateInfoCategoryDto.Floor: {
      // PDP의 getFloorAccessibility title과 일치시킨다
      const floors = snapshot?.floors;
      const isStandalone = snapshot?.isStandaloneBuilding === true;
      if (!floors || floors.length === 0) {
        return '층 정보가 잘못됐어요';
      }
      const isSingle = floors.length === 1;
      if (isSingle && floors[0] === 1) {
        return isStandalone ? '단독 1층 건물이 아니에요' : '1층이 아니에요';
      }
      if (isSingle) {
        const name = floors[0] < 0 ? `지하 ${-floors[0]}층` : `${floors[0]}층`;
        return `${name}이 아니에요`;
      }
      // 여러층
      return isStandalone
        ? '단독 건물 여러층이 아니에요'
        : '1층을 포함한 여러층이 아니에요';
    }
    case InaccurateInfoCategoryDto.DoorType: {
      // PDP와 동일하게 doorTypeMap join으로 표시
      const doorTypes = snapshot?.entranceDoorTypes;
      if (doorTypes && doorTypes.length > 0 && doorTypes.length <= 2) {
        const label = doorTypes.map(d => doorTypeMap[d]).join(', ');
        if (label === '기타') {
          return '출입문 유형이 잘못됐어요';
        }
        return `${label}이 아니에요`;
      }
      return '출입문 종류가 잘못됐어요';
    }
    case InaccurateInfoCategoryDto.Elevator:
      return '엘리베이터 정보가 잘못됐어요';
    case InaccurateInfoCategoryDto.AccessLevel: {
      const score = snapshot?.accessibilityScore;
      if (score !== undefined && score !== null) {
        return `접근레벨 ${Math.floor(score)}이 아니에요`;
      }
      return '접근 레벨이 잘못됐어요';
    }
    case InaccurateInfoCategoryDto.Photo:
      return '사진이 잘못됐어요';
    case InaccurateInfoCategoryDto.Other:
      return '기타 정보가 잘못됐어요';
    default: {
      const _exhaustiveCheck: never = category;
      return _exhaustiveCheck;
    }
  }
}

const CLOSED_SUB_TYPE_LABELS: Record<ClosedSubTypeDto, string> = {
  [ClosedSubTypeDto.PermanentlyClosed]: '폐업했어요',
  [ClosedSubTypeDto.ReplacedByOther]: '다른 가게로 바뀌었어요',
  [ClosedSubTypeDto.Other]: '기타',
};

const PlaceDetailNegativeFeedbackBottomSheet = ({
  isVisible,
  placeId,
  hasBuildingAccessibility = false,
  elevatorTargets = [],
  placeAccessibilitySnapshot,
  onPressCloseButton,
  onPressSubmitButton,
  onPressNavigateToCorrection,
  onPressSubmitClosed,
}: PlaceDetailNegativeFeedbackBottomSheetProps) => {
  const [step, setStep] = useState<Step>('reason');
  const [selectedReason, setSelectedReason] =
    useState<AccessibilityReportReason | null>(null);
  const [selectedCategory, setSelectedCategory] =
    useState<InaccurateInfoCategoryDto | null>(null);
  const [selectedElevatorTarget, setSelectedElevatorTarget] =
    useState<ElevatorCorrectionTargetDto | null>(null);
  const [selectedClosedSubType, setSelectedClosedSubType] =
    useState<ClosedSubTypeDto | null>(null);
  const [text, setText] = useState<string | null>(null);
  const [closedDetail, setClosedDetail] = useState<string | null>(null);

  const reasons: AccessibilityReportReason[] = [
    'INACCURATE_INFO',
    'CLOSED',
    'BAD_USER',
  ];

  const onClear = useCallback(() => {
    setSelectedReason(null);
    setStep('reason');
    setText(null);
    setSelectedCategory(null);
    setSelectedElevatorTarget(null);
    setSelectedClosedSubType(null);
    setClosedDetail(null);
  }, []);

  const handleClose = useCallback(() => {
    onClear();
    onPressCloseButton();
  }, [onClear, onPressCloseButton]);

  const handleBack = useCallback(() => {
    setStep('reason');
    setSelectedCategory(null);
    setSelectedElevatorTarget(null);
    setSelectedClosedSubType(null);
    setClosedDetail(null);
    setText(null);
  }, []);

  const getTitle = (): string => {
    switch (step) {
      case 'reason':
        return '어떤 문제가 있나요?';
      case 'inaccurateCategory':
        return '어떤 정보가 틀렸나요?';
      case 'closedSubType':
        return '어떤 상황인가요?';
      case 'text':
        return '차단 사유를 알려주세요.';
      default: {
        const _exhaustiveCheck: never = step;
        return _exhaustiveCheck;
      }
    }
  };

  const getSubmitButtonText = (): string => {
    switch (step) {
      case 'reason':
        return '다음';
      case 'inaccurateCategory':
        return '다음';
      case 'closedSubType':
        return selectedClosedSubType === ClosedSubTypeDto.ReplacedByOther
          ? '폐업 처리 및 제출'
          : '제출하기';
      case 'text':
        return '제출하기';
      default: {
        const _exhaustiveCheck: never = step;
        return _exhaustiveCheck;
      }
    }
  };

  const isSubmitDisabled = (): boolean => {
    switch (step) {
      case 'reason':
        return selectedReason === null;
      case 'inaccurateCategory':
        // Elevator category requires an elevator target to be selected
        if (selectedCategory === InaccurateInfoCategoryDto.Elevator) {
          return selectedElevatorTarget === null;
        }
        return selectedCategory === null;
      case 'closedSubType':
        return selectedClosedSubType === null;
      case 'text':
        return false;
      default: {
        const _exhaustiveCheck: never = step;
        return _exhaustiveCheck;
      }
    }
  };

  const handleSubmit = () => {
    switch (step) {
      case 'reason': {
        if (!selectedReason) {
          return;
        }
        switch (selectedReason) {
          case 'INACCURATE_INFO':
            setStep('inaccurateCategory');
            break;
          case 'CLOSED':
            setStep('closedSubType');
            break;
          case 'BAD_USER':
            setStep('text');
            break;
          default: {
            const _exhaustiveCheck: never = selectedReason;
            return _exhaustiveCheck;
          }
        }
        break;
      }
      case 'inaccurateCategory': {
        if (!selectedCategory) {
          return;
        }
        onPressNavigateToCorrection({
          placeId,
          reason: 'INACCURATE_INFO',
          inaccurateCategories: [selectedCategory],
          elevatorTarget: selectedElevatorTarget ?? undefined,
        });
        break;
      }
      case 'closedSubType': {
        if (!selectedClosedSubType) {
          return;
        }
        const subType = selectedClosedSubType;
        const detail =
          subType === ClosedSubTypeDto.Other
            ? (closedDetail ?? undefined)
            : undefined;
        onClear();
        onPressSubmitClosed({
          placeId,
          closedSubType: subType,
          detail,
        });
        break;
      }
      case 'text': {
        const reason = selectedReason;
        onClear();
        if (reason) {
          onPressSubmitButton(placeId, reason, text ?? '');
        }
        break;
      }
      default: {
        const _exhaustiveCheck: never = step;
        return _exhaustiveCheck;
      }
    }
  };

  return (
    <BottomSheet isVisible={isVisible} onPressBackground={handleClose}>
      <ContentsContainer>
        <Title>{getTitle()}</Title>

        {step === 'reason' && (
          <OptionSelector>
            {reasons.map((reason, index) => {
              const isSelected = reason === selectedReason;
              return (
                <View key={reason}>
                  {index > 0 && <SpaceBetweenOptions />}
                  <SccButton
                    key={reason}
                    text={match(reason)
                      .with('INACCURATE_INFO', () => '틀린 정보가 있어요')
                      .with('CLOSED', () => '폐점/이전된 곳이에요')
                      .with('BAD_USER', () => '이 정복자를 차단할래요')
                      .exhaustive()}
                    textColor={isSelected ? 'brandColor' : 'gray70'}
                    buttonColor="white"
                    borderColor={isSelected ? 'blue50' : 'gray30'}
                    onPress={() => {
                      setSelectedReason(reason);
                    }}
                    elementName="place_feedback_option"
                    logParams={{reason}}
                  />
                </View>
              );
            })}
          </OptionSelector>
        )}

        {step === 'inaccurateCategory' && (
          <OptionSelector>
            {(() => {
              const items: {
                key: string;
                label: string;
                category: InaccurateInfoCategoryDto;
                elevatorTarget?: ElevatorCorrectionTargetDto;
              }[] = [];

              // 신고 빈도순으로 정렬 (데이터 기반)
              const CATEGORY_ORDER: InaccurateInfoCategoryDto[] = [
                InaccurateInfoCategoryDto.PlaceEntrance,
                InaccurateInfoCategoryDto.Floor,
                InaccurateInfoCategoryDto.Photo,
                InaccurateInfoCategoryDto.DoorType,
                InaccurateInfoCategoryDto.BuildingEntrance,
                InaccurateInfoCategoryDto.Elevator,
                InaccurateInfoCategoryDto.AccessLevel,
                InaccurateInfoCategoryDto.Other,
              ];
              CATEGORY_ORDER.forEach(cat => {
                if (
                  cat === InaccurateInfoCategoryDto.BuildingEntrance &&
                  !hasBuildingAccessibility
                ) {
                  return;
                }
                if (cat === InaccurateInfoCategoryDto.Elevator) {
                  // Render one button per elevator target
                  elevatorTargets.forEach(target => {
                    items.push({
                      key: `${cat}_${target}`,
                      label:
                        target === ElevatorCorrectionTargetDto.Pa
                          ? '매장 엘리베이터 정보가 잘못됐어요'
                          : '건물 엘리베이터 정보가 잘못됐어요',
                      category: cat,
                      elevatorTarget: target,
                    });
                  });
                  return;
                }
                items.push({
                  key: cat,
                  label: getCategoryLabel(
                    cat,
                    placeAccessibilitySnapshot,
                    hasBuildingAccessibility,
                  ),
                  category: cat,
                });
              });

              return items.map((item, index) => {
                const isSelected =
                  item.category === selectedCategory &&
                  (item.elevatorTarget != null
                    ? item.elevatorTarget === selectedElevatorTarget
                    : selectedElevatorTarget === null ||
                      selectedCategory !== InaccurateInfoCategoryDto.Elevator);
                return (
                  <View key={item.key}>
                    {index > 0 && <SpaceBetweenOptions />}
                    <SccButton
                      text={item.label}
                      textColor={isSelected ? 'brandColor' : 'gray70'}
                      buttonColor="white"
                      borderColor={isSelected ? 'blue50' : 'gray30'}
                      onPress={() => {
                        setSelectedCategory(item.category);
                        setSelectedElevatorTarget(item.elevatorTarget ?? null);
                      }}
                      elementName="place_feedback_inaccurate_category"
                      logParams={{
                        category: item.category,
                        elevatorTarget: item.elevatorTarget,
                      }}
                    />
                  </View>
                );
              });
            })()}
          </OptionSelector>
        )}

        {step === 'closedSubType' && (
          <OptionSelector>
            {(Object.values(ClosedSubTypeDto) as ClosedSubTypeDto[]).map(
              (subType, index) => {
                const isSelected = subType === selectedClosedSubType;
                return (
                  <View key={subType}>
                    {index > 0 && <SpaceBetweenOptions />}
                    <SccButton
                      text={CLOSED_SUB_TYPE_LABELS[subType]}
                      textColor={isSelected ? 'brandColor' : 'gray70'}
                      buttonColor="white"
                      borderColor={isSelected ? 'blue50' : 'gray30'}
                      onPress={() => {
                        setSelectedClosedSubType(subType);
                      }}
                      elementName="place_feedback_closed_sub_type"
                      logParams={{subType}}
                    />
                  </View>
                );
              },
            )}
            {selectedClosedSubType === ClosedSubTypeDto.ReplacedByOther && (
              <GuideCard>
                <GuideText>
                  기존 장소를 폐업 처리하고, 새 가게의 접근성 정보를
                  등록해주세요!
                </GuideText>
              </GuideCard>
            )}
            {selectedClosedSubType === ClosedSubTypeDto.Other && (
              <ClosedDetailTextArea
                placeholder="구체적인 상황을 알려주세요."
                value={closedDetail ?? ''}
                onChangeText={setClosedDetail}
                style={{
                  minHeight: Platform.OS === 'android' ? 80 : undefined,
                }}
              />
            )}
          </OptionSelector>
        )}

        {step === 'text' && (
          <TextArea
            placeholder={`이 정복자를 차단하고 싶은 이유를 알려주세요.`}
            value={text ?? ''}
            onChangeText={setText}
            style={{
              minHeight: Platform.OS === 'android' ? 120 : undefined,
            }}
          />
        )}

        <ButtonContainer>
          <CloseButton
            text={step === 'reason' ? '닫기' : '이전'}
            textColor="black"
            buttonColor="gray10"
            fontFamily={font.pretendardBold}
            onPress={step === 'reason' ? handleClose : handleBack}
            elementName={
              step === 'reason' ? 'place_feedback_close' : 'place_feedback_back'
            }
          />
          <SpaceBetweenButtons />
          <SubmitButton
            text={getSubmitButtonText()}
            textColor="white"
            buttonColor="brandColor"
            fontFamily={font.pretendardBold}
            isDisabled={isSubmitDisabled()}
            onPress={handleSubmit}
            elementName="place_feedback_submit"
          />
        </ButtonContainer>
      </ContentsContainer>
    </BottomSheet>
  );
};

export default PlaceDetailNegativeFeedbackBottomSheet;

const ContentsContainer = styled.View`
  flex-direction: column;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  background-color: ${color.white};
  padding-horizontal: 24px;
`;

const Title = styled.Text`
  color: ${color.black};
  font-size: 20px;
  font-family: ${font.pretendardBold};
  margin-top: 28px;
  margin-bottom: 30px;
`;

const OptionSelector = styled.View``;

const SpaceBetweenOptions = styled.View`
  height: 10px;
`;

const ButtonContainer = styled.View`
  height: 96px;
  flex-direction: row;
  align-items: center;
`;

const SpaceBetweenButtons = styled.View`
  width: 10px;
`;

const CloseButton = styled(SccButton)`
  flex: 1;
`;

const SubmitButton = styled(SccButton)`
  flex: 2;
`;

const ClosedDetailTextArea = styled(TextArea)`
  margin-top: 12px;
`;

const GuideCard = styled.View`
  margin-top: 12px;
  padding: 14px 16px;
  background-color: ${color.gray10};
  border-radius: 8px;
`;

const GuideText = styled.Text`
  font-family: ${font.pretendardRegular};
  font-size: 14px;
  color: ${color.gray70};
  line-height: 20px;
`;
