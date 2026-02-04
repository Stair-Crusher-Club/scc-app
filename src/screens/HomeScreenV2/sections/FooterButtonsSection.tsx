import React from 'react';
import {Linking} from 'react-native';
import styled from 'styled-components/native';

import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {LogParamsProvider} from '@/logging/LogParamsProvider';
import useNavigation from '@/navigation/useNavigation';

const DONATION_URL = 'https://staircrusher.club/donation';
// TODO: 콘텐츠 제보 URL 확정 필요
const CONTENT_REPORT_URL = '';

export default function FooterButtonsSection() {
  const navigation = useNavigation();

  const goToGuide = () => {
    navigation.navigate('Webview', {
      fixedTitle: '계단뿌셔클럽 앱 사용설명서',
      url: 'https://admin.staircrusher.club/public/guide',
      headerVariant: 'navigation',
    });
  };

  const goToContentReport = () => {
    // TODO: 콘텐츠 제보 URL 확정 후 구현
    if (CONTENT_REPORT_URL) {
      navigation.navigate('Webview', {
        fixedTitle: '콘텐츠 제보',
        url: CONTENT_REPORT_URL,
      });
    }
  };

  const goToDonation = () => {
    Linking.openURL(DONATION_URL).catch(err =>
      console.error('Failed to open donation URL:', err),
    );
  };

  return (
    <LogParamsProvider params={{displaySectionName: 'footer_buttons_section'}}>
      <Container>
        <SccPressable
          elementName="home_v2_footer_guide"
          onPress={goToGuide}
          style={{flex: 1}}>
          <FooterButton>
            <FooterButtonText>앱 사용방법</FooterButtonText>
          </FooterButton>
        </SccPressable>
        <SccPressable
          elementName="home_v2_footer_report"
          onPress={goToContentReport}
          style={{flex: 1}}
          disabled={!CONTENT_REPORT_URL}>
          <FooterButton disabled={!CONTENT_REPORT_URL}>
            <FooterButtonText disabled={!CONTENT_REPORT_URL}>
              콘텐츠 제보
            </FooterButtonText>
          </FooterButton>
        </SccPressable>
        <SccPressable
          elementName="home_v2_footer_donation"
          onPress={goToDonation}
          style={{flex: 1}}>
          <FooterButton>
            <FooterButtonText>후원</FooterButtonText>
          </FooterButton>
        </SccPressable>
      </Container>
    </LogParamsProvider>
  );
}

const Container = styled.View`
  flex-direction: row;
  padding-horizontal: 20px;
  padding-vertical: 20px;
  gap: 8px;
  background-color: ${color.gray10};
`;

const FooterButton = styled.View<{disabled?: boolean}>`
  align-items: center;
  justify-content: center;
  padding-vertical: 12px;
  background-color: ${({disabled}) => (disabled ? color.gray10 : color.white)};
  border-radius: 8px;
  border-width: 1px;
  border-color: ${({disabled}) => (disabled ? color.gray20 : color.gray20)};
`;

const FooterButtonText = styled.Text<{disabled?: boolean}>`
  color: ${({disabled}) => (disabled ? color.gray40 : color.gray70)};
  font-size: 14px;
  font-family: ${font.pretendardMedium};
`;
