import {SccButton} from '@/components/atoms';
import {SccTouchableWithoutFeedback} from '@/components/SccTouchableWithoutFeedback';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import Logger from '@/logging/Logger';
import LottieView from 'lottie-react-native';
import React from 'react';
import {Modal, View, useWindowDimensions} from 'react-native';
import styled from 'styled-components/native';

interface ClubQuestCheckInCompleteModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function ClubQuestCheckInCompleteModal({
  visible,
  onClose,
}: ClubQuestCheckInCompleteModalProps) {
  const {width: viewportWidth} = useWindowDimensions();

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="fade">
      <SccTouchableWithoutFeedback
        elementName="club_quest_check_in_complete_modal_backdrop"
        onPress={onClose}>
        <Backdrop>
          <Center>
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <LottieView
                onAnimationFailure={error => {
                  Logger.logError(
                    new Error(
                      `Lottie animation error [crusher_activity_welcome.lottie]: ${error}`,
                    ),
                  );
                }}
                source={require('@/assets/animations/crusher_activity_welcome.lottie')}
                autoPlay
                loop
                style={{
                  width: viewportWidth * 0.65,
                  height: viewportWidth * 0.2,
                  bottom: viewportWidth * -0.1,
                }}
              />
              <LottieView
                onAnimationFailure={error => {
                  Logger.logError(
                    new Error(
                      `Lottie animation error [conquer_activity_checkin.json]: ${error}`,
                    ),
                  );
                }}
                source={require('@/assets/animations/conquer_activity_checkin.json')}
                autoPlay
                loop
                style={{
                  width: viewportWidth * 0.7,
                  height: viewportWidth * 0.7,
                }}
              />
            </View>
          </Center>

          <TitleText>
            <TitleTextBold>정복활동 출석체크</TitleTextBold>가 완료되었습니다.
            {'\n'}
            이제 퀘스트를 뿌시러 가볼까요?
          </TitleText>

          <ButtonContainer>
            <SccButton
              style={{height: 58}}
              text="확인"
              textColor="white"
              fontFamily={font.pretendardBold}
              onPress={onClose}
              elementName="club_quest_check_in_complete_confirm_button"
            />
          </ButtonContainer>
        </Backdrop>
      </SccTouchableWithoutFeedback>
    </Modal>
  );
}

const Backdrop = styled.View({
  flex: 1,
  justifyContent: 'center',
  backgroundColor: 'rgba(0,0,0,0.8)',
});

const Center = styled.View({
  justifyContent: 'center',
  alignItems: 'center',
  paddingBottom: 12,
});

const TitleText = styled.Text({
  marginBottom: 0,
  textAlign: 'center',
  color: color.white,
  fontFamily: font.pretendardRegular,
  fontSize: 20,
  lineHeight: 28, // 140%
});

const TitleTextBold = styled.Text({
  color: color.white,
  fontFamily: font.pretendardBold,
  fontSize: 20,
  lineHeight: 28, // 140%
});

const ButtonContainer = styled.View({
  marginTop: 40,
  padding: 20,
  gap: 20,
});
