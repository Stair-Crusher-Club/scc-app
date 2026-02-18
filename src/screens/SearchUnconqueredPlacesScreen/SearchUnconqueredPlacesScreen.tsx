import {useQuery} from '@tanstack/react-query';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {FlatList} from 'react-native';
import styled from 'styled-components/native';

import LeftArrowIcon from '@/assets/icon/ic_arrow_left.svg';
import ListIcon from '@/assets/icon/ic_list.svg';
import MapIcon from '@/assets/icon/ic_map.svg';
import {ScreenLayout} from '@/components/ScreenLayout';
import {SccTouchableOpacity} from '@/components/SccTouchableOpacity';
import ItemMapView, {ItemMapViewHandle} from '@/components/maps/ItemMapView';
import {MarkerItem, toPlaceMarkerItem} from '@/components/maps/MarkerItem';
import {Region} from '@/components/maps/Types';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {
  PlaceListItem,
  RectangleSearchRegionDto,
} from '@/generated-sources/openapi';
import useAppComponents from '@/hooks/useAppComponents';
import {ScreenProps} from '@/navigation/Navigation.screens';
import {usePlaceDetailScreenName} from '@/hooks/useFeatureFlags';
import SearchItemCard from '@/screens/SearchScreen/components/SearchItemCard';
import GeolocationUtils from '@/utils/GeolocationUtils';

export interface SearchUnconqueredPlacesScreenParams {}

type PlaceMarkerItem = MarkerItem & PlaceListItem;

const ConquestSearchItemCard: React.FC<{
  item: PlaceMarkerItem;
  onPress?: () => void;
}> = ({item, onPress}) => (
  <SearchItemCard item={item} onPress={onPress} isConquestMode />
);

type ViewMode = 'map' | 'list';

const SearchUnconqueredPlacesScreen = ({
  navigation,
}: ScreenProps<'SearchUnconqueredPlaces'>) => {
  const {api} = useAppComponents();
  const mapRef = useRef<ItemMapViewHandle<PlaceMarkerItem>>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [cameraRegion, setCameraRegion] = useState<Region | null>(null);
  const [shouldShowRefresh, setShouldShowRefresh] = useState(false);
  const [queryTrigger, setQueryTrigger] = useState(0);
  // 재검색 시 사용할 카메라 영역 (재검색 버튼 눌렀을 때의 영역을 저장)
  const [searchRegion, setSearchRegion] = useState<Region | null>(null);
  const pdpScreen = usePlaceDetailScreenName();

  const {data, isLoading} = useQuery({
    queryKey: ['SearchUnconqueredPlaces', queryTrigger],
    queryFn: async () => {
      // searchRegion이 있으면 rectangleRegion으로 검색, 없으면 현위치 기준 circleRegion으로 검색
      if (searchRegion) {
        const rectangleRegion: RectangleSearchRegionDto = {
          leftTopLocation: {
            lat: searchRegion.northEast.latitude,
            lng: searchRegion.southWest.longitude,
          },
          rightBottomLocation: {
            lat: searchRegion.southWest.latitude,
            lng: searchRegion.northEast.longitude,
          },
        };
        const result = await api.searchUnconqueredPlacesNearbyPost({
          rectangleRegion,
          limit: 50,
        });
        return result.data.items;
      }

      // 초기 검색: 현위치 기준 250m
      const position = await GeolocationUtils.getCurrentPosition();
      const result = await api.searchUnconqueredPlacesNearbyPost({
        circleRegion: {
          currentLocation: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
          distanceMetersLimit: 250,
        },
        limit: 50,
      });
      return result.data.items;
    },
  });

  const items = useMemo(() => {
    return data?.map(toPlaceMarkerItem) ?? [];
  }, [data]);

  useEffect(() => {
    if (items.length > 0 && !isLoading) {
      setTimeout(() => {
        mapRef.current?.fitToItems(items);
      }, 300);
    }
  }, [items, isLoading]);

  const handleItemPress = useCallback(
    (item: PlaceMarkerItem) => {
      navigation.navigate(pdpScreen, {
        placeInfo: {placeId: item.place.id},
      });
    },
    [pdpScreen, navigation],
  );

  const toggleViewMode = useCallback(() => {
    setViewMode(prev => (prev === 'map' ? 'list' : 'map'));
  }, []);

  const handleCameraIdle = useCallback((region: Region) => {
    setCameraRegion(region);
    setShouldShowRefresh(true);
  }, []);

  const handleRefresh = useCallback(() => {
    // 현재 카메라 영역을 searchRegion으로 설정하고 재검색
    setSearchRegion(cameraRegion);
    setQueryTrigger(prev => prev + 1);
    setShouldShowRefresh(false);
  }, [cameraRegion]);

  return (
    <Layout isHeaderVisible={false} safeAreaEdges={['top']}>
      <Header>
        <SccTouchableOpacity
          elementName="search_unconquered_places_back_button"
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}>
          <LeftArrowIcon width={24} height={24} color={color.black} />
        </SccTouchableOpacity>
        <Title>정복 안 된 장소</Title>
        <ViewModeToggle
          elementName="search_unconquered_places_view_mode_toggle"
          activeOpacity={0.8}
          onPress={toggleViewMode}>
          {viewMode === 'map' ? (
            <>
              <ListIcon width={20} height={20} />
              <ViewModeText>목록</ViewModeText>
            </>
          ) : (
            <>
              <MapIcon width={20} height={20} />
              <ViewModeText>지도</ViewModeText>
            </>
          )}
        </ViewModeToggle>
      </Header>
      <ContentContainer>
        <MapContainer>
          <ItemMapView
            ref={mapRef}
            items={items}
            ItemCard={ConquestSearchItemCard}
            isRefreshVisible={shouldShowRefresh}
            onRefresh={handleRefresh}
            onCameraIdle={handleCameraIdle}
          />
        </MapContainer>
        {viewMode === 'list' && (
          <ListContainer>
            <FlatList
              data={items}
              keyExtractor={item => item.place.id}
              contentContainerStyle={{paddingBottom: 100}}
              renderItem={({item}) => (
                <ListItemWrapper>
                  <SearchItemCard
                    item={item}
                    isHeightFlex
                    isConquestMode
                    onPress={() => handleItemPress(item)}
                  />
                </ListItemWrapper>
              )}
            />
          </ListContainer>
        )}
      </ContentContainer>
    </Layout>
  );
};

const Layout = styled(ScreenLayout)`
  background-color: ${color.white};
`;

const ContentContainer = styled.View`
  flex: 1;
`;

const MapContainer = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

const ListContainer = styled.View`
  flex: 1;
  background-color: ${color.white};
`;

const Header = styled.View`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding-vertical: 10px;
  padding-horizontal: 20px;
  gap: 12px;
  height: 64px;
`;

const ViewModeToggle = styled(SccTouchableOpacity)`
  margin-left: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 38px;
`;

const ViewModeText = styled.Text`
  font-size: 12px;
  font-family: ${font.pretendardRegular};
  color: ${color.black};
`;

const ListItemWrapper = styled.View`
  padding: 20px;
  border-top-width: 1px;
  border-top-color: ${color.gray20};
`;

const Title = styled.Text`
  font-size: 18px;
  font-family: ${font.pretendardBold};
  color: ${color.black};
`;

export default SearchUnconqueredPlacesScreen;
