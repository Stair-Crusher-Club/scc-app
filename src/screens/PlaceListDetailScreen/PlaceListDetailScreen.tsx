import {useQuery} from '@tanstack/react-query';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {FlatList} from 'react-native';
import styled from 'styled-components/native';

import BookmarkIcon from '@/assets/icon/ic_bookmark.svg';
import BookmarkOnIcon from '@/assets/icon/ic_bookmark_on.svg';
import LeftArrowIcon from '@/assets/icon/ic_arrow_left.svg';
import ListIcon from '@/assets/icon/ic_list.svg';
import MapIcon from '@/assets/icon/ic_map.svg';
import {ScreenLayout} from '@/components/ScreenLayout';
import {SccTouchableOpacity} from '@/components/SccTouchableOpacity';
import ItemMapView, {ItemMapViewHandle} from '@/components/maps/ItemMapView';
import {MarkerItem, toPlaceMarkerItem} from '@/components/maps/MarkerItem';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {PlaceListItem} from '@/generated-sources/openapi';
import useAppComponents from '@/hooks/useAppComponents';
import {useSavePlaceList} from '@/hooks/useSavePlaceList';
import {ScreenProps} from '@/navigation/Navigation.screens';
import SearchItemCard from '@/screens/SearchScreen/components/SearchItemCard';
import SearchLoading from '@/screens/SearchScreen/components/SearchLoading';
import {useCheckAuth} from '@/utils/checkAuth';
import {useDetailScreenVersion} from '@/utils/accessibilityFlags';

export interface PlaceListDetailScreenParams {
  placeListId: string;
}

type PlaceMarkerItem = MarkerItem & PlaceListItem;

type ViewMode = 'map' | 'list';

const PlaceListDetailScreen = ({
  route,
  navigation,
}: ScreenProps<'PlaceListDetail'>) => {
  const {placeListId} = route.params;
  const {api} = useAppComponents();
  const mapRef = useRef<ItemMapViewHandle<PlaceMarkerItem>>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const detailVersion = useDetailScreenVersion();
  const checkAuth = useCheckAuth();
  const toggleSave = useSavePlaceList();

  const {data, isLoading, isError} = useQuery({
    queryKey: ['PlaceListDetail', placeListId],
    queryFn: async () => {
      const result = await api.getPlaceList({placeListId});
      return result.data;
    },
  });

  const items = useMemo(() => {
    return data?.places?.map(toPlaceMarkerItem) ?? [];
  }, [data?.places]);

  useEffect(() => {
    if (items.length > 0) {
      setTimeout(() => {
        mapRef.current?.fitToItems(items);
      }, 300);
    }
  }, [items]);

  const title = data?.placeList?.name ?? '장소 리스트';
  const isSaved = data?.placeList?.isSaved ?? false;

  const handleItemPress = (item: PlaceMarkerItem) => {
    if (detailVersion === 'v2') {
      navigation.navigate('PlaceDetailV2', {
        placeInfo: {placeId: item.place.id},
      });
      return;
    }
    navigation.navigate('PlaceDetail', {
      placeInfo: {placeId: item.place.id},
    });
  };

  const toggleViewMode = () => {
    setViewMode(prev => (prev === 'map' ? 'list' : 'map'));
  };

  const handleToggleSave = () => {
    checkAuth(() => {
      toggleSave({isSaved, placeListId});
    });
  };

  return (
    <Layout isHeaderVisible={false} safeAreaEdges={['top']}>
      <Header>
        <SccTouchableOpacity
          elementName="place_list_detail_back_button"
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}>
          <LeftArrowIcon width={24} height={24} color={color.black} />
        </SccTouchableOpacity>
        <Title numberOfLines={1}>{title}</Title>
        <HeaderRight>
          <SccTouchableOpacity
            elementName="place_list_detail_save_button"
            activeOpacity={0.8}
            onPress={handleToggleSave}>
            {isSaved ? (
              <BookmarkOnIcon width={24} height={24} />
            ) : (
              <BookmarkIcon width={24} height={24} />
            )}
          </SccTouchableOpacity>
          <ViewModeToggle
            elementName="place_list_detail_view_mode_toggle"
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
        </HeaderRight>
      </Header>
      {data?.placeList?.description && (
        <DescriptionContainer>
          <DescriptionText>{data.placeList.description}</DescriptionText>
        </DescriptionContainer>
      )}
      {isLoading ? (
        <SearchLoading />
      ) : isError ? (
        <ErrorContainer>
          <ErrorText>리스트를 불러올 수 없습니다.</ErrorText>
        </ErrorContainer>
      ) : (
        <ContentContainer>
          {viewMode === 'map' && (
            <MapContainer>
              <ItemMapView
                ref={mapRef}
                items={items}
                ItemCard={SearchItemCard}
                isRefreshVisible={false}
                onRefresh={() => {}}
                onCameraIdle={() => {}}
              />
            </MapContainer>
          )}
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
                      onPress={() => handleItemPress(item)}
                    />
                  </ListItemWrapper>
                )}
              />
            </ListContainer>
          )}
        </ContentContainer>
      )}
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
  flex: 1;
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

const HeaderRight = styled.View`
  margin-left: auto;
  flex-direction: row;
  align-items: center;
  gap: 12px;
`;

const ViewModeToggle = styled(SccTouchableOpacity)`
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
  flex-shrink: 1;
`;

const DescriptionContainer = styled.View`
  padding-horizontal: 20px;
  padding-bottom: 12px;
  background-color: ${color.white};
`;

const DescriptionText = styled.Text`
  font-size: 14px;
  font-family: ${font.pretendardRegular};
  color: ${color.gray60};
`;

const ErrorContainer = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

const ErrorText = styled.Text`
  font-size: 14px;
  font-family: ${font.pretendardMedium};
  color: ${color.gray50};
`;

export default PlaceListDetailScreen;
