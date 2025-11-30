import {useQuery} from '@tanstack/react-query';
import React, {useEffect, useMemo, useRef} from 'react';
import styled from 'styled-components/native';
import {match} from 'ts-pattern';

import LeftArrowIcon from '@/assets/icon/ic_arrow_left.svg';
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
}) => <SearchItemCard item={item} onPress={onPress} isReadOnly />;

const PlaceGroupMapScreen = ({
  route,
  navigation,
}: ScreenProps<'PlaceGroupMap'>) => {
  const {placeGroupId} = route.params;
  const {api} = useAppComponents();
  const mapRef = useRef<ItemMapViewHandle<PlaceMarkerItem>>(null);

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
      }, 150); // 카드뷰 렌더링 이후에 줌을 시켜야 올바르게 fit이 된다.
    }
  }, [items]);

  const title = data?.placeGroup?.name ?? '장소 목록';

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
      </Header>
      <ItemMapView
        ref={mapRef}
        items={items}
        ItemCard={PlaceGroupItemCard}
        isRefreshVisible={false}
        onRefresh={() => {}}
        onCameraIdle={() => {}}
      />
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

const Header = styled.View`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding-vertical: 10px;
  padding-horizontal: 20px;
  gap: 12px;
  height: 64px;
`;

const Title = styled.Text`
  font-size: 18px;
  font-family: ${font.pretendardBold};
  color: ${color.black};
`;

export default PlaceGroupMapScreen;
