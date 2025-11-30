import {useQuery} from '@tanstack/react-query';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {FlatList} from 'react-native';
import styled from 'styled-components/native';
import {match} from 'ts-pattern';

import LeftArrowIcon from '@/assets/icon/ic_arrow_left.svg';
import ListIcon from '@/assets/icon/ic_list.svg';
import MapIcon from '@/assets/icon/ic_map.svg';
import {ScreenLayout} from '@/components/ScreenLayout';
import {SccTouchableOpacity} from '@/components/SccTouchableOpacity';
import ItemMapView, {ItemMapViewHandle} from '@/components/maps/ItemMapView';
import {
  MarkerIcon,
  MarkerItem,
  MarkerLevel,
} from '@/components/maps/MarkerItem';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {PlaceListItem} from '@/generated-sources/openapi';
import useAppComponents from '@/hooks/useAppComponents';
import {ScreenProps} from '@/navigation/Navigation.screens';
import SearchItemCard from '@/screens/SearchScreen/components/SearchItemCard';
import {getPlaceAccessibilityScore} from '@/utils/accessibilityCheck';
import {useDetailScreenVersion} from '@/utils/accessibilityFlags';

export interface PlaceGroupMapScreenParams {
  placeGroupId: string;
}

type PlaceMarkerItem = MarkerItem & PlaceListItem;

const PlaceGroupItemCard = ({
  item,
  onPress,
}: {
  item: PlaceMarkerItem;
  onPress?: () => void;
}) => <SearchItemCard item={item} onPress={onPress} />;

type ViewMode = 'map' | 'list';

const PlaceGroupMapScreen = ({
  route,
  navigation,
}: ScreenProps<'PlaceGroupMap'>) => {
  const {placeGroupId} = route.params;
  const {api} = useAppComponents();
  const mapRef = useRef<ItemMapViewHandle<PlaceMarkerItem>>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const detailVersion = useDetailScreenVersion();

  const {data} = useQuery({
    queryKey: ['PlaceGroup', placeGroupId],
    queryFn: async () => {
      const result = await api.getPlaceGroup({placeGroupId});
      return result.data;
    },
  });

  const items = useMemo(() => {
    return data?.places?.map(addMarkerInfo) ?? [];
  }, [data?.places]);

  useEffect(() => {
    if (items.length > 0) {
      setTimeout(() => {
        mapRef.current?.fitToItems(items);
      }, 300); // 카드뷰 렌더링 이후에 줌을 시켜야 올바르게 fit이 된다.
    }
  }, [items]);

  const title = data?.placeGroup?.name ?? '장소 목록';

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

  return (
    <Layout isHeaderVisible={false} safeAreaEdges={['top']}>
      <Header>
        <SccTouchableOpacity
          elementName="place_group_map_back_button"
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}>
          <LeftArrowIcon width={24} height={24} color={color.black} />
        </SccTouchableOpacity>
        <Title>{title}</Title>
        <ViewModeToggle
          elementName="place_group_view_mode_toggle"
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
        {/* 지도는 항상 렌더링하고 뒤에 깔아둔다 */}
        <MapContainer>
          <ItemMapView
            ref={mapRef}
            items={items}
            ItemCard={PlaceGroupItemCard}
            isRefreshVisible={false}
            onRefresh={() => {}}
            onCameraIdle={() => {}}
          />
        </MapContainer>
        {/* 목록은 위에 overlay */}
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
    </Layout>
  );
};

function addMarkerInfo(item: PlaceListItem): PlaceMarkerItem {
  return {
    ...item,
    id: item.place.id,
    location: item.place.location,
    displayName: item.place.name,
    hasReview:
      item.accessibilityInfo?.reviewCount !== undefined
        ? item.accessibilityInfo.reviewCount > 0
        : false,
    markerIcon: {
      icon: match<string | undefined, MarkerIcon>(item.place.category)
        .with('RESTAURANT', () => 'rest')
        .with('CAFE', () => 'cafe')
        .with('CONVENIENCE_STORE', () => 'conv')
        .with('PHARMACY', () => 'phar')
        .with('HOSPITAL', () => 'hos')
        .otherwise(() => 'default'),
      level: match<number | undefined | 'processing', MarkerLevel>(
        getPlaceAccessibilityScore({
          score: item.accessibilityInfo?.accessibilityScore,
          hasPlaceAccessibility: item.hasPlaceAccessibility,
          hasBuildingAccessibility: item.hasBuildingAccessibility,
        }),
      )
        .with('processing', () => 'progress')
        .with(undefined, () => 'none')
        .when(
          score => score <= 0,
          () => '0',
        )
        .when(
          score => score <= 1,
          () => '1',
        )
        .when(
          score => score <= 2,
          () => '2',
        )
        .when(
          score => score <= 3,
          () => '3',
        )
        .when(
          score => score <= 4,
          () => '4',
        )
        .otherwise(() => '5'),
    },
  };
}

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

export default PlaceGroupMapScreen;
