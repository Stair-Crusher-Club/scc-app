import {useBackHandler} from '@react-native-community/hooks';
import {BlurView} from '@sbaiahmed1/react-native-blur';
import React from 'react';
import {Dimensions, Image, Modal, StyleSheet, View} from 'react-native';
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
  // Modal 이 열려있을 때 Android hardware back 키가 호출 사이트 화면의 navigation back 으로
  // 까지 propagate 되어 사용자가 의도치 않게 화면 밖으로 튕겨나가는 케이스가 보고됨 (QA round3).
  // useBackHandler 를 visible 일 때 true 반환으로 등록해, Modal 내부에서 hardware back 을
  // 잡아 onClose 만 호출하고 react-navigation 까지 전파되지 않도록 한다.
  useBackHandler(() => {
    if (isVisible) {
      onClose();
      return true;
    }
    return false;
  });

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}>
      {/*
       * Figma 1648:38667 / 1648:39265 / 1648:40812 등 미션 완료 팝업의 backdrop 은
       * "검정 ~60% 반투명 dim + blur" 조합이다. `@sbaiahmed1/react-native-blur` 의 Android
       * 구현은 `setBlurType("dark")` → setBackgroundColor/setOverlayColor 로 색을 입히지만,
       * Modal 위에서 blur 캡처가 늦거나 prop 적용 순서 이슈로 실제로는 dim 색이 안 입혀져
       * 흰색 반투명으로 보이는 케이스가 있다 (QA round3 보고). BlurView 는 blur 효과만
       * 담당하고, 위에 별도 검정 반투명 View 를 stack 해서 dark dim 을 명시적으로 보장한다.
       */}
      <BlurView
        style={StyleSheet.absoluteFill}
        blurType="dark"
        blurAmount={10}
        reducedTransparencyFallbackColor={color.blacka70}
      />
      <View
        style={[
          StyleSheet.absoluteFill,
          {backgroundColor: 'rgba(0, 0, 0, 0.6)'},
        ]}
        pointerEvents="none"
      />
      <DimContent>
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
    </Modal>
  );
}

const DimContent = styled.View`
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
  width: 311px;
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
