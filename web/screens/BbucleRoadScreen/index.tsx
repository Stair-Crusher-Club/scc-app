import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, ScrollView, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { WebStackParamList } from '../../navigation/WebNavigation';
import { api, apiConfig } from '../../config/api';
import { color } from '@/constant/color';

import HeaderSection from './sections/HeaderSection';
import RouteSection from './sections/RouteSection';
import NearbyPlacesSection from './sections/NearbyPlacesSection';
import StickyTabHeader, { SectionTab } from './components/StickyTabHeader';
import useSectionNavigation from './hooks/useSectionNavigation';

import {
  getBbucleRoadConfig,
  createEmptyBbucleRoadData,
} from './config/bbucleRoadData';
import { EditModeProvider, useEditMode } from './context/EditModeContext';
import EditSidebar from './edit/EditSidebar';

// Section IDs for navigation
const SECTION_IDS = {
  ROUTE: 'route-section',
  NEARBY_PLACES: 'nearby-places-section',
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
 * Edit Mode일 때의 콘텐츠 렌더링
 */
function EditModeContent() {
  const editContext = useEditMode();
  if (!editContext) return null;

  const { data, updateData } = editContext;

  // Build sections array based on available data
  const availableSections = useMemo(() => {
    const sections: SectionTab[] = [];
    if (data.routeSection) {
      sections.push({ id: SECTION_IDS.ROUTE, label: '동선정보' });
    }
    if (data.nearbyPlacesSection) {
      sections.push({ id: SECTION_IDS.NEARBY_PLACES, label: '근처맛집' });
    }
    return sections;
  }, [data.routeSection, data.nearbyPlacesSection]);

  const sectionIds = useMemo(
    () => availableSections.map((s) => s.id),
    [availableSections],
  );

  const { activeSection, scrollToSection } = useSectionNavigation({ sectionIds });

  const handleAddRouteSection = useCallback(() => {
    updateData((prev) => ({
      ...prev,
      routeSection: {
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
    }));
  }, [updateData]);

  const handleAddNearbyPlacesSection = useCallback(() => {
    updateData((prev) => ({
      ...prev,
      nearbyPlacesSection: {
        title: '근처 장소 정보',
        mapImageUrl: '',
        listImageUrl: '',
        naverListUrl: 'https://map.naver.com',
        morePlacesUrl: 'https://map.naver.com',
      },
    }));
  }, [updateData]);

  return (
    <EditModeContainer>
      <MainContent>
        <ScrollView>
          <ContentWrapper>
            <HeaderSection
              titleImageUrl={data.titleImageUrl}
              summaryItems={data.summaryItems}
              summaryTitle={data.summaryTitle}
              summaryTitleColor={data.summaryTitleColor}
              summaryBackgroundImageUrl={data.summaryBackgroundImageUrl}
            />

            {availableSections.length > 0 && (
              <StickyTabHeader
                sections={availableSections}
                activeSection={activeSection}
                onTabPress={scrollToSection}
              />
            )}

            {data.routeSection ? (
              <RouteSection
                routeSection={data.routeSection}
                sectionId={SECTION_IDS.ROUTE}
              />
            ) : (
              <AddSectionContainer>
                <AddSectionButton onPress={handleAddRouteSection}>
                  <AddSectionButtonText>+ 동선정보 섹션 추가</AddSectionButtonText>
                </AddSectionButton>
              </AddSectionContainer>
            )}

            {data.nearbyPlacesSection ? (
              <NearbyPlacesSection
                title={data.nearbyPlacesSection.title}
                mapImageUrl={data.nearbyPlacesSection.mapImageUrl}
                listImageUrl={data.nearbyPlacesSection.listImageUrl}
                naverListUrl={data.nearbyPlacesSection.naverListUrl}
                morePlacesUrl={data.nearbyPlacesSection.morePlacesUrl}
                sectionId={SECTION_IDS.NEARBY_PLACES}
              />
            ) : (
              <AddSectionContainer>
                <AddSectionButton onPress={handleAddNearbyPlacesSection}>
                  <AddSectionButtonText>+ 근처 장소 섹션 추가</AddSectionButtonText>
                </AddSectionButton>
              </AddSectionContainer>
            )}

            <Footer />
          </ContentWrapper>
        </ScrollView>
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
        <EditModeProvider
          isEditMode={true}
          initialData={editModeInitialData}
        >
          <EditModeContent />
        </EditModeProvider>
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

  // Build sections array based on available data
  const availableSections: SectionTab[] = [];
  if (configData.routeSection) {
    availableSections.push({ id: SECTION_IDS.ROUTE, label: '동선정보' });
  }
  if (configData.nearbyPlacesSection) {
    availableSections.push({ id: SECTION_IDS.NEARBY_PLACES, label: '근처맛집' });
  }

  return (
    <ViewModeContent
      configData={configData}
      availableSections={availableSections}
    />
  );
}

/**
 * View Mode 콘텐츠 - 훅 사용을 위해 별도 컴포넌트로 분리
 */
function ViewModeContent({
  configData,
  availableSections,
}: {
  configData: NonNullable<ReturnType<typeof getBbucleRoadConfig>>;
  availableSections: SectionTab[];
}) {
  const sectionIds = useMemo(
    () => availableSections.map((s) => s.id),
    [availableSections],
  );

  const { activeSection, scrollToSection } = useSectionNavigation({ sectionIds });

  return (
    <Container>
      <ScrollView>
        <ContentWrapper>
          <HeaderSection
            titleImageUrl={configData.titleImageUrl}
            summaryItems={configData.summaryItems}
            summaryTitle={configData.summaryTitle}
            summaryTitleColor={configData.summaryTitleColor}
            summaryBackgroundImageUrl={configData.summaryBackgroundImageUrl}
          />

          {availableSections.length > 0 && (
            <StickyTabHeader
              sections={availableSections}
              activeSection={activeSection}
              onTabPress={scrollToSection}
            />
          )}

          {configData.routeSection && (
            <RouteSection
              routeSection={configData.routeSection}
              sectionId={SECTION_IDS.ROUTE}
            />
          )}

          {configData.nearbyPlacesSection && (
            <NearbyPlacesSection
              title={configData.nearbyPlacesSection.title}
              mapImageUrl={configData.nearbyPlacesSection.mapImageUrl}
              listImageUrl={configData.nearbyPlacesSection.listImageUrl}
              naverListUrl={configData.nearbyPlacesSection.naverListUrl}
              morePlacesUrl={configData.nearbyPlacesSection.morePlacesUrl}
              sectionId={SECTION_IDS.NEARBY_PLACES}
            />
          )}

          <Footer />
        </ContentWrapper>
      </ScrollView>
    </Container>
  );
}

const Container = styled(View)`
  flex: 1;
  background-color: white
`;

const EditModeContainer = styled(View)`
  flex: 1;
  flex-direction: row;
`;

const MainContent = styled(View)`
  flex: 1;
`;

const ContentWrapper = styled(View)`
  max-width: 1100px;
  width: 100%;
  align-self: center;
`;

const LoadingContainer = styled(View)`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: #ffffff;
`;

const LoadingText = styled(Text)`
  font-size: 18px;
  color: #666666;
`;

const ErrorContainer = styled(View)`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: #ffffff;
  padding: 24px;
`;

const ErrorText = styled(Text)`
  font-size: 16px;
  color: #666666;
  text-align: center;
`;

const AddSectionContainer = styled(View)`
  padding: 24px 16px;
  align-items: center;
`;

const AddSectionButton = styled(TouchableOpacity)`
  padding: 20px 40px;
  background-color: #007aff;
  border-radius: 12px;
`;

const AddSectionButtonText = styled(Text)`
  color: #fff;
  font-size: 16px;
  font-weight: 600;
`;

const Footer = styled(View)`
  height: 120px;
`;
