import React, {useState, useEffect, useCallback} from 'react';
import styled from 'styled-components';
import {RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

import {PlaceListItem} from '@/generated-sources/openapi';
import SearchListView from '@/screens/SearchScreen/components/SearchListView';
import PlaceDetailScreen from '@/screens/PlaceDetailScreen/PlaceDetailScreen';
import {api, apiConfig} from '../config/api';
import {WebStackParamList} from '../navigation/WebNavigation';
import NaverMapView from '../components/NaverMapView';

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

  // Extract placeId from URL path (since it's not in route params with exact: false)
  const [placeId, setPlaceId] = useState<string | undefined>();

  // Initialize anonymous login and current location
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const response = await api.createAnonymousUserPost();
        const {authTokens} = response.data;
        setAccessToken(authTokens.accessToken);

        // Update API configuration with access token
        apiConfig.accessToken = authTokens.accessToken;

        console.log('Anonymous login successful');
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

  // Execute search and update URL
  const executeSearch = useCallback(() => {
    if (searchQuery.trim()) {
      handleSearch(searchQuery);
      navigation.navigate('Search', {query: searchQuery});
    }
  }, [searchQuery, handleSearch, navigation]);

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

  // URL의 query로 초기 검색 실행 (URL 변경 시에만)
  useEffect(() => {
    if (
      searchQuery &&
      accessToken &&
      searchQuery !== lastSearchedQuery &&
      route.params
    ) {
      handleSearch(searchQuery);
    }
  }, [route.params, accessToken, handleSearch]);

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
      {/* Left Panel - Search List (1/5 width) */}
      <LeftPanel>
        <SearchHeader>
          <SearchInputContainer>
            <SearchInput
              placeholder="장소를 검색해보세요"
              value={searchQuery}
              onChange={e => {
                setSearchQuery((e.target as any).value);
              }}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === 'Enter') {
                  executeSearch();
                }
              }}
            />
            <SearchButton
              onClick={executeSearch}
              disabled={!searchQuery.trim()}>
              🔍
            </SearchButton>
          </SearchInputContainer>
        </SearchHeader>
        <SearchListView
          searchResults={searchResults}
          isLoading={isLoading}
          isVisible={true}
          searchQuery={searchQuery}
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
          Results: {searchResults.length} | Loading: {isLoading ? 'Yes' : 'No'}
        </div>
      </LeftPanel>

      {/* Right Panel - Place Detail (1/5 width) - Only show when place is selected */}
      {isPlaceSelected && (
        <RightPanel>
          {placeId ? (
            <PlaceDetailScreen
              route={{
                key: 'PlaceDetail',
                name: 'PlaceDetail',
                params: {
                  placeInfo: {
                    placeId: placeId,
                  },
                },
              }}
              navigation={navigation as any}
            />
          ) : selectedPlace ? (
            <PlaceDetailScreen
              route={{
                key: 'PlaceDetail',
                name: 'PlaceDetail',
                params: {
                  placeInfo: {
                    place: selectedPlace.place,
                    building: selectedPlace.building,
                  },
                },
              }}
              navigation={{} as any}
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
        />
        {showResearchButton && (
          <ResearchButton onClick={handleResearchArea}>
            이 지역 재검색
          </ResearchButton>
        )}
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

const SearchHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SearchInputContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  outline: none;

  &:focus {
    border-color: #007aff;
  }
`;

const SearchButton = styled.button`
  padding: 12px 16px;
  background-color: #007aff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: #0056cc;
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
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
