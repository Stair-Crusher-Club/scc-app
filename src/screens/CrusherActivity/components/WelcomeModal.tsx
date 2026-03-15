import {useMe} from '@/atoms/Auth';
import {SccButton} from '@/components/atoms';
import SccTouchableWithoutFeedback from '@/components/SccTouchableWithoutFeedback';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import Logger from '@/logging/Logger';
import LottieView from 'lottie-react-native';
import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import WelcomeAnimation from './WelcomeAnimation';

interface WelcomeModalProps {
  questTypeOrActivityId: string | null | undefined;
  recordStatus: 'idle' | 'loading' | 'success';
}

type AnimationLayer = {
  type: 'lottie' | 'image';
  source: ReturnType<typeof require>;
  scale?: number;
  offsetX?: number;
  offsetY?: number;
};

type ModalAnimationType =
  | {type: 'lottie'; source: ReturnType<typeof require>}
  | {type: 'layers'; layers: AnimationLayer[]}
  | {type: 'image'; source: ReturnType<typeof require>};

type TextPart = {text: string; bold: boolean};

const MODAL_CONFIG: Record<
  string,
  {
    buttonText: string;
    getTextParts: (nickname: string) => TextPart[];
    animation: ModalAnimationType;
  }
> = {
  STARTING_DAY: {
    buttonText: '앞으로 잘해봐요!',
    getTextParts: (nickname: string) => [
      {text: "'26 봄시즌 크러셔클럽", bold: true},
      {text: '에 온 크루\n', bold: false},
      {text: nickname, bold: true},
      {text: '님 환영합니다!', bold: false},
    ],
    animation: {
      type: 'lottie',
      source: require('@/assets/animations/crusher_activity_welcome.lottie'),
    },
  },
  'editor-crew-starting-day': {
    buttonText: '앞으로 잘해봐요!',
    getTextParts: (nickname: string) => [
      {text: "'26 봄시즌 크러셔클럽", bold: true},
      {text: '에 온 크루\n', bold: false},
      {text: nickname, bold: true},
      {text: '님 환영합니다!', bold: false},
    ],
    animation: {
      type: 'layers',
      layers: [
        {
          type: 'lottie',
          source: require('@/assets/animations/crusher_activity/starting_day/2026spring/crusher_activity_2026spring_welcome_confetti.lottie'),
          scale: 2.4,
          offsetY: 30,
        },
        {
          type: 'lottie',
          source: require('@/assets/animations/crusher_activity/starting_day/2026spring/editor_crew_starting_day_welcome_character.lottie'),
          scale: 0.65,
          offsetX: 24,
          offsetY: 54,
        },
        {
          type: 'image',
          source: require('@/assets/img/img_welcome_text.png'),
          scale: 1.05,
          offsetY: -82,
        },
      ],
    },
  },
  conquer_crew_a_starting_day: {
    buttonText: '앞으로 잘해봐요!',
    getTextParts: (nickname: string) => [
      {text: "'26 봄시즌 크러셔클럽", bold: true},
      {text: '에 온 크루\n', bold: false},
      {text: nickname, bold: true},
      {text: '님 환영합니다!', bold: false},
    ],
    animation: {
      type: 'layers',
      layers: [
        {
          type: 'lottie',
          source: require('@/assets/animations/crusher_activity/starting_day/2026spring/crusher_activity_2026spring_welcome_confetti.lottie'),
          scale: 2.4,
          offsetY: 30,
        },
        {
          type: 'lottie',
          source: require('@/assets/animations/crusher_activity/starting_day/2026spring/conquer_a_welcome_character.lottie'),
          scale: 0.65,
          offsetX: 24,
          offsetY: 54,
        },
        {
          type: 'image',
          source: require('@/assets/img/img_welcome_text.png'),
          scale: 1.05,
          offsetY: -82,
        },
      ],
    },
  },
  conquer_crew_b_starting_day: {
    buttonText: '앞으로 잘해봐요!',
    getTextParts: (nickname: string) => [
      {text: "'26 봄시즌 크러셔클럽", bold: true},
      {text: '에 온 크루\n', bold: false},
      {text: nickname, bold: true},
      {text: '님 환영합니다!', bold: false},
    ],
    animation: {
      type: 'layers',
      layers: [
        {
          type: 'lottie',
          source: require('@/assets/animations/crusher_activity/starting_day/2026spring/crusher_activity_2026spring_welcome_confetti.lottie'),
          scale: 2.4,
          offsetY: 30,
        },
        {
          type: 'lottie',
          source: require('@/assets/animations/crusher_activity/starting_day/2026spring/conquer_b_welcome_character.lottie'),
          scale: 0.65,
          offsetX: 24,
          offsetY: 54,
        },
        {
          type: 'image',
          source: require('@/assets/img/img_welcome_text.png'),
          scale: 1.05,
          offsetY: -82,
        },
      ],
    },
  },
  impactSession: {
    buttonText: '출석 완료!',
    getTextParts: (nickname: string) => [
      {text: '임팩트 세션', bold: true},
      {text: '에 온 크루\n', bold: false},
      {text: nickname, bold: true},
      {text: '님 환영합니다!', bold: false},
    ],
    animation: {
      type: 'image',
      source: require('@/assets/img/img_impact_session_modal.png'),
    },
  },
  awards: {
    buttonText: '출석 완료! 즐거운 시간 되세요~', // TODO: 실제 텍스트로 변경
    getTextParts: (nickname: string) => [
      {text: '어워즈', bold: true}, // TODO: 실제 텍스트로 변경
      {text: '에 온 크루\n', bold: false},
      {text: nickname, bold: true},
      {text: '님 환영합니다!', bold: false},
    ],
    animation: {
      type: 'image',
      source: require('@/assets/img/img_awards_modal.png'),
    },
  },
};

export default function WelcomeModal({
  questTypeOrActivityId,
  recordStatus,
}: WelcomeModalProps) {
  const {userInfo} = useMe();
  const {width: viewportWidth} = useWindowDimensions();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // 모달은 questTypeOrActivityId가 있고 API 호출이 시작되면 표시
    setVisible(
      !!questTypeOrActivityId &&
        (recordStatus === 'loading' || recordStatus === 'success'),
    );
  }, [questTypeOrActivityId, recordStatus]);

  const handleClose = () => {
    setVisible(false);
  };

  if (!questTypeOrActivityId) {
    return null;
  }

  const config = MODAL_CONFIG[questTypeOrActivityId];
  if (!config) {
    return null;
  }

  const textParts = config.getTextParts(userInfo?.nickname || '');

  const renderAnimation = () => {
    if (config.animation.type === 'image') {
      return (
        <Image
          source={config.animation.source}
          style={{
            width: viewportWidth * 0.8,
            height: viewportWidth * 0.8,
          }}
          resizeMode="contain"
        />
      );
    }

    if (config.animation.type === 'layers') {
      const baseSize = viewportWidth * 0.7;
      return (
        <View style={{width: baseSize, height: baseSize}}>
          {config.animation.layers.map((layer, index) => {
            const scale = layer.scale ?? 1;
            const layerSize = baseSize * scale;
            const centerLeft =
              (baseSize - layerSize) / 2 + (layer.offsetX ?? 0);
            const centerTop = (baseSize - layerSize) / 2 + (layer.offsetY ?? 0);

            if (layer.type === 'image') {
              return (
                <Image
                  key={index}
                  source={layer.source}
                  style={{
                    position: 'absolute',
                    width: layerSize,
                    height: layerSize,
                    left: centerLeft,
                    top: centerTop,
                  }}
                  resizeMode="contain"
                />
              );
            }

            return (
              <LottieView
                key={index}
                onAnimationFailure={error => {
                  Logger.logError(
                    new Error(
                      `Lottie animation error [layer ${index}]: ${error}`,
                    ),
                  );
                }}
                source={layer.source}
                autoPlay
                loop
                style={{
                  position: 'absolute',
                  width: layerSize,
                  height: layerSize,
                  left: centerLeft,
                  top: centerTop,
                }}
              />
            );
          })}
        </View>
      );
    }

    return (
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
          source={config.animation.source}
          autoPlay
          loop
          style={{
            width: viewportWidth * 0.65,
            height: viewportWidth * 0.2,
            bottom: viewportWidth * -0.1,
          }}
        />
        <WelcomeAnimation />
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="fade">
      <SccTouchableWithoutFeedback
        elementName="crusher_activity_welcome_modal"
        onPress={handleClose}>
        <View className="flex-1 justify-center bg-blacka-80">
          {recordStatus === 'loading' ? (
            <View className="items-center justify-center gap-10">
              <ActivityIndicator size="large" color={color.white} />
            </View>
          ) : (
            <>
              <View className="items-center justify-center gap-10">
                {renderAnimation()}
                <Text className="mb-5 text-center text-[20px] leading-[28px] text-white">
                  {textParts.map((part, index) =>
                    part.bold ? (
                      <Text
                        key={index}
                        className="font-pretendard-bold text-[20px] leading-[28px] text-white">
                        {part.text}
                      </Text>
                    ) : (
                      <Text
                        key={index}
                        className="font-pretendard-regular text-[20px] leading-[28px] text-white">
                        {part.text}
                      </Text>
                    ),
                  )}
                </Text>
              </View>

              <View className="gap-5 p-5">
                <SccButton
                  elementName="crusher_activity_welcome_modal_ok"
                  text={config.buttonText}
                  textColor="white"
                  fontFamily={font.pretendardBold}
                  onPress={handleClose}
                />
              </View>
            </>
          )}
        </View>
      </SccTouchableWithoutFeedback>
    </Modal>
  );
}
