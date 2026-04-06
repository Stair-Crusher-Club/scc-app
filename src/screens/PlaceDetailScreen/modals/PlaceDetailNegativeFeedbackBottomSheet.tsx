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
  InaccurateInfoCategoryDto,
} from '@/generated-sources/openapi';
import BottomSheet from '@/modals/BottomSheet';

type Step = 'reason' | 'inaccurateCategory' | 'closedSubType' | 'text';

interface PlaceDetailNegativeFeedbackBottomSheetProps {
  isVisible: boolean;
  placeId: string;
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
  }) => void;
  onPressSubmitClosed: (params: {
    placeId: string;
    closedSubType: ClosedSubTypeDto;
    detail?: string;
  }) => void;
}

const INACCURATE_CATEGORY_LABELS: Record<InaccurateInfoCategoryDto, string> = {
  [InaccurateInfoCategoryDto.Entrance]: '입구 정보',
  [InaccurateInfoCategoryDto.Floor]: '층 정보',
  [InaccurateInfoCategoryDto.DoorType]: '문 유형',
  [InaccurateInfoCategoryDto.Elevator]: '엘리베이터 정보',
  [InaccurateInfoCategoryDto.AccessLevel]: '접근레벨',
  [InaccurateInfoCategoryDto.Photo]: '사진 오류',
  [InaccurateInfoCategoryDto.Other]: '기타',
};

const CLOSED_SUB_TYPE_LABELS: Record<ClosedSubTypeDto, string> = {
  [ClosedSubTypeDto.PermanentlyClosed]: '폐업했어요',
  [ClosedSubTypeDto.ReplacedByOther]: '다른 가게로 바뀌었어요',
  [ClosedSubTypeDto.Other]: '기타',
};

const PlaceDetailNegativeFeedbackBottomSheet = ({
  isVisible,
  placeId,
  onPressCloseButton,
  onPressSubmitButton,
  onPressNavigateToCorrection,
  onPressSubmitClosed,
}: PlaceDetailNegativeFeedbackBottomSheetProps) => {
  const [step, setStep] = useState<Step>('reason');
  const [selectedReason, setSelectedReason] =
    useState<AccessibilityReportReason | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<
    InaccurateInfoCategoryDto[]
  >([]);
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
    setSelectedCategories([]);
    setSelectedClosedSubType(null);
    setClosedDetail(null);
  }, []);

  const handleClose = useCallback(() => {
    onClear();
    onPressCloseButton();
  }, [onClear, onPressCloseButton]);

  const toggleCategory = useCallback((category: InaccurateInfoCategoryDto) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category],
    );
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
        return '제출하기';
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
        return selectedCategories.length === 0;
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
        onClear();
        onPressNavigateToCorrection({
          placeId,
          reason: 'INACCURATE_INFO',
          inaccurateCategories: selectedCategories,
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
                      .with('CLOSED', () => '폐점된 곳이에요')
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
            {(
              Object.values(
                InaccurateInfoCategoryDto,
              ) as InaccurateInfoCategoryDto[]
            ).map((category, index) => {
              const isSelected = selectedCategories.includes(category);
              return (
                <View key={category}>
                  {index > 0 && <SpaceBetweenOptions />}
                  <SccButton
                    text={INACCURATE_CATEGORY_LABELS[category]}
                    textColor={isSelected ? 'brandColor' : 'gray70'}
                    buttonColor="white"
                    borderColor={isSelected ? 'blue50' : 'gray30'}
                    onPress={() => {
                      toggleCategory(category);
                    }}
                    elementName="place_feedback_inaccurate_category"
                    logParams={{category}}
                  />
                </View>
              );
            })}
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
            text="닫기"
            textColor="black"
            buttonColor="gray10"
            fontFamily={font.pretendardBold}
            onPress={handleClose}
            elementName="place_feedback_close"
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
