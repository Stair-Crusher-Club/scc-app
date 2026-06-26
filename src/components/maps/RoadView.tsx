import React, {useState} from 'react';
import {Modal, Platform} from 'react-native';
import styled from 'styled-components/native';

import {SccPressable} from '@/components/SccPressable';
import {SccTouchableOpacity} from '@/components/SccTouchableOpacity';
import {color} from '@/constant/color';
import {font} from '@/constant/font';

import PanoramaCanvas from './PanoramaCanvas';

interface Props {
  position: {lat: number; lng: number};
  // 핀에 표시할 장소명.
  name: string;
}

/**
 * 로드뷰(네이버 파노라마) 미리보기 + 풀스크린.
 * - 미리보기: 고정 높이 박스에 비조작 파노라마 + 위 레이어 탭 → 풀스크린 오픈
 * - 풀스크린: RN Modal로 전체화면 조작 가능 파노라마 + 닫기 버튼
 * 내부 PanoramaCanvas만 플랫폼 분기(.web.tsx/.tsx)되어 웹/네이티브 동일 동작.
 */
export default function RoadView({position, name}: Props) {
  const [isFullScreen, setIsFullScreen] = useState(false);
  // Modal slide 애니메이션이 끝난 뒤(컨테이너가 실제 크기를 가진 뒤) 파노라마 WebView를
  // 마운트한다. 애니메이션 도중 마운트하면 0 크기로 초기화돼 빈 화면이 된다.
  const [isModalShown, setIsModalShown] = useState(false);
  // 핀이 입구를 가릴 때 끌 수 있다.
  const [showPin, setShowPin] = useState(true);

  return (
    <>
      <PreviewContainer>
        <Label>로드뷰</Label>
        <PreviewBox>
          {/* 풀스크린 중엔 미리보기 WebView를 언마운트한다. Android New Arch에서
              WebView 인스턴스 2개가 동시에 떠 있으면 한쪽이 빈 화면이 되는 이슈 회피. */}
          {!isFullScreen && (
            <PanoramaCanvas
              position={position}
              label={name}
              showPin={false}
              interactive={false}
              style={{width: '100%', height: '100%'}}
            />
          )}
          <PreviewOverlay
            elementName="pdp_roadview_preview"
            onPress={() => setIsFullScreen(true)}>
            <ExpandHint>탭하여 전체화면</ExpandHint>
          </PreviewOverlay>
        </PreviewBox>
      </PreviewContainer>

      <Modal
        visible={isFullScreen}
        animationType="slide"
        supportedOrientations={['portrait', 'landscape']}
        onShow={() => setIsModalShown(true)}
        onRequestClose={() => setIsFullScreen(false)}>
        <FullScreenContainer>
          {isModalShown && (
            <PanoramaCanvas
              position={position}
              label={name}
              showPin={showPin}
              interactive
              style={{flex: 1}}
            />
          )}
          <TopRightBar>
            <PinToggleButton
              elementName="pdp_roadview_toggle_pin"
              logParams={{showPin: !showPin}}
              onPress={() => setShowPin(prev => !prev)}>
              <PinToggleText>{showPin ? '핀 가리기' : '핀 보기'}</PinToggleText>
            </PinToggleButton>
            <CloseButton
              elementName="pdp_roadview_close"
              onPress={() => {
                setIsModalShown(false);
                setIsFullScreen(false);
              }}>
              <CloseText>닫기</CloseText>
            </CloseButton>
          </TopRightBar>
        </FullScreenContainer>
      </Modal>
    </>
  );
}

const PreviewContainer = styled.View`
  padding: 16px;
  gap: 8px;
`;

const Label = styled.Text`
  font-size: 16px;
  font-family: ${font.pretendardBold};
  color: ${color.black};
`;

const PreviewBox = styled.View`
  width: 100%;
  height: 160px;
  border-radius: 12px;
  overflow: hidden;
  background-color: ${color.gray10};
`;

const PreviewOverlay = styled(SccPressable)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  align-items: center;
  justify-content: flex-end;
  padding-bottom: 12px;
`;

const ExpandHint = styled.Text`
  font-size: 12px;
  font-family: ${font.pretendardMedium};
  color: ${color.white};
  background-color: rgba(0, 0, 0, 0.5);
  padding: 4px 10px;
  border-radius: 12px;
  overflow: hidden;
`;

const FullScreenContainer = styled.View`
  flex: 1;
  background-color: ${color.black};
`;

// 우상단에 핀 가리기 + 닫기 버튼을 가로로 나란히. 좌측 zoom 컨트롤과 겹치지 않는다.
const TopRightBar = styled.View`
  position: absolute;
  top: ${Platform.OS === 'web' ? '16px' : '48px'};
  right: 16px;
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const PillButton = styled(SccTouchableOpacity)`
  background-color: rgba(0, 0, 0, 0.6);
  padding: 8px 16px;
  border-radius: 20px;
`;

const CloseButton = styled(PillButton)``;

const CloseText = styled.Text`
  font-size: 14px;
  font-family: ${font.pretendardBold};
  color: ${color.white};
`;

const PinToggleButton = styled(PillButton)``;

const PinToggleText = styled.Text`
  font-size: 14px;
  font-family: ${font.pretendardBold};
  color: ${color.white};
`;
