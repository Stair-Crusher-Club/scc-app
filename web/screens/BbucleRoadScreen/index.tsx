import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { View, ScrollView, Text, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';

import type { WebStackParamList } from '../../navigation/WebNavigation';
import { api, apiConfig } from '../../config/api';
import { color } from '@/constant/color';
import { LogParamsProvider } from '@/logging/LogParamsProvider';
import { UpvoteTargetTypeDto } from '@/generated-sources/openapi';
import { useUpvoteToggle } from '@/hooks/useUpvoteToggle';
import useAppComponents from '@/hooks/useAppComponents';

import HeaderSection from './sections/HeaderSection';
import OverviewSection from './sections/OverviewSection';
import RouteSection from './sections/RouteSection';
import TicketInfoSection from './sections/TicketInfoSection';
import SeatViewSection from './sections/SeatViewSection';
import NearbyPlacesSection from './sections/NearbyPlacesSection';
import ReviewSection from './sections/ReviewSection';
import CTAFooterSection from './sections/CTAFooterSection';
import StickyTabHeader, { SectionTab } from './components/StickyTabHeader';
import FloatingHeader from './components/FloatingHeader';
import FloatingBottomBar from './components/FloatingBottomBar';
import useSectionNavigation from './hooks/useSectionNavigation';

import {
  getBbucleRoadConfig,
  createEmptyBbucleRoadData,
  type BbucleRoadData,
} from './config/bbucleRoadData';
import { EditModeProvider, useEditMode } from './context/EditModeContext';
import { ResponsiveProvider, useResponsive } from './context/ResponsiveContext';
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
function BbucleRoadContent({ data, bbucleRoadId }: { data: BbucleRoadData; bbucleRoadId: string }) {
  const { isDesktop } = useResponsive();
  const { api: appApi } = useAppComponents();

  // 스크롤 방향 감지 - BottomBar visibility
  const [isBottomBarVisible, setIsBottomBarVisible] = useState(true);
  const lastScrollY = useRef(0);
  const isTouching = useRef(false);
  const isScrollingUpRef = useRef(true);

  const handleScroll = useCallback((event: any) => {
    const currentScrollY = event.nativeEvent?.contentOffset?.y ?? 0;
    if (currentScrollY !== lastScrollY.current) {
      isScrollingUpRef.current = currentScrollY < lastScrollY.current;
      lastScrollY.current = currentScrollY;

      // 터치 중이 아닐 때만 상태 업데이트 (관성 스크롤)
      if (!isTouching.current) {
        setIsBottomBarVisible(isScrollingUpRef.current);
      }
    }
  }, []);

  const handleTouchStart = useCallback(() => {
    isTouching.current = true;
  }, []);

  const handleTouchEnd = useCallback(() => {
    isTouching.current = false;
    setIsBottomBarVisible(isScrollingUpRef.current);
  }, []);

  // 저장된 userId
  const myUserId = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem('bbucleRoadUserId');
  }, []);

  // Upvote 상태 조회
  const { data: upvoteDetails } = useQuery({
    queryKey: ['BbucleRoadUpvoteDetails', bbucleRoadId],
    queryFn: async () => {
      return await appApi.getUpvoteDetailsPost({
        targetType: UpvoteTargetTypeDto.BbucleRoad,
        id: bbucleRoadId,
      });
    },
    enabled: !!bbucleRoadId,
  });

  const upvotedUsers = upvoteDetails?.data?.upvotedUsers ?? [];
  const totalCount = upvotedUsers.length;
  const hasUpvoted = myUserId
    ? upvotedUsers.some((user: any) => user.userId === myUserId)
    : false;

  // Upvote 토글 hook
  const { isUpvoted, totalUpvoteCount, toggleUpvote } = useUpvoteToggle({
    initialIsUpvoted: hasUpvoted,
    initialTotalCount: totalCount,
    targetId: bbucleRoadId,
    targetType: UpvoteTargetTypeDto.BbucleRoad,
    placeId: '',
  });

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

  // CTA URL - ctaFooterSection의 buttonUrl 또는 기본값 사용
  const ctaButtonUrl = data.ctaFooterSection?.buttonUrl ?? 'https://forms.staircrusher.club/contents-alarm';

  const hasFloatingHeader = !!data.floatingHeaderTitle;

  return (
    <LogParamsProvider params={{ isDesktop }}>
      {hasFloatingHeader && (
        <FloatingHeader title={data.floatingHeaderTitle!} />
      )}
      <ScrollView
        onScroll={handleScroll}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        scrollEventThrottle={16}
      >
        <ContentWrapper hasFloatingHeader={hasFloatingHeader} isDesktop={isDesktop}>
          <HeaderSection
            titleImageUrl={data.titleImageUrl}
            mobileTitleImageUrl={data.mobileTitleImageUrl}
            headerBackgroundImageUrl={data.headerBackgroundImageUrl}
            mobileHeaderBackgroundImageUrl={data.mobileHeaderBackgroundImageUrl}
            headerImageCaption={data.headerImageCaption}
            lastUpdatedDate={data.lastUpdatedDate}
            wheelchairUserCommentHtml={data.wheelchairUserCommentHtml}
            wheelchairUserCommentHtmlMobile={data.wheelchairUserCommentHtmlMobile}
            titleImageWidth={data.titleImageWidth}
            mobileTitleImageWidth={data.mobileTitleImageWidth}
            wheelchairUserCommentLabel={data.wheelchairUserCommentLabel}
          />

          {availableSections.length > 0 && (
            <StickyTabHeader
              sections={availableSections}
              activeSection={activeSection}
              onTabPress={scrollToSection}
              topOffset={hasFloatingHeader ? (isDesktop ? 60 : 50) : 0}
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

          {/* CTA를 중간에 한번 더 출현시켜준다. */}
          {data.ctaFooterSection && (
            <CTAFooterSection ctaFooterSection={data.ctaFooterSection} hideCharacter />
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

          {/* FloatingBottomBar 공간 확보 */}
          <BottomBarSpacer isDesktop={isDesktop} />
        </ContentWrapper>
      </ScrollView>
      <FloatingBottomBar
        title={data.title}
        likeCount={totalUpvoteCount ?? 0}
        isLiked={isUpvoted}
        ctaButtonUrl={ctaButtonUrl}
        onLikePress={toggleUpvote}
        isVisible={isBottomBarVisible}
      />
    </LogParamsProvider>
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
function EditModeContent({ bbucleRoadId }: { bbucleRoadId: string }) {
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
        <BbucleRoadContent data={data} bbucleRoadId={bbucleRoadId} />
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

  // Initialize auth (for upvote and image upload)
  useEffect(() => {
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
            // userId 없으면 가져오기
            if (!window.localStorage.getItem('bbucleRoadUserId')) {
              try {
                const userInfoResponse = await api.getUserInfoGet();
                window.localStorage.setItem('bbucleRoadUserId', userInfoResponse.data.user.id);
              } catch {
                // ignore
              }
            }
            setIsInitializing(false);
            return;
          }
        }

        // Create new anonymous login
        const response = await api.createAnonymousUserPost();
        const { authTokens, userId } = response.data;

        window.localStorage.setItem('anonymousAccessToken', authTokens.accessToken);
        window.localStorage.setItem(
          'anonymousTokenExpiry',
          String(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000),
        );
        window.localStorage.setItem('bbucleRoadUserId', userId);

        apiConfig.accessToken = authTokens.accessToken;
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
        <ResponsiveProvider>
          <EditModeProvider
            isEditMode={true}
            initialData={editModeInitialData}
          >
            <EditModeContent bbucleRoadId={bbucleRoadId} />
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

  if (isInitializing) {
    return (
      <LoadingContainer>
        <LoadingText>로딩 중...</LoadingText>
      </LoadingContainer>
    );
  }

  return (
    <Container>
      <ResponsiveProvider>
        <BbucleRoadContent data={configData} bbucleRoadId={bbucleRoadId} />
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

const ContentWrapper = styled(View)<{ hasFloatingHeader?: boolean; isDesktop?: boolean }>`
  width: 100%;
  padding-top: ${({ hasFloatingHeader, isDesktop }) => (hasFloatingHeader ? (isDesktop ? '80px' : '50px') : '0')};
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

const BottomBarSpacer = styled(View)<{ isDesktop: boolean }>`
  height: ${({ isDesktop }) => isDesktop ? '108px' : '90px'};
`;
