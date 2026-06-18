import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { View, ScrollView, Text, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';

import type { WebStackParamList } from '../../navigation/WebNavigation';
import { api, apiConfig } from '../../config/api';
import { color } from '@/constant/color';
import { getStorageValue } from '@/atoms/atomForLocal';
import { LogParamsProvider } from '@/logging/LogParamsProvider';
import { SccContentTypeDto, UpvoteTargetTypeDto } from '@/generated-sources/openapi';
import { useUpvoteToggle } from '@/hooks/useUpvoteToggle';
import { useSaveContent } from '@/hooks/useSaveContent';
import useAppComponents from '@/hooks/useAppComponents';
import { useAppInjectedAuth } from '../../hooks/useAppInjectedAuth';

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
  const navigation = useNavigation<BbucleRoadScreenNavigationProp>();

  const handleMenuPress = useCallback(() => {
    navigation.navigate('BbucleRoadList');
  }, [navigation]);
  const { api: appApi } = useAppComponents();

  // 스크롤 방향 감지 - BottomBar visibility
  const [isBottomBarVisible, setIsBottomBarVisible] = useState(true);
  const lastScrollY = useRef(0);
  const isTouching = useRef(false);
  const isScrollingUpRef = useRef(true);
  const isAtBottomRef = useRef(false);

  const handleScroll = useCallback((event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent ?? {};
    const currentScrollY = contentOffset?.y ?? 0;

    // 최하단 도달 여부 체크 (약간의 여유값 포함)
    const isAtBottom = contentSize && layoutMeasurement &&
      (currentScrollY + layoutMeasurement.height >= contentSize.height - 10);
    isAtBottomRef.current = isAtBottom;

    if (currentScrollY !== lastScrollY.current) {
      isScrollingUpRef.current = currentScrollY < lastScrollY.current;
      lastScrollY.current = currentScrollY;

      // 터치 중이 아닐 때만 상태 업데이트 (관성 스크롤)
      if (!isTouching.current) {
        // 최하단이면 항상 표시, 아니면 스크롤 방향에 따라
        setIsBottomBarVisible(isAtBottom || isScrollingUpRef.current);
      }
    }
  }, []);

  const handleTouchStart = useCallback(() => {
    isTouching.current = true;
  }, []);

  const handleTouchEnd = useCallback(() => {
    isTouching.current = false;
    // 최하단이면 항상 표시, 아니면 스크롤 방향에 따라
    setIsBottomBarVisible(isAtBottomRef.current || isScrollingUpRef.current);
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

  // 앱(scc-app) 웹뷰 안에서 띄워졌다면 access token 이 주입되어 있다.
  // 이 경우 CTA 자리에 저장 버튼을 노출한다.
  const appInjectedAuth = useAppInjectedAuth();
  const isInApp = appInjectedAuth !== null;

  // 저장 상태 조회 — 앱 컨텍스트에서만 의미가 있으므로 token 이 있을 때만 fetch.
  const currentPageUrl = useMemo(
    () => (typeof window !== 'undefined' ? window.location.href : ''),
    [],
  );
  const { data: sccContentDetails, isLoading: isSavedStatusLoading } = useQuery({
    queryKey: ['SccContentDetails', currentPageUrl],
    queryFn: async () => (await appApi.getSccContentDetails({ url: currentPageUrl })).data,
    enabled: isInApp && currentPageUrl.length > 0,
  });
  const isSaved = sccContentDetails?.isSaved ?? false;
  const savedSccContentId = sccContentDetails?.sccContentId ?? null;

  const saveContent = useSaveContent();
  const handleToggleSave = useCallback(() => {
    if (!isInApp) return;
    saveContent({
      url: currentPageUrl,
      contentType: SccContentTypeDto.WebPage,
      title: data.title ?? null,
      imageUrls: extractDomImageUrls(),
      description: null,
      currentIsSaved: isSaved,
      currentSccContentId: savedSccContentId,
    });
  }, [
    isInApp,
    saveContent,
    currentPageUrl,
    data.title,
    isSaved,
    savedSccContentId,
  ]);

  return (
    <LogParamsProvider params={{ isDesktop }}>
      {hasFloatingHeader && (
        <FloatingHeader
          title={data.floatingHeaderTitle!}
          onMenuPress={handleMenuPress}
        />
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
            mobileWheelchairUserCommentLabel={data.mobileWheelchairUserCommentLabel}
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
        isInApp={isInApp}
        isSaved={isSaved}
        isSaveDisabled={isSavedStatusLoading}
        onSavePress={handleToggleSave}
      />
    </LogParamsProvider>
  );
}

/**
 * 페이지 본문에서 저장에 쓸 이미지 URL 목록을 추출한다.
 * scc-app WebViewScreen 의 OG 추출 스크립트와 같은 규칙:
 * - og:image 를 가장 앞에
 * - 본문 <img src> 를 절대 URL 화하여 추가
 * - data: URI, .svg, 100px 미만 이미지 제외
 * - 등장 순서 유지 + 중복 제거
 */
function extractDomImageUrls(): string[] {
  if (typeof document === 'undefined') return [];
  const MIN_IMAGE_SIDE = 100;
  const seen = new Set<string>();
  const result: string[] = [];

  const ogImage = document
    .querySelector('meta[property="og:image"]')
    ?.getAttribute('content');
  if (ogImage) {
    try {
      const abs = new URL(ogImage, document.baseURI).toString();
      if (!seen.has(abs)) {
        seen.add(abs);
        result.push(abs);
      }
    } catch (_e) {
      if (!seen.has(ogImage)) {
        seen.add(ogImage);
        result.push(ogImage);
      }
    }
  }

  document.querySelectorAll('img[src]').forEach((img) => {
    const src = img.getAttribute('src');
    if (!src || src.startsWith('data:')) return;
    if (src.toLowerCase().includes('.svg')) return;
    const imgEl = img as HTMLImageElement;
    const w = imgEl.naturalWidth || 0;
    const h = imgEl.naturalHeight || 0;
    if (w > 0 && h > 0 && (w < MIN_IMAGE_SIDE || h < MIN_IMAGE_SIDE)) return;
    let abs = src;
    try {
      abs = new URL(src, document.baseURI).toString();
    } catch (_e) {
      // 절대 URL 변환 실패 시 원본 src 사용
    }
    if (seen.has(abs)) return;
    seen.add(abs);
    result.push(abs);
  });

  return result;
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
  const appInjectedAuth = useAppInjectedAuth();

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

  // 앱이 늦게 토큰을 주입한 경우(atom 로딩 지연 등)에도 즉시 반영한다.
  // 익명 유저로 이미 init 되었더라도 app token + baseUrl 로 덮어쓰면 이후 API 호출은
  // 앱 환경(sandbox/production)의 서버 + 실제 유저로 인증된다.
  useEffect(() => {
    if (appInjectedAuth) {
      apiConfig.accessToken = appInjectedAuth.token;
      if (appInjectedAuth.baseUrl) {
        apiConfig.basePath = appInjectedAuth.baseUrl;
      }
    }
  }, [appInjectedAuth]);

  // Initialize auth (for upvote and image upload)
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // 0순위: scc-app 웹뷰가 주입한 access token + baseUrl. 익명 유저 생성보다 우선한다.
        if (appInjectedAuth) {
          apiConfig.accessToken = appInjectedAuth.token;
          if (appInjectedAuth.baseUrl) {
            apiConfig.basePath = appInjectedAuth.baseUrl;
          }
          // bbucleRoadUserId 가 비어있으면 채워둔다 (좋아요 표시 등에 쓰임)
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

        // 1순위: 메인 앱에 로그인돼 있으면(scc-token) 그 토큰을 그대로 사용한다.
        // 익명 유저를 새로 만들면, 만료된 익명 토큰으로 401 이 날 때 globalAxios 공유
        // 인터셉터가 로그인 유저의 세션까지 풀어버린다. 이미 토큰이 있으면 재사용한다.
        const appToken = getStorageValue<string>('scc-token');
        if (appToken) {
          apiConfig.accessToken = appToken;
          if (!window.localStorage.getItem('bbucleRoadUserId')) {
            try {
              const userInfoResponse = await api.getUserInfoGet();
              window.localStorage.setItem(
                'bbucleRoadUserId',
                userInfoResponse.data.user.id,
              );
            } catch {
              // ignore
            }
          }
          setIsInitializing(false);
          return;
        }

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
      <Container data-testid="bbucle-road-detail">
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
    <Container data-testid="bbucle-road-detail">
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
  padding-top: ${({ hasFloatingHeader, isDesktop }) => (hasFloatingHeader ? (isDesktop ? '60px' : '50px') : '0')};
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
  height: ${({ isDesktop }) => isDesktop ? '97px' : '110px'};
`;
