import {useMe} from '@/atoms/Auth';
import {SccButton} from '@/components/atoms';
import SccTouchableWithoutFeedback from '@/components/SccTouchableWithoutFeedback';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import Logger from '@/logging/Logger';
import LottieView from 'lottie-react-native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  Modal,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import WelcomeAnimation from './WelcomeAnimation';

interface WelcomeModalProps {
  questTypeOrActivityId: string | null | undefined;
  recordStatus: 'idle' | 'loading' | 'success';
  /** 서버가 내려주는 시즌 표기(예: `'26 가을시즌`). 참여가 아직 없으면 undefined 다. */
  season?: string;
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

/**
 * 스타팅데이 환영 문구. 시즌 표기는 서버 값을 그대로 쓴다 —
 * 하드코딩하면 시즌이 바뀔 때마다 여기가 옛 시즌으로 남는다.
 */
const crusherClubWelcomeTextParts = (
  nickname: string,
  season?: string,
): TextPart[] => [
  {text: season ? `${season} 크러셔클럽` : '크러셔클럽', bold: true},
  {text: '에 온 크루\n', bold: false},
  {text: nickname, bold: true},
  {text: '님 환영합니다!', bold: false},
];

/** 26 가을 스타팅데이 — 크루 구분 없이 콩알이 로티 하나를 쓴다(디자인 핸드오프 기준). */
const fall2026StartingDayAnimation: ModalAnimationType = {
  type: 'layers',
  layers: [
    {
      type: 'lottie',
      source: require('@/assets/animations/crusher_activity/starting_day/2026fall/congal_welcome.lottie'),
      scale: 1.0,
      offsetY: 30,
    },
    {
      type: 'image',
      source: require('@/assets/img/img_welcome_text.png'),
      scale: 1.05,
      offsetY: -82,
    },
  ],
};

const MODAL_CONFIG: Record<
  string,
  {
    buttonText: string;
    getTextParts: (nickname: string, season?: string) => TextPart[];
    animation: ModalAnimationType;
  }
> = {
  // 26 가을시즌. 키는 DB `crusher_club.quests[].id` 이자 QR 딥링크의 questTypeOrActivityId 다.
  // 세 크루가 스타팅데이를 한자리에서 해서 QR 이 하나고, 세 club 이 이 id 를 공유한다.
  starting_day_2026fall: {
    buttonText: '앞으로 잘해봐요!',
    getTextParts: crusherClubWelcomeTextParts,
    animation: fall2026StartingDayAnimation,
  },
  STARTING_DAY: {
    buttonText: '앞으로 잘해봐요!',
    getTextParts: crusherClubWelcomeTextParts,
    animation: {
      type: 'lottie',
      source: require('@/assets/animations/crusher_activity_welcome.lottie'),
    },
  },
  'editor-crew-starting-day': {
    buttonText: '앞으로 잘해봐요!',
    getTextParts: crusherClubWelcomeTextParts,
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
          offsetX: 0,
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
    getTextParts: crusherClubWelcomeTextParts,
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
    getTextParts: crusherClubWelcomeTextParts,
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

function hasImageLayer(animation: ModalAnimationType): boolean {
  if (animation.type === 'image') {
    return true;
  }
  if (animation.type === 'layers') {
    return animation.layers.some(layer => layer.type === 'image');
  }
  return false;
}

export default function WelcomeModal({
  questTypeOrActivityId,
  recordStatus,
  season,
}: WelcomeModalProps) {
  const {userInfo} = useMe();
  const {width: viewportWidth} = useWindowDimensions();
  const [visible, setVisible] = useState(false);
  const [imageReady, setImageReady] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const config = questTypeOrActivityId
    ? MODAL_CONFIG[questTypeOrActivityId]
    : undefined;

  const needsImagePreload = config ? hasImageLayer(config.animation) : false;
  const allReady =
    recordStatus === 'success' && (imageReady || !needsImagePreload);

  useEffect(() => {
    // 모달은 questTypeOrActivityId가 있고 API 호출이 시작되면 표시
    setVisible(
      !!questTypeOrActivityId &&
        (recordStatus === 'loading' || recordStatus === 'success'),
    );
  }, [questTypeOrActivityId, recordStatus]);

  // Reset imageReady and fadeAnim when modal closes
  useEffect(() => {
    if (!visible) {
      setImageReady(false);
      fadeAnim.setValue(0);
    }
  }, [visible, fadeAnim]);

  // Fade in when all ready
  useEffect(() => {
    if (allReady && visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [allReady, visible, fadeAnim]);

  const handleImageLoad = useCallback(() => {
    setImageReady(true);
  }, []);

  const handleClose = () => {
    if (!allReady) {
      return;
    }
    setVisible(false);
  };

  if (!questTypeOrActivityId || !config) {
    return null;
  }

  const textParts = config.getTextParts(userInfo?.nickname || '', season);

  const renderAnimation = () => {
    if (config.animation.type === 'image') {
      return (
        <Image
          source={config.animation.source}
          onLoad={handleImageLoad}
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
                  onLoad={handleImageLoad}
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
        {/* dim 은 outer View 가 full-screen 으로 담당, 콘텐츠는 SafeAreaView 안에서 center 정렬 —
            home indicator/nav bar 와 겹치지 않게. */}
        <View className="flex-1 bg-blacka-80">
          <SafeAreaView
            edges={['top', 'bottom']}
            style={{flex: 1, justifyContent: 'center'}}>
            {/* Always mount animation layer (hidden) for image preloading */}
            <Animated.View style={{opacity: fadeAnim}}>
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
            </Animated.View>

            {!allReady && (
              <View className="absolute inset-0 items-center justify-center">
                <ActivityIndicator size="large" color={color.white} />
              </View>
            )}
          </SafeAreaView>
        </View>
      </SccTouchableWithoutFeedback>
    </Modal>
  );
}
