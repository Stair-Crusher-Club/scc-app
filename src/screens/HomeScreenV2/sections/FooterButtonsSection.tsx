import React from 'react';
import {Linking} from 'react-native';
import {useQuery} from '@tanstack/react-query';
import styled from 'styled-components/native';

import Skeleton from '@/components/Skeleton';

import BoostersLogoSvg from '@/assets/icon/boosters_logo.svg';
import FooterAirplaneIcon from '@/assets/icon/ic_footer_airplane.svg';
import FooterDonationIcon from '@/assets/icon/ic_footer_donation.svg';
import FooterInfoIcon from '@/assets/icon/ic_footer_info.svg';
import FooterLongReviewIcon from '@/assets/icon/ic_footer_long_review.svg';
import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {CrusherClubCrewTypeDto} from '@/generated-sources/openapi';
import useAppComponents from '@/hooks/useAppComponents';
import {LogParamsProvider} from '@/logging/LogParamsProvider';
import useNavigation from '@/navigation/useNavigation';

const DONATION_URL = 'https://staircrusher.club/donation';
const CONTENT_REPORT_URL = 'https://forms.staircrusher.club/app-feedback';

const FOOTER_ROW_HEIGHT = 48;
const FOOTER_ROW_RADIUS = 8;

interface FooterButtonsSectionProps {
  isLoading: boolean;
}

export default function FooterButtonsSection({
  isLoading,
}: FooterButtonsSectionProps) {
  const navigation = useNavigation();
  const {api} = useAppComponents();

  const {data: crusherActivityData} = useQuery({
    queryKey: ['CrusherActivityPageData'],
    queryFn: async () => (await api.getCrusherActivityPageDataPost()).data,
    staleTime: 1000 * 60 * 5,
  });

  const isEditorCrew =
    crusherActivityData?.currentCrusherActivity?.crusherClub.crewType ===
    CrusherClubCrewTypeDto.EditorCrew;

  if (isLoading) {
    return (
      <Container>
        <Skeleton
          style={{height: FOOTER_ROW_HEIGHT, borderRadius: FOOTER_ROW_RADIUS}}
        />
        <Skeleton
          style={{height: FOOTER_ROW_HEIGHT, borderRadius: FOOTER_ROW_RADIUS}}
        />
        <Skeleton
          style={{height: FOOTER_ROW_HEIGHT, borderRadius: FOOTER_ROW_RADIUS}}
        />
      </Container>
    );
  }

  const goToGuide = () => {
    navigation.navigate('Webview', {
      fixedTitle: '계단뿌셔클럽 앱 사용설명서',
      url: 'https://admin.staircrusher.club/public/guide',
      headerVariant: 'navigation',
    });
  };

  const goToVoiceOfCustomer = () => {
    navigation.navigate('Webview', {
      fixedTitle: '계단뿌셔클럽 앱 의견 남기기',
      url: CONTENT_REPORT_URL,
    });
  };

  const goToDonation = () => {
    navigation.navigate('Webview', {
      fixedTitle: '계단뿌셔클럽 후원하기',
      url: DONATION_URL,
    });
  };

  const goToLongReview = () => {
    Linking.openURL('https://forms.gle/UZzVBhjZbPaexerR9');
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
          onPress={goToVoiceOfCustomer}>
          <FooterRow>
            <RowContent>
              <FooterAirplaneIcon width={16} height={16} />
              <FooterText>의견 남기기</FooterText>
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

        {isEditorCrew && (
          <SccPressable
            elementName="home_v2_footer_long_review"
            onPress={goToLongReview}>
            <FooterRow>
              <RowContent>
                <FooterLongReviewIcon width={16} height={16} />
                <FooterText>[크루전용] 롱리뷰 작성하기</FooterText>
              </RowContent>
            </FooterRow>
          </SccPressable>
        )}
      </Container>
    </LogParamsProvider>
  );
}

const Container = styled.View`
  padding-horizontal: 20px;
  padding-vertical: 40px;
  gap: 8px;
  background-color: ${color.gray15};
`;

const FooterRow = styled.View<{disabled?: boolean}>`
  background-color: ${color.white};
  border-radius: ${FOOTER_ROW_RADIUS}px;
  height: ${FOOTER_ROW_HEIGHT}px;
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
  color: ${({disabled}) => (disabled ? color.gray40 : color.gray60v2)};
  font-size: 14px;
  font-family: ${font.pretendardMedium};
  line-height: 20px;
  letter-spacing: -0.28px;
`;
