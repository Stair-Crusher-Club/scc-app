import React from 'react';
import {Linking} from 'react-native';
import styled from 'styled-components/native';

import BoostersLogoSvg from '@/assets/icon/boosters_logo.svg';
import FooterAirplaneIcon from '@/assets/icon/ic_footer_airplane.svg';
import FooterDonationIcon from '@/assets/icon/ic_footer_donation.svg';
import FooterInfoIcon from '@/assets/icon/ic_footer_info.svg';
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
        <SccPressable elementName="home_v2_footer_guide" onPress={goToGuide}>
          <FooterRow>
            <RowContent>
              <FooterInfoIcon width={16} height={16} />
              <FooterText>앱 사용방법</FooterText>
            </RowContent>
          </FooterRow>
        </SccPressable>

        <SccPressable
          elementName="home_v2_footer_report"
          onPress={goToContentReport}
          disabled={!CONTENT_REPORT_URL}>
          <FooterRow disabled={!CONTENT_REPORT_URL}>
            <RowContent>
              <FooterAirplaneIcon width={16} height={16} />
              <FooterText disabled={!CONTENT_REPORT_URL}>
                콘텐츠 제보
              </FooterText>
            </RowContent>
          </FooterRow>
        </SccPressable>

        <SccPressable
          elementName="home_v2_footer_donation"
          onPress={goToDonation}>
          <FooterRow>
            <RowContent>
              <FooterDonationIcon width={16} height={16} />
              <FooterText>후원</FooterText>
            </RowContent>
            <BoostersLogoSvg width={77} height={26} />
          </FooterRow>
        </SccPressable>
      </Container>
    </LogParamsProvider>
  );
}

const Container = styled.View`
  padding-horizontal: 20px;
  padding-top: 20px;
  padding-bottom: 40px;
  gap: 8px;
`;

const FooterRow = styled.View<{disabled?: boolean}>`
  background-color: ${color.white};
  border-radius: 8px;
  height: 48px;
  padding-horizontal: 14px;
  padding-vertical: 8px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  opacity: ${({disabled}) => (disabled ? 0.5 : 1)};
`;

const RowContent = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 6px;
`;

const FooterText = styled.Text<{disabled?: boolean}>`
  color: ${({disabled}) => (disabled ? color.gray40 : color.gray60)};
  font-size: 14px;
  font-family: ${font.pretendardMedium};
  line-height: 20px;
  letter-spacing: -0.28px;
`;
