import type {ImageSourcePropType} from 'react-native';

import {SccButton} from '@/components/atoms';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {Image, Modal, ScrollView} from 'react-native';
import styled from 'styled-components/native';

interface GuideModalProps {
  visible: boolean;
  image: ImageSourcePropType;
  title: string;
  onDismissPermanently: () => void;
  onConfirm: () => void;
  onRequestClose: () => void;
}

export default function GuideModal({
  visible,
  image,
  title,
  onDismissPermanently,
  onConfirm,
  onRequestClose,
}: GuideModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onRequestClose}>
      <GuideModalContainer>
        <ScrollView contentContainerStyle={{flexGrow: 1}}>
          <ContentWrapper>
            <TitleText>{title}</TitleText>
            <ImageWrapper>
              <Image
                source={image}
                style={{width: '100%', height: '100%'}}
                resizeMode="contain"
              />
            </ImageWrapper>
          </ContentWrapper>
        </ScrollView>
        <ButtonWrapper>
          <SccButton
            elementName="guide_modal_dismiss"
            text="다시보지 않기"
            onPress={onDismissPermanently}
            buttonColor="gray50"
          />
          <SccButton
            elementName="guide_modal_confirm"
            text="확인했어요!"
            onPress={onConfirm}
            buttonColor="brandColor"
          />
        </ButtonWrapper>
      </GuideModalContainer>
    </Modal>
  );
}

const GuideModalContainer = styled.View`
  flex: 1;
  background-color: ${color.white};
`;

const ContentWrapper = styled.View`
  flex: 1;
  padding: 40px 20px;
  gap: 24px;
`;

const TitleText = styled.Text`
  font-size: 22px;
  line-height: 30px;
  font-family: ${font.pretendardSemibold};
  color: ${color.gray80};
  text-align: center;
`;

const ImageWrapper = styled.View`
  flex: 1;
  aspect-ratio: 1;
  border-radius: 20px;
  overflow: hidden;
`;

const ButtonWrapper = styled.View`
  padding: 12px 20px;
  gap: 8px;
  border-top-width: 1px;
  border-top-color: ${color.gray15};
`;
