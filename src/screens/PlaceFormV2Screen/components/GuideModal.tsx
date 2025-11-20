import React from 'react';

import {SccButton} from '@/components/atoms';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {Image, Modal, ScrollView} from 'react-native';
import styled from 'styled-components/native';

import type {GuideContent} from '../constants';

interface GuideModalProps {
  visible: boolean;
  guideContent: GuideContent;
  onDismissPermanently: () => void;
  onConfirm: () => void;
  onRequestClose: () => void;
}

export default function GuideModal({
  visible,
  guideContent,
  onDismissPermanently,
  onConfirm,
  onRequestClose,
}: GuideModalProps) {
  if (!guideContent) {
    return null;
  }

  const {image, title, steps, additionalInfo} = guideContent;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onRequestClose}>
      <GuideModalContainer>
        <ScrollView contentContainerStyle={{flexGrow: 1}}>
          <ContentContainer>
            {image && (
              <ImageWrapper>
                <Image
                  source={image}
                  style={{width: '100%', height: '100%'}}
                  resizeMode="cover"
                />
              </ImageWrapper>
            )}

            {/* 설명 섹션 */}
            <DescriptionSection>
              {/* 타이틀 */}
              <TitleText>{title}</TitleText>

              {/* 순서 단계 */}
              {steps && steps.length > 0 && (
                <StepsContainer>
                  {steps.map((step, index) => (
                    <React.Fragment key={step.number}>
                      <StepItem>
                        <StepNumberCircle>
                          <StepNumber>{step.number}</StepNumber>
                        </StepNumberCircle>
                        <StepDescription>{step.description}</StepDescription>
                      </StepItem>
                      {index < steps.length - 1 && <StepConnector />}
                    </React.Fragment>
                  ))}
                </StepsContainer>
              )}

              {/* 추가 정보 */}
              {additionalInfo && (
                <AdditionalInfo>{additionalInfo}</AdditionalInfo>
              )}
            </DescriptionSection>
          </ContentContainer>
        </ScrollView>

        <ButtonWrapper>
          <SccButton
            elementName="guide_modal_dismiss"
            text="다시보지 않기"
            onPress={onDismissPermanently}
            buttonColor="gray10"
            textColor="black"
            fontFamily={font.pretendardMedium}
            style={{maxWidth: 132, width: '100%'}}
          />
          <SccButton
            elementName="guide_modal_confirm"
            text="확인했어요!"
            onPress={onConfirm}
            buttonColor="brandColor"
            textColor="white"
            fontFamily={font.pretendardBold}
            style={{flex: 1}}
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

const ContentContainer = styled.View`
  flex: 1;
  gap: 24px;
`;

const ImageWrapper = styled.View`
  max-height: 260px;
`;

const DescriptionSection = styled.View`
  padding: 0 20px 40px 20px;
  gap: 20px;
`;

const TitleText = styled.Text`
  font-size: 22px;
  line-height: 30px;
  font-family: ${font.pretendardSemibold};
  color: ${color.gray80};
  text-align: center;
`;

const StepsContainer = styled.View``;

const StepItem = styled.View`
  flex-direction: row;
  gap: 10px;
  align-items: center;
`;

const StepNumberCircle = styled.View`
  width: 24px;
  height: 24px;
  border-radius: 12px;
  background-color: ${color.gray15};
  align-items: center;
  justify-content: center;
`;

const StepNumber = styled.Text`
  font-size: 13px;
  font-family: ${font.pretendardMedium};
  color: ${color.gray80};
`;

const StepDescription = styled.Text`
  flex: 1;
  font-size: 18px;
  line-height: 26px;
  font-family: ${font.pretendardMedium};
  color: ${color.gray80};
`;

const StepConnector = styled.View`
  width: 2px;
  height: 20px;
  background-color: ${color.gray15};
  margin-left: 11px;
  margin-top: 4px;
  margin-bottom: 4px;
`;

const AdditionalInfo = styled.Text`
  font-size: 14px;
  line-height: 22px;
  font-family: ${font.pretendardMedium};
  color: ${color.gray90};
  background-color: ${color.gray10};
  border-radius: 14px;
  padding: 12px;
`;

const ButtonWrapper = styled.View`
  flex-direction: row;
  padding: 12px 20px;
  gap: 8px;
`;
