import React from 'react';
import {Image, Modal, View} from 'react-native';
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import styled from 'styled-components/native';

import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';
import {font} from '@/constant/font';

interface HiddenMissionCollectedBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
}

/**
 * 히든 미션 (앱 사용 후기) 완료 시 노출되는 풀스크린 dim modal.
 *
 * Figma node 1648:40810 (contents) 기준:
 *  - 풀스크린 dim (rgba(0,0,0,0.6) 정도)
 *  - 제목 "히든템 수집 완료!" — Pretendard ExtraBold 44/56, 그라디언트
 *    (linear-gradient 111.51deg, #67C4FF 3.72%, #D5F42E 136.44%)
 *  - 이미지 200x390 (잔디밭 윌리 + 모자 컬러)
 *  - 부제 "이제,\n새로운 곳으로 떠나봐요!" — Pretendard Medium 20/28, white, ls -0.4
 *  - "확인" 버튼 140x56, brand40, 8px radius, Pretendard SemiBold 18/26 white
 *
 * 그라디언트는 react-native-svg의 SvgText + LinearGradient fill을 사용한다
 * (RN은 background-clip: text 그라디언트를 직접 지원하지 않음).
 */
export default function HiddenMissionCollectedBottomSheet({
  isVisible,
  onClose,
}: HiddenMissionCollectedBottomSheetProps) {
  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}>
      <DimRoot>
        <ContentsWrapper>
          <GradientTitle />
          <ImageWrapper>
            <Image
              source={require('@/assets/img/tutorial/hidden_collected_willy.png')}
              style={{width: 320, height: 200}}
              resizeMode="contain"
            />
          </ImageWrapper>
          <DescriptionWrapper>
            <Description>{'이제,\n새로운 곳으로 떠나봐요!'}</Description>
            <ConfirmButton
              elementName="tutorial_hidden_mission_collected_confirm"
              onPress={onClose}>
              <ConfirmButtonText>확인</ConfirmButtonText>
            </ConfirmButton>
          </DescriptionWrapper>
        </ContentsWrapper>
        {/* 화면 빈 영역 탭으로 닫지 못하도록 의도적으로 background tap handler 없음 */}
        <FullSurface pointerEvents="none">
          <View />
        </FullSurface>
      </DimRoot>
    </Modal>
  );
}

/**
 * "히든템 수집 완료!" 그라디언트 텍스트. Figma 1648:40810 그라디언트:
 *   linear-gradient(111.51deg, #67C4FF 3.72%, #D5F42E 136.44%)
 */
function GradientTitle() {
  return (
    <Svg width={340} height={64} style={{marginBottom: 20}}>
      <Defs>
        <SvgLinearGradient
          id="hiddenMissionGradient"
          x1="0"
          y1="0"
          x2="1"
          y2="0.3">
          <Stop offset="0" stopColor="#67C4FF" />
          <Stop offset="1" stopColor="#D5F42E" />
        </SvgLinearGradient>
      </Defs>
      <SvgText
        x="170"
        y="48"
        textAnchor="middle"
        fontFamily={font.pretendardExtraBold}
        fontSize="44"
        fontWeight="800"
        fill="url(#hiddenMissionGradient)">
        히든템 수집 완료!
      </SvgText>
    </Svg>
  );
}

const DimRoot = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.6);
  align-items: center;
  justify-content: center;
  padding: 0 24px;
`;

const ContentsWrapper = styled.View`
  align-items: center;
  width: 100%;
`;

const ImageWrapper = styled.View`
  width: 100%;
  height: 200px;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
`;

const DescriptionWrapper = styled.View`
  align-items: center;
  gap: 20px;
`;

const Description = styled.Text`
  font-family: ${font.pretendardMedium};
  font-size: 20px;
  line-height: 28px;
  letter-spacing: -0.4px;
  color: ${color.white};
  text-align: center;
  text-shadow-color: rgba(0, 0, 0, 0.25);
  text-shadow-radius: 4px;
  text-shadow-offset: 0px 0px;
`;

const ConfirmButton = styled(SccPressable)`
  width: 140px;
  height: 56px;
  background-color: ${color.brand40};
  border-radius: 8px;
  align-items: center;
  justify-content: center;
`;

const ConfirmButtonText = styled.Text`
  font-family: ${font.pretendardSemibold};
  font-size: 18px;
  line-height: 26px;
  letter-spacing: -0.36px;
  color: ${color.white};
`;

const FullSurface = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;
