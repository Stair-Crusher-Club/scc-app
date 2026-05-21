import {BlurView} from '@sbaiahmed1/react-native-blur';
import React from 'react';
import {
  Dimensions,
  Image,
  Modal,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import styled from 'styled-components/native';

import {SccButton} from '@/components/atoms';
import {color} from '@/constant/color';
import {font} from '@/constant/font';

export type MissionCompletedOverlayVariant = 'mission' | 'outing-items';

interface MissionCompletedOverlayProps {
  isVisible: boolean;
  /**
   * 미션 완료 일러스트 통이미지 (figma popup img frame 그대로 export한 PNG).
   * sparkle/배경/캐릭터/외출템이 모두 합성된 한 장의 이미지.
   * Figma `1648:38681` 같은 img frame 노드. ratio 390:200 (= 1.95).
   */
  itemImage: number;
  description: string;
  confirmElementName: string;
  confirmLogParams?: Record<string, unknown>;
  variant?: MissionCompletedOverlayVariant;
  onClose: () => void;
}

const TITLE_IMAGE_BY_VARIANT: Record<MissionCompletedOverlayVariant, number> = {
  mission: require('@/assets/img/tutorial/mission_complete_title.png'),
  'outing-items': require('@/assets/img/tutorial/outing_items_collected_title.png'),
};

// Figma popup img frame: 390x200 (frame 폭 기준). 화면 폭에 맞춰 비례 적용.
const SCREEN_WIDTH = Dimensions.get('window').width;
const POPUP_IMG_DESIGN_RATIO = 200 / 390;
const POPUP_IMG_WIDTH = SCREEN_WIDTH;
const POPUP_IMG_HEIGHT = POPUP_IMG_WIDTH * POPUP_IMG_DESIGN_RATIO;

export default function MissionCompletedOverlay({
  isVisible,
  itemImage,
  description,
  confirmElementName,
  confirmLogParams,
  variant = 'mission',
  onClose,
}: MissionCompletedOverlayProps) {
  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}>
      {/* iOS Modal 은 별도 UIWindow 라 App.tsx 의 SafeAreaProvider context 가 끊긴다.
          react-native-safe-area-context 공식 권장 패턴대로 Modal 안에 SafeAreaProvider 를
          새로 wrap 해서 내부 SafeAreaView 가 올바른 insets 를 받게 한다. */}
      <SafeAreaProvider>
        {/* BlurView 는 blur 효과 전용 (overlayColor 떼고 옅게). Android 에서
            @sbaiahmed1/react-native-blur 의 overlayColor 가 navigationBarTranslucent
            로 확장된 Modal viewport 의 nav bar 영역까지 안 그려지는 케이스가 있어서
            dim 은 별도 View 로 명시 — RN 의 StyleSheet.absoluteFill 은 Modal window
            의 실제 layout bounds 를 그대로 사용한다. */}
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType="dark"
          blurAmount={Platform.OS === 'ios' ? 35 : 6}
        />
        <View
          style={[
            StyleSheet.absoluteFill,
            {backgroundColor: 'rgba(0,0,0,0.6)'},
          ]}
          pointerEvents="none"
        />
        {/* 콘텐츠는 SafeAreaView 안에서 center 정렬 — home indicator / nav bar 위로. */}
        <DimContent edges={['top', 'bottom']}>
          <Contents>
            <TitleImage
              source={TITLE_IMAGE_BY_VARIANT[variant]}
              resizeMode="contain"
            />
            <Image
              source={itemImage}
              style={{width: POPUP_IMG_WIDTH, height: POPUP_IMG_HEIGHT}}
              resizeMode="contain"
            />
            <FormattedDescription description={description} />
            <SccButton
              text="확인"
              elementName={confirmElementName}
              logParams={confirmLogParams}
              onPress={onClose}
              buttonColor="brand40"
              textColor="white"
              fontFamily={font.pretendardSemibold}
              fontSize={18}
              width={140}
              height={56}
              style={{borderRadius: 8}}
            />
          </Contents>
        </DimContent>
      </SafeAreaProvider>
    </Modal>
  );
}

const DimContent = styled(SafeAreaView)`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

const Contents = styled.View`
  align-items: center;
  gap: 20px;
`;

const TitleImage = styled.Image`
  width: 322px;
  height: 56px;
`;

/**
 * Figma 1648:39361 기준: 첫 줄(획득 문구)은 Bold, 그 다음 줄들은 Medium.
 * 한 `<Text>` 안에 nested Text로 두 weight를 섞어 동일 lineHeight/letterSpacing 유지.
 */
function FormattedDescription({description}: {description: string}) {
  const newlineIdx = description.indexOf('\n');
  const titleLine =
    newlineIdx === -1 ? description : description.slice(0, newlineIdx);
  const bodyLine = newlineIdx === -1 ? '' : description.slice(newlineIdx);
  return (
    <Description>
      <DescriptionTitle>{titleLine}</DescriptionTitle>
      {bodyLine}
    </Description>
  );
}

// Figma 1648:39361: 본문 라인은 Medium 20/28, 폭 311, white, text-shadow 0 0 4 rgba(0,0,0,0.25).
const Description = styled.Text.attrs({
  style: {
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: {width: 0, height: 0},
    textShadowRadius: 4,
  },
})`
  max-width: 90%;
  font-family: ${font.pretendardMedium};
  font-size: 20px;
  line-height: 28px;
  letter-spacing: -0.4px;
  text-align: center;
  color: ${color.white};
`;

// 첫 줄(획득 메시지)만 Bold weight로 강조.
const DescriptionTitle = styled.Text`
  font-family: ${font.pretendardBold};
  color: ${color.white};
`;
