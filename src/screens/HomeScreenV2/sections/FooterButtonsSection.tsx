import React from 'react';
import {Linking} from 'react-native';
import {useQuery} from '@tanstack/react-query';
import {useAtomValue} from 'jotai';
import styled from 'styled-components/native';

import Skeleton from '@/components/Skeleton';

import BoostersLogoSvg from '@/assets/icon/boosters_logo.svg';
import FooterAirplaneIcon from '@/assets/icon/ic_footer_airplane.svg';
import FooterCgvIcon from '@/assets/icon/ic_footer_cgv.svg';
import FooterCompassIcon from '@/assets/icon/ic_footer_compass.svg';
import FooterDonationIcon from '@/assets/icon/ic_footer_donation.svg';
import FooterInfoIcon from '@/assets/icon/ic_footer_info.svg';
import FooterNaverCafeIcon from '@/assets/icon/ic_footer_naver_cafe.svg';
import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {featureFlagAtom} from '@/atoms/Auth';
import {CrusherClubCrewTypeDto} from '@/generated-sources/openapi';
import useAppComponents from '@/hooks/useAppComponents';
import {LogParamsProvider} from '@/logging/LogParamsProvider';
import useNavigation from '@/navigation/useNavigation';

const DONATION_URL = 'https://staircrusher.club/donation';
// `{userId}` 는 WebViewScreen 진입 시 실제 userId 로 자동 치환된다 (externalUrlTemplating).
const CONTENT_REPORT_URL =
  'https://forms.staircrusher.club/app-feedback?userId={userId}';
const NOTICE_URL =
  'https://staircrusherclub.notion.site/1d5c9499b0608059994dcebcf13bb53f?v=1d5c9499b06080968da7000c18db4868&source=copy_link';
// 에디터크루 전용 롱리뷰 창구 2종. 둘 다 인앱 웹뷰가 아니라 외부 브라우저로 연다 —
// 네이버 카페 글쓰기는 네이버 로그인 세션이 필요하고, CGV 취재 페이지는 Tally 폼을
// 새 탭으로 여는 구조라 인앱 웹뷰에서는 작성 플로우가 끊긴다.
const LONG_REVIEW_CGV_URL = 'https://editor-crew.staircrusher.club/#/';
const LONG_REVIEW_VISIT_URL =
  'https://cafe.naver.com/f-e/cafes/31665149/menus/62';

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
  const featureFlags = useAtomValue(featureFlagAtom);

  const {data: crusherActivityData} = useQuery({
    queryKey: ['CrusherActivityPageData'],
    queryFn: async () => (await api.getCrusherActivityPageDataPost()).data,
    staleTime: 1000 * 60 * 5,
  });

  const isEditorCrew =
    crusherActivityData?.currentCrusherActivity?.crusherClub.crewType ===
    CrusherClubCrewTypeDto.EditorCrew;
  // USER_TUTORIAL flag 가 켜진 사용자에게만 튜토리얼 진입 버튼을 노출.
  // featureFlags === null (아직 로딩 중) 이면 버튼 노출 보류.
  const isTutorialEnabled =
    featureFlags?.enabledFlags.has('USER_TUTORIAL') ?? false;

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

  const goToTutorial = () => {
    navigation.navigate('TutorialMission', {});
  };

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

  const goToLongReviewCgv = () => {
    Linking.openURL(LONG_REVIEW_CGV_URL);
  };

  const goToLongReviewVisit = () => {
    Linking.openURL(LONG_REVIEW_VISIT_URL);
  };

  const goToNotice = () => {
    navigation.navigate('Webview', {
      fixedTitle: '공지사항',
      url: NOTICE_URL,
      forceHideFloatingBar: true,
    });
  };

  return (
    <LogParamsProvider params={{displaySectionName: 'footer_buttons_section'}}>
      <Container>
        {isEditorCrew && (
          <FooterRowGroup>
            <SccPressable
              style={{flex: 1}}
              elementName="home_v2_footer_long_review_cgv"
              onPress={goToLongReviewCgv}>
              <FooterRow>
                <RowContent>
                  <FooterCgvIcon width={16} height={16} />
                  <FooterText>롱리뷰(CGV)</FooterText>
                </RowContent>
              </FooterRow>
            </SccPressable>

            <SccPressable
              style={{flex: 1}}
              elementName="home_v2_footer_long_review_visit"
              onPress={goToLongReviewVisit}>
              <FooterRow>
                <RowContent>
                  <FooterNaverCafeIcon width={16} height={16} />
                  <FooterText>롱리뷰(방문 후기)</FooterText>
                </RowContent>
              </FooterRow>
            </SccPressable>
          </FooterRowGroup>
        )}

        {isTutorialEnabled && (
          <SccPressable
            elementName="home_v2_footer_tutorial"
            onPress={goToTutorial}>
            <FooterRow>
              <RowContent>
                <FooterCompassIcon width={16} height={16} />
                <FooterText>튜토리얼</FooterText>
              </RowContent>
            </FooterRow>
          </SccPressable>
        )}

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

        <SccPressable elementName="home_v2_footer_notice" onPress={goToNotice}>
          <FooterRow>
            <RowContent>
              <FooterInfoIcon width={16} height={16} />
              <FooterText>공지사항</FooterText>
            </RowContent>
          </FooterRow>
        </SccPressable>
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

// 2열 버튼 행. 한 줄에 두 개를 반반 나눠 쓴다 (Figma 350 = 171 + 8 + 171).
const FooterRowGroup = styled.View`
  flex-direction: row;
  gap: 8px;
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
