import Geolocation from '@react-native-community/geolocation';
import {useSetAtom} from 'jotai';
import React, {
  ForwardedRef,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {Dimensions, FlatList, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import styled from 'styled-components/native';

import {SccTouchableOpacity} from '@/components/SccTouchableOpacity';

import MyLocationIcon from '@/assets/icon/ic_my_location.svg';
import ToiletLayerIcon from '@/assets/icon/ic_toilet.svg';
import RedoIcon from '@/assets/icon/ic_redo.svg';
import {currentLocationAtom} from '@/atoms/Location';
import ItemMap from '@/components/maps/ItemMap';
import ItemMapList from '@/components/maps/ItemMapList';
import {MapViewHandle} from '@/components/maps/MapView.tsx';
import {MarkerItem} from '@/components/maps/MarkerItem.ts';
import {getRegionFromItems, Region} from '@/components/maps/Types.tsx';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {usePlaceDetailScreenName} from '@/hooks/useFeatureFlags';
import useNavigation from '@/navigation/useNavigation.ts';
import {useLogger} from '@/logging/useLogger';
import GeolocationUtils from '@/utils/GeolocationUtils.ts';

// ItemMapList 카드 컨테이너 고정 높이 (242 + 28)
const CARD_LIST_HEIGHT = 270;

export type ItemMapViewHandle<T extends MarkerItem> = {
  moveToItem: (item: T) => void;
  fitToItems: (items: MarkerItem[], padding?: number) => void;
};

type ItemMapViewProps<T extends MarkerItem> = {
  items: T[];
  onRefresh: () => void;
  ItemCard: React.FC<{item: T}>;
  isRefreshVisible: boolean;
  onCameraIdle: (region: Region) => void;
  myLocationBottomOffset?: number;
  // 화장실 레이어 overlay
  overlayMarkers?: MarkerItem[];
  overlayFocusedItem?: MarkerItem | null;
  onOverlayMarkerPress?: (item: MarkerItem) => void;
  onOverlayDismiss?: () => void;
  OverlayItemCard?: React.FC<{item: MarkerItem}>;
  // 화장실 토글 버튼
  toiletLayerActive?: boolean;
  onToiletLayerToggle?: () => void;
  showToiletLayerToggle?: boolean;
};

const SINGLE_CARD_WIDTH = Math.round(Dimensions.get('window').width * 0.9) - 10;

const FRefInputComp = <T extends MarkerItem>(
  {
    items,
    onRefresh,
    ItemCard,
    isRefreshVisible,
    onCameraIdle,
    myLocationBottomOffset,
    overlayMarkers,
    overlayFocusedItem,
    onOverlayMarkerPress,
    onOverlayDismiss,
    OverlayItemCard,
    toiletLayerActive,
    onToiletLayerToggle,
    showToiletLayerToggle,
  }: ItemMapViewProps<T>,
  ref: ForwardedRef<ItemMapViewHandle<T>>,
) => {
  const mapRef = useRef<MapViewHandle>(null);
  const cardsRef = useRef<FlatList<T>>(null);
  const setCurrentLocation = useSetAtom(currentLocationAtom);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  // overlay 진입 전 선택된 장소 id를 보존하여, overlay dismiss 시 복원
  const savedSelectedItemIdRef = useRef<string | null>(null);
  const navigation = useNavigation();
  const logger = useLogger();
  const pdpScreen = usePlaceDetailScreenName();
  const insets = useSafeAreaInsets();
  const onMyLocationPress = () => {
    mapRef.current?.setPositionMode('direction');
    GeolocationUtils.getCurrentPosition().then(
      position => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setCurrentLocation(location);
      },
      error => {
        console.log(error);
      },
    );
  };

  useEffect(() => {
    // 초기 현위치 마커 표시 (지도 초기화 대기)
    const timer = setTimeout(() => {
      mapRef.current?.setPositionMode('direction');
    }, 100);

    const watchId = Geolocation.watchPosition(
      position => {
        setCurrentLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      error => {
        console.log(error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 60000,
        interval: 3000,
      },
    );
    return () => {
      clearTimeout(timer);
      Geolocation.clearWatch(watchId);
    };
  }, []);

  useImperativeHandle(ref, () => ({
    moveToItem: _item => {
      onItemSelect(_item, true);
    },
    fitToItems: (_items, padding = 30) => {
      const region = getRegionFromItems(_items);
      mapRef.current?.animateToRegion(region, padding, 200);
    },
  }));

  useEffect(() => {
    if (items.find(it => it.id === selectedItemId)) {
      // 이미 선택된 아이템이 리스트에 존재하면, 현재 선택을 유지한다.
    } else if (items.length > 0) {
      onItemSelect(items[0], false);
    } else {
      setSelectedItemId(null);
    }
  }, [items]);

  // overlay dismiss 시 이전에 선택된 장소로 복원
  useEffect(() => {
    if (!overlayFocusedItem && savedSelectedItemIdRef.current) {
      const savedId = savedSelectedItemIdRef.current;
      savedSelectedItemIdRef.current = null;
      setSelectedItemId(savedId);
      const index = items.findIndex(it => it.id === savedId);
      if (index >= 0) {
        cardsRef.current?.scrollToIndex({index, animated: false});
      }
    }
  }, [overlayFocusedItem, items]);

  const handleOverlayMarkerPress = useCallback(
    (item: MarkerItem) => {
      savedSelectedItemIdRef.current = selectedItemId;
      onOverlayMarkerPress?.(item);
    },
    [onOverlayMarkerPress, selectedItemId],
  );

  function onItemSelect(
    item: T,
    shouldAnimateToPoint: boolean,
    shouldScrollToIndex: boolean = true,
  ) {
    // 장소 pin 클릭 시 overlay(화장실 카드)를 해제
    if (overlayFocusedItem) {
      onOverlayDismiss?.();
      savedSelectedItemIdRef.current = null;
    }
    selectedItemId !== item.id && setSelectedItemId(item.id);
    logger.logElementView('place_search_item_card', {
      search_view_mode: 'map',
      place_id: item.id,
      displaySectionName: 'search_item_card',
    });
    const index = items.findIndex(it => it.id === item.id);
    if (shouldScrollToIndex) {
      cardsRef.current?.scrollToIndex({
        index: index,
        animated: false,
      });
    }
    if (shouldAnimateToPoint) {
      mapRef.current?.animateCamera(
        {latitude: item.location!.lat, longitude: item.location!.lng},
        200,
      );
    }
  }

  const showOverlayCard = overlayFocusedItem != null && OverlayItemCard != null;

  return (
    <Container>
      <ItemMap
        onMarkerPress={item => {
          onItemSelect(item, false);
        }}
        mapRef={mapRef}
        items={items}
        overlayMarkers={overlayMarkers}
        overlaySelectedId={overlayFocusedItem?.id}
        onOverlayMarkerPress={handleOverlayMarkerPress}
        onCameraIdle={onCameraIdle}
        /*
         * 간단하게 하려면 selectedItemId를 그대로 넘기면 되지만,
         * 이렇게 하니 일단 모든 마커가 일반 사이즈로 그려진 다음 onItemSelect()로 인해 items[0]의 마커가 커지는 버벅임이 발생한다.
         * 더 자연스러운 애니메이션을 위해, 데이터 로딩 ~ selectedItemId 설정이 완료되지 않은 사이에 items[0]으로 fallback을 해준다.
         */
        selectedItemId={
          overlayFocusedItem
            ? null
            : (selectedItemId ?? (items && items[0]?.id))
        }
        mapPadding={{
          top: 100, // 이 지역 재검색 버튼 높이를 하드코딩으로 고려, 차후 수정 필요
          right: 30,
          bottom: insets.bottom + CARD_LIST_HEIGHT + 30,
          left: 30,
        }}
        logoPosition="leftBottom"
      />
      <UpperShadow />
      {isRefreshVisible && (
        <RefreshButton
          elementName="map_refresh_button"
          activeOpacity={0.8}
          onPress={() => {
            onRefresh();
          }}>
          <RedoIcon />
          <RefreshText>이 지역 재검색</RefreshText>
        </RefreshButton>
      )}
      <View
        style={{
          flexGrow: 1,
          alignSelf: 'stretch',
          justifyContent: 'flex-end',
          paddingBottom: insets.bottom,
        }}
        pointerEvents="box-none">
        {showToiletLayerToggle && (
          <ToiletLayerToggleButton
            elementName="map_toilet_layer_toggle"
            activeOpacity={0.7}
            onPress={onToiletLayerToggle}
            active={!!toiletLayerActive}>
            <ToiletLayerIcon
              width={24}
              height={24}
              color={toiletLayerActive ? color.white : '#24262B'}
            />
          </ToiletLayerToggleButton>
        )}
        <MyLocationButton
          elementName="map_my_location_button"
          onPress={onMyLocationPress}
          activeOpacity={0.7}
          style={
            myLocationBottomOffset != null
              ? {marginBottom: myLocationBottomOffset}
              : undefined
          }>
          <MyLocationIcon width={24} height={24} />
        </MyLocationButton>
        {showOverlayCard ? (
          <OverlayCardContainer>
            <OverlayCardWrapper>
              <OverlayItemCard item={overlayFocusedItem} />
            </OverlayCardWrapper>
          </OverlayCardContainer>
        ) : (
          items.length > 0 && (
            <ItemMapList<T>
              ref={cardsRef}
              searchResults={items}
              initialScrollIndex={
                selectedItemId
                  ? Math.max(
                      0,
                      items.findIndex(it => it.id === selectedItemId),
                    )
                  : undefined
              }
              onCardPress={item => {
                navigation.navigate(pdpScreen, {
                  placeInfo: {placeId: item.id},
                });
              }}
              onFocusedItemChange={item =>
                item && onItemSelect(item, false, false)
              }
              ItemCard={ItemCard}
            />
          )
        )}
      </View>
    </Container>
  );
};

const FRefOutputComp = forwardRef(FRefInputComp) as <T extends MarkerItem>(
  p: ItemMapViewProps<T> & {
    ref?: ForwardedRef<ItemMapViewHandle<T>>;
  },
) => React.ReactElement;

export default FRefOutputComp;

const Container = styled.View`
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-end;
`;

const MyLocationButton = styled(SccTouchableOpacity)`
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.25;
  shadow-radius: 3.84px;
  elevation: 3;
  width: 40px;
  height: 40px;
  align-self: flex-end;
  background-color: ${() => color.white};
  margin-right: 20px;
  margin-bottom: 16px;
  border-radius: 100px;
  padding: 8px;
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const RefreshButton = styled(SccTouchableOpacity)`
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.25;
  shadow-radius: 3.84px;
  elevation: 3;
  align-self: center;
  margin-top: 14px;
  background-color: ${() => color.white};
  border-radius: 100px;
  padding: 10px 15px 10px 15px;
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: ${() => color.white};
  gap: 5px;
`;

const UpperShadow = styled.View`
  width: 100%;
  height: 0px;
  position: absolute;
  top: 0;
  border-bottom-width: 1px;
  border-bottom-color: rgba(0, 0, 0, 0.08);
`;

const RefreshText = styled.Text`
  font-size: 14px;
  font-family: ${() => font.pretendardMedium};
  color: #24262b;
`;

const ToiletLayerToggleButton = styled(SccTouchableOpacity)<{active: boolean}>`
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.25;
  shadow-radius: 3.84px;
  elevation: 3;
  width: 40px;
  height: 40px;
  align-self: flex-end;
  background-color: ${({active}) => (active ? '#1976D2' : color.white)};
  margin-right: 20px;
  margin-bottom: 8px;
  border-radius: 100px;
  padding: 8px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

const OverlayCardContainer = styled.View`
  align-self: stretch;
  height: ${CARD_LIST_HEIGHT}px;
  align-items: center;
  justify-content: flex-start;
`;

const OverlayCardWrapper = styled.View`
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.25;
  shadow-radius: 3.84px;
  elevation: 3;
  background-color: white;
  overflow: visible;
  width: ${SINGLE_CARD_WIDTH}px;
  padding: 14px;
  border-radius: 12px;
`;
