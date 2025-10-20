import React, {useEffect, useState} from 'react';
import {Image, Modal, ModalProps, ActivityIndicator} from 'react-native';
import styled from 'styled-components/native';

import {SccButton} from '@/components/atoms';
import SccPressable from '@/components/SccPressable';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {setDismissedToday} from '@/atoms/challengeModalAtoms';

interface LastMonthRankingModalProps extends ModalProps {
  challengeId: string;
  imageUrl: string;
  onClose: () => void;
}

export default function LastMonthRankingModal({
  challengeId,
  imageUrl,
  onClose,
  visible: _visible,
  ...props
}: LastMonthRankingModalProps) {
  const [visible, setVisible] = useState(_visible);
  const [dontShowToday, setDontShowToday] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    setVisible(_visible);
  }, [_visible]);

  const handleClose = () => {
    if (dontShowToday) {
      setDismissedToday(challengeId);
    }
    setVisible(false);
    onClose();
  };

  return (
    <Modal visible={visible} statusBarTranslucent transparent {...props}>
      <Backdrop>
        <Container>
          <ImageWrapper>
            {imageLoading && (
              <LoadingContainer>
                <ActivityIndicator size="large" color={color.brand60} />
              </LoadingContainer>
            )}
            <RankingImage
              source={{uri: imageUrl}}
              resizeMode="contain"
              onLoad={() => setImageLoading(false)}
              onError={() => setImageLoading(false)}
            />
          </ImageWrapper>
          <CheckboxContainer>
            <SccPressable
              onPress={() => setDontShowToday(!dontShowToday)}
              elementName="last_month_ranking_modal_dont_show_today"
              logParams={{challengeId, checked: !dontShowToday}}>
              <CheckboxRow>
                <Checkbox checked={dontShowToday}>
                  {dontShowToday && <CheckboxCheck>✓</CheckboxCheck>}
                </Checkbox>
                <CheckboxLabel>오늘 하루 보지 않기</CheckboxLabel>
              </CheckboxRow>
            </SccPressable>
          </CheckboxContainer>
          <ButtonContainer>
            <ConfirmButton
              text="확인"
              textColor="white"
              buttonColor="brandColor"
              fontFamily={font.pretendardBold}
              onPress={handleClose}
              elementName="last_month_ranking_modal_confirm"
              logParams={{challengeId, dontShowToday}}
            />
          </ButtonContainer>
        </Container>
      </Backdrop>
    </Modal>
  );
}

const Backdrop = styled.View({
  flex: 1,
  justifyContent: 'center',
  backgroundColor: 'rgba(0,0,0,0.5)',
  padding: 20,
});

const Container = styled.View({
  backgroundColor: color.white,
  borderRadius: 20,
  overflow: 'hidden',
});

const ImageWrapper = styled.View({
  width: '100%',
  aspectRatio: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: color.gray10,
});

const LoadingContainer = styled.View({
  position: 'absolute',
  width: '100%',
  height: '100%',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1,
});

const RankingImage = styled(Image)({
  width: '100%',
  height: '100%',
});

const CheckboxContainer = styled.View({
  paddingHorizontal: 20,
  paddingVertical: 16,
});

const CheckboxRow = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
});

const Checkbox = styled.View<{checked: boolean}>(({checked}) => ({
  width: 20,
  height: 20,
  borderRadius: 4,
  borderWidth: 1.5,
  borderColor: checked ? color.brand60 : color.gray40,
  backgroundColor: checked ? color.brand60 : color.white,
  justifyContent: 'center',
  alignItems: 'center',
}));

const CheckboxCheck = styled.Text({
  color: color.white,
  fontSize: 14,
  fontFamily: font.pretendardBold,
});

const CheckboxLabel = styled.Text({
  color: color.black,
  fontSize: 14,
  fontFamily: font.pretendardRegular,
});

const ButtonContainer = styled.View({
  flexDirection: 'row',
  gap: 10,
  paddingVertical: 20,
  paddingHorizontal: 20,
});

const ConfirmButton = styled(SccButton)`
  flex: 1;
`;
