import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, ScrollView, Text, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { WebStackParamList } from '../../navigation/WebNavigation';
import { api, apiConfig } from '../../config/api';
import { color } from '@/constant/color';

import HeaderSection from './sections/HeaderSection';
import OverviewSection from './sections/OverviewSection';
import RouteSection from './sections/RouteSection';
import TicketInfoSection from './sections/TicketInfoSection';
import SeatViewSection from './sections/SeatViewSection';
import NearbyPlacesSection from './sections/NearbyPlacesSection';
import ReviewSection from './sections/ReviewSection';
import CTAFooterSection from './sections/CTAFooterSection';
import StickyTabHeader, { SectionTab } from './components/StickyTabHeader';
import useSectionNavigation from './hooks/useSectionNavigation';

import {
  getBbucleRoadConfig,
  createEmptyBbucleRoadData,
  type BbucleRoadData,
} from './config/bbucleRoadData';
import { EditModeProvider, useEditMode } from './context/EditModeContext';
import { ResponsiveProvider } from './context/ResponsiveContext';
import EditSidebar from './edit/EditSidebar';

// Section IDs for navigation
const SECTION_IDS = {
  OVERVIEW: 'overview-section',
  ROUTE: 'route-section',
  TICKET_INFO: 'ticket-info-section',
  SEAT_VIEW: 'seat-view-section',
  NEARBY_PLACES: 'nearby-places-section',
  REVIEW: 'review-section',
} as const;

type BbucleRoadScreenRouteProp = RouteProp<WebStackParamList, 'BbucleRoad'>;
type BbucleRoadScreenNavigationProp = NativeStackNavigationProp<
  WebStackParamList,
  'BbucleRoad'
>;

interface BbucleRoadScreenProps {
  route: BbucleRoadScreenRouteProp;
  navigation: BbucleRoadScreenNavigationProp;
}

/**
 * URL에서 editMode queryParam 확인
 */
function getIsEditMode(): boolean {
  if (typeof window === 'undefined') return false;
  const searchParams = new URLSearchParams(window.location.search);
  return searchParams.get('editMode') === 'true';
}

/**
 * 순수 View 컴포넌트 - data 받아서 그리기만
 */
function BbucleRoadContent({ data }: { data: BbucleRoadData }) {
  const availableSections = useMemo(() => {
    const sections: SectionTab[] = [];
    if (data.overviewSection) {
      sections.push({ id: SECTION_IDS.OVERVIEW, label: '한눈에보기' });
    }
    if (data.routeSection) {
      sections.push({ id: SECTION_IDS.ROUTE, label: '교통정보' });
    }
    if (data.ticketInfoSection) {
      sections.push({ id: SECTION_IDS.TICKET_INFO, label: '매표정보' });
    }
    if (data.seatViewSection) {
      sections.push({ id: SECTION_IDS.SEAT_VIEW, label: '시야정보' });
    }
    if (data.nearbyPlacesSection) {
      sections.push({ id: SECTION_IDS.NEARBY_PLACES, label: '근처맛집' });
    }
    if (data.reviewSection) {
      sections.push({ id: SECTION_IDS.REVIEW, label: '방문후기' });
    }
    return sections;
  }, [
    data.overviewSection,
    data.routeSection,
    data.ticketInfoSection,
    data.seatViewSection,
    data.nearbyPlacesSection,
    data.reviewSection,
  ]);

  const sectionIds = useMemo(
    () => availableSections.map((s) => s.id),
    [availableSections],
  );

  const { activeSection, scrollToSection } = useSectionNavigation({ sectionIds });

  return (
    <ScrollView>
      <ContentWrapper>
        <HeaderSection
          titleImageUrl={data.titleImageUrl}
          headerBackgroundImageUrl={data.headerBackgroundImageUrl}
          lastUpdatedDate={data.lastUpdatedDate}
          wheelchairUserCommentHtml={data.wheelchairUserCommentHtml}
        />

        {availableSections.length > 0 && (
          <StickyTabHeader
            sections={availableSections}
            activeSection={activeSection}
            onTabPress={scrollToSection}
          />
        )}

        {data.overviewSection && (
          <OverviewSection
            overviewSection={data.overviewSection}
            sectionId={SECTION_IDS.OVERVIEW}
          />
        )}

        {data.routeSection && (
          <RouteSection
            routeSection={data.routeSection}
            sectionId={SECTION_IDS.ROUTE}
          />
        )}

        {data.ticketInfoSection && (
          <TicketInfoSection
            ticketInfoSection={data.ticketInfoSection}
            sectionId={SECTION_IDS.TICKET_INFO}
          />
        )}

        {data.seatViewSection && (
          <SeatViewSection
            seatViewSection={data.seatViewSection}
            sectionId={SECTION_IDS.SEAT_VIEW}
          />
        )}

        {data.nearbyPlacesSection && (
          <NearbyPlacesSection
            nearbyPlacesSection={data.nearbyPlacesSection}
            sectionId={SECTION_IDS.NEARBY_PLACES}
          />
        )}

        {data.reviewSection && (
          <ReviewSection
            reviewSection={data.reviewSection}
            sectionId={SECTION_IDS.REVIEW}
          />
        )}

        {data.ctaFooterSection && (
          <CTAFooterSection ctaFooterSection={data.ctaFooterSection} />
        )}
      </ContentWrapper>
    </ScrollView>
  );
}

/**
 * 섹션 추가 템플릿 정의
 */
type SectionKey = keyof Pick<
  BbucleRoadData,
  | 'overviewSection'
  | 'routeSection'
  | 'ticketInfoSection'
  | 'seatViewSection'
  | 'nearbyPlacesSection'
  | 'reviewSection'
  | 'ctaFooterSection'
>;

interface SectionTemplate {
  key: SectionKey;
  label: string;
  defaultData: NonNullable<BbucleRoadData[SectionKey]>;
}

const SECTION_TEMPLATES: SectionTemplate[] = [
  {
    key: 'overviewSection',
    label: '한눈에보기',
    defaultData: {
      title: '근처 정보 한눈에 보기',
      subtitle: '한눈에 보기',
      mapImageUrl: '',
    },
  },
  {
    key: 'routeSection',
    label: '동선정보',
    defaultData: {
      title: '동선정보',
      routes: [
        {
          id: `route-${Date.now()}`,
          tabLabel: '새 동선',
          tabIconType: 'SUBWAY' as const,
          descriptionImageUrl: '',
          interactiveImage: { url: '', clickableRegions: [] },
        },
      ],
    },
  },
  {
    key: 'ticketInfoSection',
    label: '매표정보',
    defaultData: {
      title: '매표정보',
      imageUrl: '',
      tips: [],
    },
  },
  {
    key: 'seatViewSection',
    label: '시야정보',
    defaultData: {
      title: '시야정보',
      descriptionHtmls: [],
      interactiveImage: { url: '', clickableRegions: [] },
    },
  },
  {
    key: 'nearbyPlacesSection',
    label: '근처 장소',
    defaultData: {
      title: '근처 장소 정보',
      mapImageUrl: '',
      listImageUrl: '',
      naverListUrl: 'https://map.naver.com',
      morePlacesUrl: 'https://map.naver.com',
    },
  },
  {
    key: 'reviewSection',
    label: '방문후기',
    defaultData: {
      titleLine1: '장소명',
      titleLine2: '휠체어 이용자의 후기',
      descriptionHtmls: [],
    },
  },
  {
    key: 'ctaFooterSection',
    label: 'CTA 푸터',
    defaultData: {
      buttonUrl: 'https://forms.staircrusher.club/contents-alarm',
    },
  },
];

/**
 * Edit Mode 전용 래퍼
 */
function EditModeContent() {
  const editContext = useEditMode();
  if (!editContext) return null;

  const { data, updateData } = editContext;

  const handleAddSection = useCallback(
    (key: SectionKey, defaultData: NonNullable<BbucleRoadData[SectionKey]>) => {
      updateData((prev) => ({
        ...prev,
        [key]: defaultData,
      }));
    },
    [updateData],
  );

  return (
    <EditModeContainer>
      <MainContent>
        <BbucleRoadContent data={data} />
        {SECTION_TEMPLATES.map(
          (template) =>
            !data[template.key] && (
              <AddSectionContainer key={template.key}>
                <AddSectionButton
                  onPress={() => handleAddSection(template.key, template.defaultData)}
                >
                  <AddSectionButtonText>+ {template.label} 섹션 추가</AddSectionButtonText>
                </AddSectionButton>
              </AddSectionContainer>
            ),
        )}
      </MainContent>
      <EditSidebar />
    </EditModeContainer>
  );
}

export default function BbucleRoadScreen({ route }: BbucleRoadScreenProps) {
  const { bbucleRoadId } = route.params;
  const [isInitializing, setIsInitializing] = useState(true);

  const isEditMode = useMemo(() => getIsEditMode(), []);

  // Config에서 데이터 확인
  const configData = useMemo(
    () => getBbucleRoadConfig(bbucleRoadId),
    [bbucleRoadId],
  );

  // Edit Mode용 초기 데이터
  const editModeInitialData = useMemo(() => {
    if (configData) return configData;
    return createEmptyBbucleRoadData(bbucleRoadId);
  }, [configData, bbucleRoadId]);

  // Initialize auth for edit mode (image upload)
  useEffect(() => {
    if (!isEditMode) {
      setIsInitializing(false);
      return;
    }

    const initializeAuth = async () => {
      try {
        // Check localStorage for existing token
        const storedToken = window.localStorage.getItem('sccAccessToken');
        if (storedToken) {
          apiConfig.accessToken = storedToken;
          setIsInitializing(false);
          return;
        }

        // Check for anonymous token
        const anonymousToken = window.localStorage.getItem('anonymousAccessToken');
        const tokenExpiry = window.localStorage.getItem('anonymousTokenExpiry');

        if (anonymousToken && tokenExpiry) {
          const expiryTime = parseInt(tokenExpiry, 10);
          if (Date.now() < expiryTime) {
            apiConfig.accessToken = anonymousToken;
            setIsInitializing(false);
            return;
          }
        }

        // Create new anonymous login
        const response = await api.createAnonymousUserPost();
        const { authTokens } = response.data;

        window.localStorage.setItem('anonymousAccessToken', authTokens.accessToken);
        window.localStorage.setItem(
          'anonymousTokenExpiry',
          String(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000),
        );

        apiConfig.accessToken = authTokens.accessToken;
      } catch (error) {
        console.error('Anonymous login failed:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, [isEditMode]);

  // Edit Mode: Config 데이터 사용
  if (isEditMode) {
    if (isInitializing) {
      return (
        <LoadingContainer>
          <LoadingText>인증 중...</LoadingText>
        </LoadingContainer>
      );
    }

    return (
      <Container>
        <ResponsiveProvider>
          <EditModeProvider
            isEditMode={true}
            initialData={editModeInitialData}
          >
            <EditModeContent />
          </EditModeProvider>
        </ResponsiveProvider>
      </Container>
    );
  }

  // View Mode: Config 데이터 사용
  if (!configData) {
    return (
      <ErrorContainer>
        <ErrorText>페이지를 찾을 수 없습니다.</ErrorText>
      </ErrorContainer>
    );
  }

  return (
    <Container>
      <ResponsiveProvider>
        <BbucleRoadContent data={configData} />
      </ResponsiveProvider>
    </Container>
  );
}

const Container = styled(View)`
  flex: 1;
  background-color: ${color.white};
`;

const EditModeContainer = styled(View)`
  flex: 1;
  flex-direction: row;
`;

const MainContent = styled(View)`
  flex: 1;
`;

const ContentWrapper = styled(View)`
  width: 100%;
`;

const LoadingContainer = styled(View)`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: ${color.white};
`;

const LoadingText = styled(Text)`
  font-size: 18px;
  color: ${color.gray60};
`;

const ErrorContainer = styled(View)`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: ${color.white};
  padding: 24px;
`;

const ErrorText = styled(Text)`
  font-size: 16px;
  color: ${color.gray60};
  text-align: center;
`;

const AddSectionContainer = styled(View)`
  padding: 24px 16px;
  align-items: center;
`;

const AddSectionButton = styled(TouchableOpacity)`
  padding: 20px 40px;
  background-color: ${color.iosBlue};
  border-radius: 12px;
`;

const AddSectionButtonText = styled(Text)`
  color: ${color.white};
  font-size: 16px;
  font-weight: 600;
`;
