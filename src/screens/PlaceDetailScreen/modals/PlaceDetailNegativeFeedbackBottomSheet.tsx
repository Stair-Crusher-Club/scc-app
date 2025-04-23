import React, {useCallback, useState} from 'react';
import {Modal, View} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import {match} from 'ts-pattern';

import {SccButton} from '@/components/atoms';
import TextArea from '@/components/form/TextArea';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {AccessibilityReportReason} from '@/generated-sources/openapi';

interface PlaceDetailNegativeFeedbackBottomSheetProps {
  isVisible: boolean;
  placeId: string;
  onPressCloseButton: () => void;
  onPressSubmitButton: (
    placeId: string,
    reason: AccessibilityReportReason,
    text: string,
  ) => void;
}

const PlaceDetailNegativeFeedbackBottomSheet = ({
  isVisible,
  placeId,
  onPressCloseButton,
  onPressSubmitButton,
}: PlaceDetailNegativeFeedbackBottomSheetProps) => {
  const safeAreaInsets = useSafeAreaInsets();
  const [step, setStep] = useState<'select' | 'text'>('select');
  const [selectedReason, setSelectedReason] =
    useState<AccessibilityReportReason | null>(null);
  const [text, setText] = useState<string | null>(null);
  const reasons: AccessibilityReportReason[] = [
    'INACCURATE_INFO',
    'CLOSED',
    'BAD_USER',
  ];

  const onClear = useCallback(() => {
    setSelectedReason(null);
    setStep('select');
    setText(null);
  }, []);

  return (
    <Modal visible={isVisible} transparent={true} animationType="fade">
      <Container>
        <ContentsContainer paddingBottom={safeAreaInsets.bottom}>
          <Title>
            {step === 'select'
              ? '어떤 문제가 있나요?'
              : '잘못된 정보를 알려주세요.'}
          </Title>
          {step === 'select' && (
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
                    />
                  </View>
                );
              })}
            </OptionSelector>
          )}
          {step === 'text' && (
            <TextArea
              placeholder={`예시)
- 층정보가 잘못되었어요
- 매장 입구 정보가 잘못되었어요
- 장소 사진이 잘못되었어요
- 건물정보가 잘못되었어요
`}
              value={text ?? ''}
              onChangeText={setText}
            />
          )}
          <ButtonContainer>
            <CloseButton
              text="닫기"
              textColor="black"
              buttonColor="gray10"
              fontFamily={font.pretendardBold}
              onPress={() => {
                onClear();
                onPressCloseButton();
              }}
            />
            <SpaceBetweenButtons />
            <SubmitButton
              text={step === 'select' ? '다음' : '제출하기'}
              textColor="white"
              buttonColor="brandColor"
              fontFamily={font.pretendardBold}
              isDisabled={selectedReason === null}
              onPress={() => {
                if (step === 'select') {
                  setStep('text');
                } else {
                  onClear();
                  if (selectedReason) {
                    onPressSubmitButton(placeId, selectedReason, text ?? '');
                  }
                }
              }}
            />
          </ButtonContainer>
        </ContentsContainer>
      </Container>
    </Modal>
  );
};

export default PlaceDetailNegativeFeedbackBottomSheet;

const Container = styled(SafeAreaView)`
  flex: 1;
  flex-direction: column-reverse;
  background-color: ${color.blacka50};
`;

const ContentsContainer = styled.View<{paddingBottom: number}>`
  flex-direction: column;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  background-color: ${color.white};
  padding-horizontal: 24px;
  padding-bottom: ${props => props.paddingBottom}px;
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
