import React from 'react';
import {Image, Modal, View} from 'react-native';
import styled from 'styled-components/native';

import {SccButton} from '@/components/atoms';
import {color} from '@/constant/color';
import {font} from '@/constant/font';

import CollectedGradientTitle from './CollectedGradientTitle';

interface MissionCompletedOverlayProps {
  isVisible: boolean;
  /** 미션 외출템 이미지 (require'd PNG). */
  itemImage: number;
  /** 강조 메시지 본문 (e.g. "계단뿌셔클럽 앱이 설치된 스마트폰 획득!\n###님 덕분에 장소 찾기가 쉬워졌어요!") */
  description: string;
  /** "확인" 버튼 elementName (logging). */
  confirmElementName: string;
  /** 추가 로그 파라미터 (mission_type 등). */
  confirmLogParams?: Record<string, unknown>;
  onClose: () => void;
}

/**
 * 윌리의 외출 NUX 튜토리얼 미션 완료 시 노출되는 전체 화면 팝업.
 *
 * Figma 1648:38667 (mission1), 1648:39265 (mission2), 1648:40400 (mission4) 디자인 기준.
 * MissionCompletedOverlay는 미션 타입에 종속되지 않는 공용 컴포넌트로,
 * 미션별 메타데이터(이미지/텍스트)는 호출 측에서 props로 주입한다.
 */
export default function MissionCompletedOverlay({
  isVisible,
  itemImage,
  description,
  confirmElementName,
  confirmLogParams,
  onClose,
}: MissionCompletedOverlayProps) {
  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}>
      <Dim>
        <Contents>
          <CollectedGradientTitle text="미션 완료" width={280} />
          <ItemImageWrapper>
            <Image
              source={itemImage}
              style={{width: 160, height: 200}}
              resizeMode="contain"
            />
          </ItemImageWrapper>
          <Description>{description}</Description>
          <View style={{height: 8}} />
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
      </Dim>
    </Modal>
  );
}

const Dim = styled.View`
  flex: 1;
  background-color: ${color.blacka70};
  align-items: center;
  justify-content: center;
  padding: 0 34px;
`;

const Contents = styled.View`
  align-items: center;
  gap: 20px;
`;

const ItemImageWrapper = styled.View`
  width: 200px;
  height: 200px;
  align-items: center;
  justify-content: center;
`;

const Description = styled.Text`
  font-family: ${font.pretendardBold};
  font-size: 20px;
  line-height: 28px;
  letter-spacing: -0.4px;
  text-align: center;
  color: ${color.white};
`;
