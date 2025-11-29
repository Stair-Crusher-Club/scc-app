import React, { useState, useEffect, useMemo } from 'react';
import { View, ScrollView, ActivityIndicator, Text } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import styled from 'styled-components/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { WebStackParamList } from '../../navigation/WebNavigation';
import { api, apiConfig } from '../../config/api';
import type { BbucleRoadSectionDto } from '@/generated-sources/openapi';
import { color } from '@/constant/color';

import HeaderSection from './sections/HeaderSection';
import RouteSection from './sections/RouteSection';
import MapOverviewSection from './sections/MapOverviewSection';
import TransportationSection from './sections/TransportationSection';
import TicketingSection from './sections/TicketingSection';
import WheelchairViewSection from './sections/WheelchairViewSection';
import NearbyRestaurantsSection from './sections/NearbyRestaurantsSection';
import NearbyCafesSection from './sections/NearbyCafesSection';

import {
  getBbucleRoadConfig,
  createEmptyBbucleRoadData,
} from './config/bbucleRoadData';
import { EditModeProvider, useEditMode } from './context/EditModeContext';
import EditSidebar from './edit/EditSidebar';

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

function renderSection(section: BbucleRoadSectionDto, index: number) {
  switch (section.sectionType) {
    case 'MAP_OVERVIEW':
      return <MapOverviewSection key={index} section={section} />;
    case 'TRAFFIC':
      return <TransportationSection key={index} section={section} />;
    case 'TICKETING':
      return <TicketingSection key={index} section={section} />;
    case 'WHEELCHAIR_VIEW':
      return <WheelchairViewSection key={index} section={section} />;
    case 'NEARBY_RESTAURANTS':
      return <NearbyRestaurantsSection key={index} section={section} />;
    case 'NEARBY_CAFES':
      return <NearbyCafesSection key={index} section={section} />;
    default:
      return null;
  }
}

/**
 * Edit Mode일 때의 콘텐츠 렌더링
 */
function EditModeContent() {
  const editContext = useEditMode();
  if (!editContext) return null;

  const { data } = editContext;

  return (
    <EditModeContainer>
      <MainContent>
        <ScrollView>
          <ContentWrapper>
            <HeaderSection
              titleImageUrl={data.titleImageUrl}
              summaryItems={data.summaryItems}
            />

            {data.routeSection && (
              <RouteSection routeSection={data.routeSection} />
            )}

            {data.sections.map((section: BbucleRoadSectionDto, index: number) =>
              renderSection(section, index),
            )}
          </ContentWrapper>
        </ScrollView>
      </MainContent>
      <EditSidebar />
    </EditModeContainer>
  );
}

export default function BbucleRoadScreen({ route }: BbucleRoadScreenProps) {
  const { bbucleRoadId } = route.params;
  const [accessToken, setAccessToken] = useState<string | null>(null);
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

  // Initialize anonymous login
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check localStorage for existing token
        const storedToken =
          typeof window !== 'undefined'
            ? window.localStorage.getItem('anonymousAccessToken')
            : null;
        const tokenExpiry =
          typeof window !== 'undefined'
            ? window.localStorage.getItem('anonymousTokenExpiry')
            : null;

        // Check if token exists and is not expired (10 years validity)
        if (storedToken && tokenExpiry) {
          const expiryTime = parseInt(tokenExpiry, 10);
          const currentTime = Date.now();

          if (currentTime < expiryTime) {
            // Use existing token
            console.log('Using existing anonymous token from localStorage');
            setAccessToken(storedToken);
            apiConfig.accessToken = storedToken;
            setIsInitializing(false);
            return;
          } else {
            // Token expired, clear localStorage
            console.log('Token expired, creating new anonymous login');
            if (typeof window !== 'undefined') {
              window.localStorage.removeItem('anonymousAccessToken');
              window.localStorage.removeItem('anonymousTokenExpiry');
            }
          }
        }

        // No valid token found, create new anonymous login
        console.log('Creating new anonymous login');
        const response = await api.createAnonymousUserPost();
        const { authTokens } = response.data;

        // Save to localStorage with 10 year expiry
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(
            'anonymousAccessToken',
            authTokens.accessToken,
          );
          window.localStorage.setItem(
            'anonymousTokenExpiry',
            String(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000),
          );
        }

        setAccessToken(authTokens.accessToken);
        apiConfig.accessToken = authTokens.accessToken;
        console.log('Anonymous login successful and saved to localStorage');
      } catch (error) {
        console.error('Anonymous login failed:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, []);

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

  // View Mode: API에서 데이터 로드
  return (
    <ViewModeContent
      bbucleRoadId={bbucleRoadId}
      accessToken={accessToken}
      isInitializing={isInitializing}
    />
  );
}

interface ViewModeContentProps {
  bbucleRoadId: string;
  accessToken: string | null;
  isInitializing: boolean;
}

function ViewModeContent({
  bbucleRoadId,
  accessToken,
  isInitializing,
}: ViewModeContentProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['bbucleRoadPage', bbucleRoadId],
    queryFn: async () => {
      const response = await api.getBbucleRoadPage({ bbucleRoadId });
      return response.data;
    },
    enabled: !!accessToken, // Only run query when we have a token
  });

  if (isInitializing) {
    return (
      <LoadingContainer>
        <LoadingText>인증 중...</LoadingText>
      </LoadingContainer>
    );
  }

  if (isLoading) {
    return (
      <LoadingContainer>
        <ActivityIndicator size="large" color="#007AFF" />
      </LoadingContainer>
    );
  }

  if (error || !data) {
    return (
      <ErrorContainer>
        <ErrorText>페이지를 불러올 수 없습니다.</ErrorText>
      </ErrorContainer>
    );
  }

  return (
    <Container>
      <ScrollView>
        <ContentWrapper>
          <HeaderSection
            titleImageUrl={data.titleImageUrl}
            summaryItems={data.summaryItems}
          />

          {data.routeSection && (
            <RouteSection routeSection={data.routeSection} />
          )}

          {data.sections.map((section: BbucleRoadSectionDto, index: number) =>
            renderSection(section, index),
          )}
        </ContentWrapper>
      </ScrollView>
    </Container>
  );
}

const Container = styled(View)`
  flex: 1;
  background-color: ${color.gray10};
`;

const EditModeContainer = styled(View)`
  flex: 1;
  flex-direction: row;
`;

const MainContent = styled(View)`
  flex: 1;
`;

const ContentWrapper = styled(View)`
  max-width: 1000px;
  width: 100%;
  align-self: center;
  background-color: ${color.gray10};
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
