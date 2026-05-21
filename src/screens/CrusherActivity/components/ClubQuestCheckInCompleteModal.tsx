import {SccButton} from '@/components/atoms';
import {SccTouchableWithoutFeedback} from '@/components/SccTouchableWithoutFeedback';
import {font} from '@/constant/font';
import Logger from '@/logging/Logger';
import LottieView from 'lottie-react-native';
import React from 'react';
import {Modal, Text, View, useWindowDimensions} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

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
        {/* dim 은 outer View 가 full-screen 으로 담당, 콘텐츠는 SafeAreaView 안에서 center 정렬 —
            home indicator/nav bar 와 겹치지 않게. */}
        <View className="flex-1 bg-blacka-80">
          <SafeAreaView
            edges={['top', 'bottom']}
            style={{flex: 1, justifyContent: 'center'}}>
            <View className="items-center justify-center pb-3">
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
            </View>

            <Text className="text-center font-pretendard-regular text-[20px] leading-[28px] text-white">
              <Text className="font-pretendard-bold text-[20px] leading-[28px] text-white">
                정복활동 출석체크
              </Text>
              가 완료되었습니다.
              {'\n'}
              이제 퀘스트를 뿌시러 가볼까요?
            </Text>

            <View className="mt-10 gap-5 p-5">
              <SccButton
                style={{height: 58}}
                text="확인"
                textColor="white"
                fontFamily={font.pretendardBold}
                onPress={onClose}
                elementName="club_quest_check_in_complete_confirm_button"
              />
            </View>
          </SafeAreaView>
        </View>
      </SccTouchableWithoutFeedback>
    </Modal>
  );
}
