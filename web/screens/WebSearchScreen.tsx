import React, {useState, useEffect, useCallback} from 'react';
import styled from 'styled-components';
import {RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

import {PlaceListItem} from '@/generated-sources/openapi';
import SearchListView from '@/screens/SearchScreen/components/SearchListView';
import PlaceDetailV2Screen from '@/screens/PlaceDetailV2Screen';
import {api, apiConfig} from '../config/api';
import {WebStackParamList} from '../navigation/WebNavigation';
import NaverMapView from '../components/NaverMapView';
import SearchModal from '../components/SearchModal';
import {useGlobalKeyboard} from '../hooks/useGlobalKeyboard';
import LogoSvg from '../assets/icons/logo.svg';

type WebSearchScreenProps = {
  route: RouteProp<WebStackParamList, keyof WebStackParamList>;
  navigation: StackNavigationProp<WebStackParamList>;
};

export default function WebSearchScreen({
  route,
  navigation,
}: WebSearchScreenProps) {
  const [selectedPlace] = useState<PlaceListItem | null>(null);
  const [searchResults, setSearchResults] = useState<PlaceListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const [lastSearchedQuery, setLastSearchedQuery] = useState<string>('');
  const [mapCenter, setMapCenter] = useState<{lat: number; lng: number} | null>(
    null,
  );
  const [showResearchButton, setShowResearchButton] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | undefined>();

  // 지도 핀 클릭 핸들러
  const handlePlaceClick = useCallback((placeId: string) => {
    // 브라우저 히스토리에 추가
    const newUrl = `/search/${encodeURIComponent(searchQuery)}/place/${placeId}`;
    window.history.pushState(null, '', newUrl);

    // 컴포넌트 상태 업데이트
    setPlaceId(placeId);
    setSelectedPlaceId(placeId);
  }, [searchQuery]);

  // 홈으로 네비게이션 핸들러
  const handleLogoClick = useCallback(() => {
    navigation.push('Home');
  }, [navigation]);

  // Extract placeId from URL path (since it's not in route params with exact: false)
  const [placeId, setPlaceId] = useState<string | undefined>();

  // Primary shortcuts: Cmd/Ctrl + K (like Slack, VS Code, GitHub)
  useGlobalKeyboard(
    'k',
    {meta: true},
    () => {
      setIsSearchModalOpen(true);
    },
    {priority: 'high'},
  );

  useGlobalKeyboard(
    'k',
    {ctrl: true},
    () => {
      setIsSearchModalOpen(true);
    },
    {priority: 'high'},
  );

  // Initialize anonymous login and current location
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
        const {authTokens} = response.data;

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

    const getCurrentLocation = () => {
      if (typeof window !== 'undefined' && window.navigator && window.navigator.geolocation) {
        window.navigator.geolocation.getCurrentPosition(
          (position: any) => {
            setCurrentLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          },
          (error: any) => {
            console.log('현재 위치를 가져올 수 없습니다:', error);
            // 기본 위치 (강남역) 사용
            setCurrentLocation({
              lat: 37.4979,
              lng: 127.0276,
            });
          },
          {enableHighAccuracy: true},
        );
      } else {
        // 기본 위치 (강남역) 사용
        setCurrentLocation({
          lat: 37.4979,
          lng: 127.0276,
        });
      }
    };

    initializeAuth();
    getCurrentLocation();
  }, []);

  // Real API search functionality
  const handleSearch = useCallback(
    async (query: string, searchLocation?: {lat: number; lng: number}) => {
      if (!query.trim() || !accessToken) return;

      const locationToUse = searchLocation ||
        currentLocation || {
          lat: 37.4979,
          lng: 127.0276,
        };

      console.log('🔍 Search started:', query.trim());
      setIsLoading(true);
      setShowResearchButton(false); // 새 검색 시작 시 재검색 버튼 숨기기
      try {
        const response = await api.searchPlacesByNaturalLanguagePost({
          text: query.trim(),
          circleRegion: {
            currentLocation: locationToUse,
            distanceMetersLimit: 2000, // 지도 기반 검색을 위해 범위 확대
          },
        });

        console.log('✅ Search response:', response.data);
        console.log(
          '📊 Search results count:',
          response.data.items?.length || 0,
        );
        setSearchResults(response.data.items || []);
        setLastSearchedQuery(query.trim()); // Update last searched query to prevent duplicate calls
        setIsLoading(false);
        console.log('🔄 Loading state set to false, results updated');
      } catch (error) {
        setIsLoading(false);
        console.error('Search failed:', error);
        // 에러 발생 시 빈 결과 표시
        setSearchResults([]);
      }
    },
    [accessToken, currentLocation],
  );

  // Update searchQuery and placeId when route params change
  useEffect(() => {
    if (route.name === 'Search') {
      const params = route.params as WebStackParamList['Search'];
      setSearchQuery(params?.query || '');
      setPlaceId(undefined);
    } else if (route.name === 'PlaceDetail') {
      const params = route.params as WebStackParamList['PlaceDetail'];
      setSearchQuery(params.query);
      setPlaceId(params.placeId);
    }
  }, [route.name, route.params]);

  // 지도 뷰포트 변경 시 재검색 버튼 표시
  const handleMapViewportChange = useCallback(
    (center: {lat: number; lng: number}) => {
      if (searchQuery && accessToken) {
        console.log('🗺️ Map viewport changed:', center);
        setMapCenter(center);
        setShowResearchButton(true);
      }
    },
    [searchQuery, accessToken],
  );

  // 이 지역 재검색 버튼 클릭 핸들러
  const handleResearchArea = useCallback(() => {
    if (mapCenter && searchQuery) {
      console.log('🔍 Re-searching in new area:', mapCenter);
      handleSearch(searchQuery, mapCenter);
      setShowResearchButton(false);
    }
  }, [mapCenter, searchQuery, handleSearch]);

  // URL의 query로 초기 검색 실행 (Search 화면이거나 PlaceDetail 화면일 때)
  useEffect(() => {
    if (
      searchQuery &&
      accessToken &&
      searchQuery !== lastSearchedQuery &&
      (route.name === 'Search' || route.name === 'PlaceDetail') // PlaceDetail 화면에서도 검색 실행
    ) {
      // 지도 센터가 있으면 그 위치를 기준으로, 없으면 현재 위치를 기준으로 검색
      const searchLocation = mapCenter || currentLocation || undefined;
      handleSearch(searchQuery, searchLocation);
    }
  }, [searchQuery, accessToken, handleSearch, route.name, mapCenter, currentLocation]);

  if (isInitializing) {
    return (
      <Container>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            fontSize: '18px',
            color: '#666666',
          }}>
          인증 중...
        </div>
      </Container>
    );
  }

  const isPlaceSelected = placeId || selectedPlace;

  return (
    <Container>
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        navigation={navigation}
        initialQuery={searchQuery}
      />

      {/* Left Panel - Search List (1/5 width) */}
      <LeftPanel>
        <LogoHeader onClick={handleLogoClick}>
          <LogoSvg />
        </LogoHeader>
        <SearchListView
          searchResults={searchResults}
          isLoading={isLoading}
          isVisible={true}
          searchQuery={searchQuery}
          onWebPlaceClick={handlePlaceClick}
        />
        {/* Debug info */}
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            right: '10px',
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '5px',
            fontSize: '12px',
            borderRadius: '3px',
          }}>
        </div>
      </LeftPanel>

      {/* Right Panel - Place Detail (1/5 width) - Only show when place is selected */}
      {isPlaceSelected && (
        <RightPanel>
          {placeId ? (
            <PlaceDetailV2Screen
              route={{
                key: 'PlaceDetailV2',
                name: 'PlaceDetailV2' as any,
                params: {
                  placeInfo: {
                    placeId: placeId,
                  },
                },
              }}
              navigation={navigation as any}
            />
          ) : selectedPlace ? (
            <PlaceDetailV2Screen
              route={{
                key: 'PlaceDetailV2',
                name: 'PlaceDetailV2' as any,
                params: {
                  placeInfo: {
                    place: selectedPlace.place,
                    building: selectedPlace.building,
                  },
                },
              }}
              navigation={navigation as any}
            />
          ) : null}
        </RightPanel>
      )}

      {/* Background - Map area - Dynamic width based on whether right panel is shown */}
      <MapBackground isRightPanelVisible={!!isPlaceSelected}>
        <NaverMapView
          searchResults={searchResults}
          onMapViewportChange={handleMapViewportChange}
          currentLocation={currentLocation}
          onPlaceClick={handlePlaceClick}
          selectedPlaceId={selectedPlaceId}
        />
        {showResearchButton && (
          <ResearchButton onClick={handleResearchArea}>
            이 지역 재검색
          </ResearchButton>
        )}

        {/* Bottom Search Bar */}
        <BottomSearchBar onClick={() => setIsSearchModalOpen(true)}>
          <SearchIcon>🔍</SearchIcon>
          <SearchPlaceholder>
            {searchQuery || '어떤 장소를 찾고 있나요?'}
          </SearchPlaceholder>
          <KeyboardHint>⌘K</KeyboardHint>
        </BottomSearchBar>
      </MapBackground>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  height: 100vh;
  width: 100vw;
  position: relative;
`;

const LeftPanel = styled.div`
  width: 20%;
  height: 100vh;
  background-color: #ffffff;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  z-index: 10;
`;

const LogoHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #f8f9fa;
  }

  & svg {
    width: 120px;
    height: auto;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
  }
`;

const RightPanel = styled.div`
  width: 20%;
  height: 100vh;
  background-color: #ffffff;
  border-left: 1px solid #e0e0e0;
  z-index: 10;
  overflow-y: auto;
  overflow-x: hidden;
`;

const MapBackground = styled.div<{isRightPanelVisible: boolean}>`
  position: absolute;
  left: ${props => (props.isRightPanelVisible ? '40%' : '20%')};
  right: 0;
  width: ${props => (props.isRightPanelVisible ? '60%' : '80%')};
  height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
`;

const BottomSearchBar = styled.div`
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 12px;
  background: white;
  padding: 12px 20px;
  border-radius: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 320px;
  max-width: 500px;
  z-index: 100;

  &:hover {
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.2);
    transform: translateX(-50%) translateY(-2px);
  }

  &:active {
    transform: translateX(-50%) translateY(0);
  }
`;

const SearchIcon = styled.span`
  font-size: 16px;
  color: #666;
`;

const SearchPlaceholder = styled.span`
  flex: 1;
  color: ${props =>
    props.children &&
    typeof props.children === 'string' &&
    props.children.includes('?')
      ? '#999'
      : '#333'};
  font-size: 15px;
  font-weight: ${props =>
    props.children &&
    typeof props.children === 'string' &&
    props.children.includes('?')
      ? '400'
      : '500'};
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const KeyboardHint = styled.span`
  background: #f0f0f0;
  color: #666;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
`;

const ResearchButton = styled.button`
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  background-color: #007aff;
  color: white;
  border: none;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
  z-index: 1000;
  transition: all 0.2s ease;

  &:hover {
    background-color: #0056cc;
    transform: translateX(-50%) translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 122, 255, 0.4);
  }

  &:active {
    transform: translateX(-50%) translateY(0);
    box-shadow: 0 2px 8px rgba(0, 122, 255, 0.3);
  }
`;
