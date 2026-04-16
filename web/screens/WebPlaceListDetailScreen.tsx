import React, {useState, useEffect, useCallback, useMemo} from 'react';
import styled from 'styled-components';
import {useWindowDimensions} from 'react-native';
import {RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

import {PlaceListItem, PlaceListDto} from '@/generated-sources/openapi';
import SearchItemCard from '@/screens/SearchScreen/components/SearchItemCard';
import PlaceDetailV2Screen from '@/screens/PlaceDetailV2Screen';
import {useCheckAuth} from '@/utils/checkAuth';
import NaverMapView from '../components/NaverMapView';
import {api, apiConfig} from '../config/api';
import {WebStackParamList} from '../navigation/WebNavigation';
import LogoSvg from '../assets/icons/logo.svg';

const DESKTOP_BREAKPOINT = 900;

type Props = {
  route: RouteProp<WebStackParamList, keyof WebStackParamList>;
  navigation: StackNavigationProp<WebStackParamList>;
};

export default function WebPlaceListDetailScreen({route, navigation}: Props) {
  const {width} = useWindowDimensions();
  const isDesktop = width >= DESKTOP_BREAKPOINT;

  const [placeListId, setPlaceListId] = useState<string>('');
  const [placeId, setPlaceId] = useState<string | undefined>();
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | undefined>();
  const [placeList, setPlaceList] = useState<PlaceListDto | null>(null);
  const [places, setPlaces] = useState<PlaceListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('list');
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // --- Auth (same pattern as WebSearchScreen) ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Prefer scc token (logged-in user)
        const sccToken = window.localStorage.getItem('sccAccessToken');
        if (sccToken) {
          setAccessToken(sccToken);
          apiConfig.accessToken = sccToken;
          setIsInitializing(false);
          return;
        }

        // Fall back to anonymous token
        const storedToken = window.localStorage.getItem('anonymousAccessToken');
        const tokenExpiry = window.localStorage.getItem('anonymousTokenExpiry');

        if (
          storedToken &&
          tokenExpiry &&
          Date.now() < parseInt(tokenExpiry, 10)
        ) {
          setAccessToken(storedToken);
          apiConfig.accessToken = storedToken;
          setIsInitializing(false);
          return;
        }

        // Create anonymous login
        const response = await api.createAnonymousUserPost();
        const {authTokens} = response.data;
        window.localStorage.setItem(
          'anonymousAccessToken',
          authTokens.accessToken,
        );
        window.localStorage.setItem(
          'anonymousTokenExpiry',
          String(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000),
        );
        setAccessToken(authTokens.accessToken);
        apiConfig.accessToken = authTokens.accessToken;
      } catch (error) {
        console.error('Auth failed:', error);
        setIsError(true);
      } finally {
        setIsInitializing(false);
      }
    };

    const getCurrentLocation = () => {
      if (window.navigator?.geolocation) {
        window.navigator.geolocation.getCurrentPosition(
          (position: GeolocationPosition) => {
            setCurrentLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          },
          () => {
            setCurrentLocation({lat: 37.4979, lng: 127.0276});
          },
          {enableHighAccuracy: true},
        );
      } else {
        setCurrentLocation({lat: 37.4979, lng: 127.0276});
      }
    };

    initAuth();
    getCurrentLocation();
  }, []);

  // --- Browser back/forward sync ---
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const placeMatch = path.match(/\/place-list\/[^/]+\/place\/([^/]+)/);
      if (placeMatch) {
        const decoded = decodeURIComponent(placeMatch[1]);
        setPlaceId(decoded);
        setSelectedPlaceId(decoded);
      } else {
        setPlaceId(undefined);
        setSelectedPlaceId(undefined);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // --- Route params ---
  useEffect(() => {
    if (route.name === 'PlaceListDetail') {
      const params = route.params as WebStackParamList['PlaceListDetail'];
      setPlaceListId(params.placeListId);
      setPlaceId(undefined);
      setSelectedPlaceId(undefined);
    } else if (route.name === 'PlaceListDetailPlace') {
      const params = route.params as WebStackParamList['PlaceListDetailPlace'];
      setPlaceListId(params.placeListId);
      setPlaceId(params.placeId);
      setSelectedPlaceId(params.placeId);
    }
  }, [route.name, route.params]);

  // --- Fetch place list data ---
  const currentLocationRef = React.useRef(currentLocation);
  currentLocationRef.current = currentLocation;

  useEffect(() => {
    if (!placeListId || !accessToken) return;
    let cancelled = false;

    const fetchData = async () => {
      setIsLoading(true);
      setIsError(false);
      try {
        const result = await api.getPlaceList({
          placeListId,
          currentLocation: currentLocationRef.current ?? undefined,
        });
        if (!cancelled) {
          setPlaceList(result.data.placeList ?? null);
          setPlaces(result.data.places ?? []);
        }
      } catch (error) {
        console.error('Failed to fetch place list:', error);
        if (!cancelled) setIsError(true);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, [placeListId, accessToken]);

  // --- Handlers ---
  const handlePlaceClick = useCallback(
    (clickedPlaceId: string) => {
      const newUrl = `/place-list/${encodeURIComponent(placeListId)}/place/${encodeURIComponent(clickedPlaceId)}`;
      window.history.pushState(null, '', newUrl);
      setPlaceId(clickedPlaceId);
      setSelectedPlaceId(clickedPlaceId);
    },
    [placeListId],
  );

  const handleClosePdp = useCallback(() => {
    const newUrl = `/place-list/${encodeURIComponent(placeListId)}`;
    window.history.pushState(null, '', newUrl);
    setPlaceId(undefined);
    setSelectedPlaceId(undefined);
  }, [placeListId]);

  // Navigation override: PDP's goBack should close the PDP overlay, not pop the stack
  const pdpNavigation = useMemo(
    () => ({...navigation, goBack: handleClosePdp}),
    [navigation, handleClosePdp],
  );

  const handleLogoClick = useCallback(() => {
    navigation.push('Home');
  }, [navigation]);

  const checkAuth = useCheckAuth();

  const handleSave = useCallback(() => {
    checkAuth(() => {
      // This callback is only called if auth passes (app only).
      // On web, checkAuth always shows app install prompt instead.
    });
  }, [checkAuth]);

  const handleShare = useCallback(() => {
    const url = `${window.location.origin}/place-list/${encodeURIComponent(placeListId)}`;
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(url)
        .then(() => alert('링크가 복사되었습니다.'))
        .catch(() => alert('링크 복사에 실패했습니다.'));
    } else {
      // Fallback for browsers without Clipboard API
      const textarea = document.createElement('textarea');
      textarea.value = url;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        alert('링크가 복사되었습니다.');
      } catch {
        alert('링크 복사에 실패했습니다.');
      }
      document.body.removeChild(textarea);
    }
  }, [placeListId]);

  const toggleViewMode = useCallback(() => {
    setViewMode(prev => (prev === 'map' ? 'list' : 'map'));
  }, []);

  // --- Loading ---
  if (isInitializing) {
    return (
      <FullCenter>
        <LoadingText>인증 중...</LoadingText>
      </FullCenter>
    );
  }

  if (isLoading) {
    return (
      <FullCenter>
        <LoadingText>로딩 중...</LoadingText>
      </FullCenter>
    );
  }

  if (isError) {
    return (
      <FullCenter>
        <ErrorMessage>리스트를 불러올 수 없습니다.</ErrorMessage>
      </FullCenter>
    );
  }

  const isPlaceSelected = !!placeId;
  const title = placeList?.name ?? '장소 리스트';
  const description = placeList?.description;
  const isSaved = placeList?.isSaved ?? false;

  // ===================== DESKTOP LAYOUT =====================
  if (isDesktop) {
    return (
      <Container>
        {/* Left Panel - Place List */}
        <LeftPanel>
          <LogoHeader onClick={handleLogoClick}>
            <LogoSvg />
          </LogoHeader>
          <ListHeader>
            <ListTitle>{title}</ListTitle>
            {description && (
              <ListDescription>{description}</ListDescription>
            )}
            <ActionRow>
              <SaveButton onClick={handleSave} $isSaved={isSaved}>
                {isSaved ? '✓ 리스트 저장됨' : '☆ 리스트 저장하기'}
              </SaveButton>
              <ShareButton onClick={handleShare} title="링크 복사">
                📤
              </ShareButton>
            </ActionRow>
          </ListHeader>
          <PlaceListContainer>
            {places.map((item, index) => (
              <PlaceItemWrapper key={item.place.id} $isFirst={index === 0}>
                <SearchItemCard
                  item={item}
                  isHeightFlex
                  onPress={() => handlePlaceClick(item.place.id)}
                />
              </PlaceItemWrapper>
            ))}
          </PlaceListContainer>
        </LeftPanel>

        {/* Right Panel - PDP */}
        {isPlaceSelected && (
          <RightPanel>
            <PdpInner>
              <PlaceDetailV2Screen
                route={{
                  key: 'PlaceDetailV2',
                  name: 'PlaceDetailV2' as any,
                  params: {placeInfo: {placeId: placeId!}},
                }}
                navigation={pdpNavigation as any}
              />
            </PdpInner>
          </RightPanel>
        )}

        {/* Map Background - always full width behind panels */}
        <MapBackground>
          <NaverMapView
            searchResults={places}
            currentLocation={currentLocation}
            onPlaceClick={handlePlaceClick}
            selectedPlaceId={selectedPlaceId}
          />
        </MapBackground>
      </Container>
    );
  }

  // ===================== MOBILE LAYOUT =====================
  // Place detail overlay (full-width)
  if (isPlaceSelected) {
    return (
      <MobileContainer>
        <MobileHeader>
          <MobileBackButton onClick={handleClosePdp}>← 목록</MobileBackButton>
          <MobileHeaderTitle>{title}</MobileHeaderTitle>
          <div style={{width: 60}} />
        </MobileHeader>
        <MobilePdpContainer>
          <PlaceDetailV2Screen
            route={{
              key: 'PlaceDetailV2',
              name: 'PlaceDetailV2' as any,
              params: {placeInfo: {placeId: placeId!}},
            }}
            navigation={pdpNavigation as any}
          />
        </MobilePdpContainer>
      </MobileContainer>
    );
  }

  return (
    <MobileContainer>
      <MobileHeader>
        <MobileHeaderTitle>{title}</MobileHeaderTitle>
        <MobileToggleButton onClick={toggleViewMode}>
          {viewMode === 'list' ? '🗺️ 지도' : '📋 목록'}
        </MobileToggleButton>
      </MobileHeader>

      {description && (
        <MobileDescription>{description}</MobileDescription>
      )}

      <MobileActionRow>
        <MobileSaveButton onClick={handleSave} $isSaved={isSaved}>
          {isSaved ? '✓ 저장됨' : '☆ 저장'}
        </MobileSaveButton>
        <MobileShareButton onClick={handleShare}>📤</MobileShareButton>
      </MobileActionRow>

      {viewMode === 'list' ? (
        <MobilePlaceList>
          {places.map((item, index) => (
            <PlaceItemWrapper key={item.place.id} $isFirst={index === 0}>
              <SearchItemCard
                item={item}
                isHeightFlex
                onPress={() => handlePlaceClick(item.place.id)}
              />
            </PlaceItemWrapper>
          ))}
        </MobilePlaceList>
      ) : (
        <MobileMapContainer>
          <NaverMapView
            searchResults={places}
            currentLocation={currentLocation}
            onPlaceClick={handlePlaceClick}
            selectedPlaceId={selectedPlaceId}
          />
        </MobileMapContainer>
      )}
    </MobileContainer>
  );
}

// ===================== STYLED COMPONENTS =====================

// --- Shared ---
const FullCenter = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
`;

const LoadingText = styled.div`
  font-size: 18px;
  color: #666666;
`;

const ErrorMessage = styled.div`
  font-size: 16px;
  color: #999999;
`;

const PlaceItemWrapper = styled.div<{$isFirst: boolean}>`
  padding: 20px;
  border-top: ${({$isFirst}) => ($isFirst ? 'none' : '1px solid #eff0f2')};
`;

// --- Desktop ---
const Container = styled.div`
  display: flex;
  height: 100vh;
  width: 100vw;
  position: relative;
`;

const LeftPanel = styled.div`
  width: 20%;
  max-width: 380px;
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
  flex-shrink: 0;

  &:hover {
    background-color: #f8f9fa;
  }

  & svg {
    width: 120px;
    height: auto;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
  }
`;

const ListHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
`;

const ListTitle = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #16181c;
  margin-bottom: 4px;
`;

const ListDescription = styled.div`
  font-size: 14px;
  color: #6b6e78;
  line-height: 22px;
  margin-bottom: 12px;
`;

const ActionRow = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
`;

const SaveButton = styled.button<{$isSaved: boolean}>`
  flex: 1;
  height: 40px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: ${({$isSaved}) => ($isSaved ? '#D6EBFF' : '#0C76F7')};
  color: ${({$isSaved}) => ($isSaved ? '#16181c' : '#ffffff')};

  &:hover {
    opacity: 0.9;
  }
`;

const ShareButton = styled.button`
  width: 40px;
  height: 40px;
  border: 1px solid #e3e4e8;
  border-radius: 8px;
  background-color: #ffffff;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #f5f5f5;
  }
`;

const PlaceListContainer = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const RightPanel = styled.div`
  width: 20%;
  max-width: 380px;
  height: 100vh;
  background-color: #ffffff;
  border-left: 1px solid #e0e0e0;
  z-index: 10;
  overflow: hidden;
  position: relative;
`;

const PdpInner = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const MapBackground = styled.div`
  position: absolute;
  left: 0;
  width: 100%;
  height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
`;

// --- Mobile ---
const MobileContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  background-color: #ffffff;
`;

const MobileHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
`;

const MobileHeaderTitle = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #16181c;
  flex: 1;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const MobileBackButton = styled.button`
  background: none;
  border: none;
  font-size: 14px;
  color: #0c76f7;
  cursor: pointer;
  padding: 4px 8px;
  min-width: 60px;
  text-align: left;
`;

const MobileToggleButton = styled.button`
  background: none;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 13px;
  cursor: pointer;
  color: #333;
  min-width: 60px;

  &:hover {
    background-color: #f5f5f5;
  }
`;

const MobileDescription = styled.div`
  padding: 12px 16px 0;
  font-size: 14px;
  color: #6b6e78;
  line-height: 20px;
`;

const MobileActionRow = styled.div`
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
`;

const MobileSaveButton = styled.button<{$isSaved: boolean}>`
  flex: 1;
  height: 36px;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  background-color: ${({$isSaved}) => ($isSaved ? '#D6EBFF' : '#0C76F7')};
  color: ${({$isSaved}) => ($isSaved ? '#16181c' : '#ffffff')};
`;

const MobileShareButton = styled.button`
  width: 36px;
  height: 36px;
  border: 1px solid #e3e4e8;
  border-radius: 8px;
  background-color: #ffffff;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MobilePlaceList = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const MobileMapContainer = styled.div`
  flex: 1;
`;

const MobilePdpContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  overscroll-behavior: none;
`;
