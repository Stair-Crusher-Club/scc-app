import React, {useState, useEffect} from 'react';
import styled from 'styled-components';

import {PlaceListItem} from '@/generated-sources/openapi';
import SearchListView from '@/screens/SearchScreen/components/SearchListView';
import PlaceDetailScreen from '@/screens/PlaceDetailScreen/PlaceDetailScreen';
import {api, apiConfig} from '../config/api';

export default function WebSearchScreen() {
  const [selectedPlace, setSelectedPlace] = useState<PlaceListItem | null>(
    null,
  );
  const [searchResults, setSearchResults] = useState<PlaceListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Initialize anonymous login
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

    initializeAuth();
  }, []);

  // Real API search functionality
  const handleSearch = async (query: string) => {
    if (!query.trim() || !accessToken) return;

    console.log('🔍 Search started:', query.trim());
    setIsLoading(true);
    try {
      const response = await api.searchPlacesPost({
        searchText: query.trim(),
        // 강남역 좌표를 기본값으로 사용
        currentLocation: {
          lat: 37.4979,
          lng: 127.0276,
        },
        distanceMetersLimit: 1000,
      });

      console.log('✅ Search response:', response.data);
      console.log('📊 Search results count:', response.data.items?.length || 0);
      setSearchResults(response.data.items || []);
      setIsLoading(false);
      console.log('🔄 Loading state set to false, results updated');
    } catch (error) {
      setIsLoading(false);
      console.error('Search failed:', error);
      // 에러 발생 시 빈 결과 표시
      setSearchResults([]);
    }
  };

  const handlePlaceSelect = (place: PlaceListItem) => {
    setSelectedPlace(place);
  };

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

  return (
    <Container>
      {/* Left Panel - Search List (1/5 width) */}
      <LeftPanel>
        <SearchHeader>
          <SearchInput
            placeholder="장소를 검색해보세요"
            onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'Enter') {
                handleSearch((e.target as HTMLInputElement).value);
              }
            }}
          />
        </SearchHeader>
        <SearchListView
          searchResults={searchResults}
          isLoading={isLoading}
          isVisible={true}
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

      {/* Right Panel - Place Detail (1/5 width) */}
      <RightPanel>
        {selectedPlace ? (
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
        ) : (
          <PlaceholderContent>
            <PlaceholderText>
              장소를 선택하면 상세 정보가 표시됩니다
            </PlaceholderText>
          </PlaceholderContent>
        )}
      </RightPanel>

      {/* Background - Map area (3/5 width) */}
      <MapBackground>
        <MapPlaceholder>지도 영역 (추후 구현)</MapPlaceholder>
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
`;

const MapBackground = styled.div`
  position: absolute;
  left: 20%;
  width: 60%;
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

const SearchInput = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  outline: none;

  &:focus {
    border-color: #007aff;
  }
`;

const MapPlaceholder = styled.div`
  color: #666666;
  font-size: 18px;
  text-align: center;
`;

const PlaceholderContent = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const PlaceholderText = styled.div`
  color: #666666;
  font-size: 14px;
  text-align: center;
  line-height: 1.5;
`;
