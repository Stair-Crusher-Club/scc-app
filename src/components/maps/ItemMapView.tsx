import Geolocation from '@react-native-community/geolocation';
import {BottomTabBarHeightContext} from '@react-navigation/bottom-tabs';
import {useIsFocused} from '@react-navigation/native';
import {useSetAtom} from 'jotai';
import React, {
  ForwardedRef,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {Dimensions, FlatList, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import styled from 'styled-components/native';

import {SccTouchableOpacity} from '@/components/SccTouchableOpacity';

import {ToiletMarkerColor} from '@/assets/markers';
import MyLocationIcon from '@/assets/icon/ic_my_location.svg';
import ToiletLayerIcon from '@/assets/icon/ic_toilet.svg';
import RedoIcon from '@/assets/icon/ic_redo.svg';
import {currentLocationAtom} from '@/atoms/Location';
import ItemMap from '@/components/maps/ItemMap';
import ItemMapList from '@/components/maps/ItemMapList';
import {CARD_LIST_HEIGHT} from '@/components/maps/constants';
import {MapViewHandle} from '@/components/maps/MapView';
import {MarkerItem} from '@/components/maps/MarkerItem.ts';
import {getRegionFromItems, Region} from '@/components/maps/Types.tsx';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {useIsForeground} from '@/hooks/useIsForeground';
import {usePlaceDetailScreenName} from '@/hooks/useFeatureFlags';
import useNavigation from '@/navigation/useNavigation.ts';
import {useLogger} from '@/logging/useLogger';
import GeolocationUtils from '@/utils/GeolocationUtils.ts';
import HeatTelemetry from '@/utils/HeatTelemetry';

/**
 * 플로팅 버튼과 **바로 아래에 있는 것** 사이 간격.
 * 아래가 카드 캐러셀이면 카드 위 12px, 다른 버튼이면 버튼 사이 12px.
 */
const FLOATING_BUTTON_GAP = 12;

/** 아래에 아무것도 없을 때(빈 지도) 버튼과 navbar/safe area 사이 간격. */
const FLOATING_BUTTON_GAP_ON_EMPTY = 20;

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
  /**
   * 화면 고유의 하단 UI(자체 플로팅 버튼 등) 높이. 플로팅 버튼 컬럼 전체를 이만큼 더 띄운다.
   * 버튼과 바로 아래 요소 사이의 12px 간격은 [FLOATING_BUTTON_GAP] 이 별도로 보장한다.
   */
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
  /**
   * 카드 리스트 바로 위에 렌더할 오버레이. 포커스된 카드에 종속된 UI(대체 검색 CTA 등)를 위해
   * 포커스 상태와 스크롤 상태를 넘겨준다. 넘기지 않으면 아무것도 렌더하지 않는다.
   */
  AboveCardsSlot?: React.FC<{focusedItem: T | null; isScrolling: boolean}>;
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
    AboveCardsSlot,
  }: ItemMapViewProps<T>,
  ref: ForwardedRef<ItemMapViewHandle<T>>,
) => {
  const mapRef = useRef<MapViewHandle>(null);
  const cardsRef = useRef<FlatList<T>>(null);
  const setCurrentLocation = useSetAtom(currentLocationAtom);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isCardListScrolling, setIsCardListScrolling] = useState(false);
  // overlay 진입 전 선택된 장소 id를 보존하여, overlay dismiss 시 복원
  const savedSelectedItemIdRef = useRef<string | null>(null);
  const navigation = useNavigation();
  const logger = useLogger();
  const pdpScreen = usePlaceDetailScreenName();
  const insets = useSafeAreaInsets();
  // 현재 노출된 하단 탭바 높이만큼 mapPadding / floating UI 컨테이너 paddingBottom 에
  // reserve 해 현위치 버튼·네이버 로고·카메라 fit 영역이 탭바에 가리지 않게 한다.
  // 탭바가 숨김(`tabBarStyle: display:none`) 이거나 Bottom Tab 컨텍스트 밖이면
  // context 값이 0이 되어 추가 padding 없음.
  const tabBarHeight = useContext(BottomTabBarHeightContext) ?? 0;
  const isFocused = useIsFocused();
  const isForeground = useIsForeground();
  const isActive = isFocused && isForeground;
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
    return () => clearTimeout(timer);
  }, []);

  // 화면이 포커스 + 앱이 foreground 인 동안에만 GPS watch.
  // - useIsFocused: navigation stack 의 다른 화면으로 push 되면 GPS 해제
  // - useIsForeground: 앱이 백그라운드로 가면 GPS 해제 (isFocused 만으로는 안 됨)
  // 2시간 활동 발열 원인 1순위: enableHighAccuracy GPS가 navigation stack에
  // 깔린 모든 map 화면에서 동시에 돌고 있던 누수.
  useEffect(() => {
    if (!isActive) return;
    HeatTelemetry.start('gps_watch');
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
        interval: 5000,
      },
    );
    return () => {
      Geolocation.clearWatch(watchId);
      HeatTelemetry.stop('gps_watch');
    };
  }, [isActive, setCurrentLocation]);

  useEffect(() => {
    HeatTelemetry.start('map_native_view');
    return () => HeatTelemetry.stop('map_native_view');
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
  // 플로팅 버튼 아래에 카드(캐러셀/overlay)가 깔리는지. 없으면 버튼 아래가 곧 navbar 다.
  const hasContentBelowButtons = showOverlayCard || items.length > 0;

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
          bottom: insets.bottom + CARD_LIST_HEIGHT + 30 + tabBarHeight,
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
          // tabBarHeight 는 이미 insets.bottom 을 포함한다(getTabBarHeight = 높이 + inset).
          // 둘을 더하면 하단 인셋이 두 번 잡혀 빈 지도에서 버튼이 과하게 떠오른다.
          //
          // 카드가 없으면 버튼 아래가 곧 navbar/safe area 다. 버튼 자신의 margin-bottom(12)
          // 위에 차액을 더해 20px 이 되게 한다.
          paddingBottom:
            (tabBarHeight || insets.bottom) +
            (myLocationBottomOffset ?? 0) +
            (hasContentBelowButtons
              ? 0
              : FLOATING_BUTTON_GAP_ON_EMPTY - FLOATING_BUTTON_GAP),
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
          activeOpacity={0.7}>
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
            <CardBand pointerEvents="box-none">
              {/* 카드 밴드 상단에 겹쳐 띄운다(absolute). 레이아웃 흐름에서 빠지므로 플로팅
                  버튼은 CTA 슬롯이 아니라 **카드** 기준 12px 에 놓인다 — CTA 유무로 버튼
                  위치가 흔들리지 않는다. */}
              {AboveCardsSlot && (
                <AboveCardsSlotContainer pointerEvents="box-none">
                  <AboveCardsSlot
                    focusedItem={
                      items.find(it => it.id === selectedItemId) ??
                      items[0] ??
                      null
                    }
                    isScrolling={isCardListScrolling}
                  />
                </AboveCardsSlotContainer>
              )}
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
                onScrollStateChange={setIsCardListScrolling}
                ItemCard={ItemCard}
              />
            </CardBand>
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
  margin-bottom: ${FLOATING_BUTTON_GAP}px;
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
  background-color: ${({active}) => (active ? ToiletMarkerColor : color.white)};
  margin-right: 20px;
  margin-bottom: ${FLOATING_BUTTON_GAP}px;
  border-radius: 100px;
  padding: 8px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

/** 카드 캐러셀 밴드. 이 안에서 CTA 슬롯을 absolute 로 겹쳐 놓는다. */
const CardBand = styled.View`
  align-self: stretch;
`;

/** 카드 밴드 상단에 겹쳐 놓는 슬롯. 흐름에서 빠져 플로팅 버튼 위치에 영향을 주지 않는다. */
const AboveCardsSlotContainer = styled.View`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 100%;
`;

const OverlayCardContainer = styled.View`
  align-self: stretch;
  height: ${CARD_LIST_HEIGHT}px;
  align-items: center;
  /* 카드 하단을 밴드 바닥에 고정 → 썸네일 없는 짧은 카드는 위쪽이 열려
     지도 아래가 비지 않는다 (top 고정이면 아래가 텅 빔). */
  justify-content: flex-end;
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
