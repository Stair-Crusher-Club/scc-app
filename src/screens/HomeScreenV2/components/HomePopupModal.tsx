import React, {useState} from 'react';
import {Dimensions, Modal} from 'react-native';
import styled from 'styled-components/native';

import CloseIcon from '@/assets/icon/close.svg';
import SccRemoteImage from '@/components/SccRemoteImage';
import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import type {HomePopupDto} from '@/generated-sources/openapi';

const SCREEN_WIDTH = Dimensions.get('window').width;
const POPUP_HORIZONTAL_PADDING = 24;
const POPUP_WIDTH = SCREEN_WIDTH - POPUP_HORIZONTAL_PADDING * 2;
const BORDER_RADIUS = 12;

interface HomePopupModalProps {
  popup: HomePopupDto;
  visible: boolean;
  onClose: () => void;
  onImageClick: () => void;
  onDismissPermanently: () => void;
}

export default function HomePopupModal({
  popup,
  visible,
  onClose,
  onImageClick,
  onDismissPermanently,
}: HomePopupModalProps) {
  const [imageReady, setImageReady] = useState(false);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent>
      <Overlay>
        <BackgroundTouchable
          elementName="home-popup-overlay-background"
          onPress={onClose}
          disableLogging
        />
        <ContentContainer style={{opacity: imageReady ? 1 : 0}}>
          <ImageContainer>
            <SccPressable elementName="home-popup-image" onPress={onImageClick}>
              <SccRemoteImage
                imageUrl={popup.imageUrl}
                style={{width: POPUP_WIDTH}}
                resizeMode="contain"
                wrapperBackgroundColor={null}
                onReady={() => setImageReady(true)}
                priority="high"
              />
            </SccPressable>
            <CloseButton
              elementName="home-popup-close-button"
              onPress={onClose}>
              <CloseIconWrapper>
                <CloseIcon width={12} height={12} color={color.white} />
              </CloseIconWrapper>
            </CloseButton>
          </ImageContainer>
          <BottomContainer>
            <SccPressable
              elementName="home-popup-do-not-show-again"
              onPress={onDismissPermanently}>
              <DismissText>다시 보지 않기</DismissText>
            </SccPressable>
          </BottomContainer>
        </ContentContainer>
      </Overlay>
    </Modal>
  );
}

// Styled components

const Overlay = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: ${color.blacka50};
`;

const BackgroundTouchable = styled(SccPressable)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

const ContentContainer = styled.View`
  width: ${POPUP_WIDTH}px;
`;

const ImageContainer = styled.View`
  border-top-left-radius: ${BORDER_RADIUS}px;
  border-top-right-radius: ${BORDER_RADIUS}px;
  overflow: hidden;
`;

const CloseButton = styled(SccPressable)`
  position: absolute;
  top: 12px;
  right: 12px;
  width: 28px;
  height: 28px;
  border-radius: 14px;
  background-color: ${color.blacka40};
  justify-content: center;
  align-items: center;
`;

const CloseIconWrapper = styled.View`
  justify-content: center;
  align-items: center;
`;

const BottomContainer = styled.View`
  background-color: ${color.white};
  border-bottom-left-radius: ${BORDER_RADIUS}px;
  border-bottom-right-radius: ${BORDER_RADIUS}px;
  padding-horizontal: 16px;
  padding-vertical: 12px;
`;

const DismissText = styled.Text`
  font-size: 14px;
  font-family: ${font.pretendardRegular};
  color: ${color.gray80};
  text-decoration-line: underline;
`;
