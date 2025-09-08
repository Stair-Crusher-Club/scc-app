import Geolocation from '@react-native-community/geolocation';
import {useSetAtom} from 'jotai';
import React, {
  ForwardedRef,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {FlatList, Platform, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import styled from 'styled-components/native';

import {SccTouchableOpacity} from '@/components/SccTouchableOpacity';

import MyLocationIcon from '@/assets/icon/ic_my_location.svg';
import RedoIcon from '@/assets/icon/ic_redo.svg';
import {currentLocationAtom} from '@/atoms/Location';
import ItemMap from '@/components/maps/ItemMap';
import ItemMapList from '@/components/maps/ItemMapList';
import {MapViewHandle} from '@/components/maps/MapView.tsx';
import {MarkerItem} from '@/components/maps/MarkerItem.ts';
import {getRegionFromItems, Region} from '@/components/maps/Types.tsx';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import useNavigation from '@/navigation/useNavigation.ts';
import GeolocationUtils from '@/utils/GeolocationUtils.ts';

export type ItemMapViewHandle<T extends MarkerItem> = {
  moveToItem: (item: T) => void;
  fitToItems: (items: MarkerItem[]) => void;
};

type ItemMapViewProps<T extends MarkerItem> = {
  items: T[];
  onRefresh: () => void;
  ItemCard: React.FC<{item: T}>;
  isRefreshVisible: boolean;
  onCameraIdle: (region: Region) => void;
};

const FRefInputComp = <T extends MarkerItem>(
  {
    items,
    onRefresh,
    ItemCard,
    isRefreshVisible,
    onCameraIdle,
  }: ItemMapViewProps<T>,
  ref: ForwardedRef<ItemMapViewHandle<T>>,
) => {
  const mapRef = useRef<MapViewHandle>(null);
  const cardsRef = useRef<FlatList<T>>(null);
  const setCurrentLocation = useSetAtom(currentLocationAtom);
  const [cardHeight, setCardHeight] = useState(0);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const navigation = useNavigation();
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
      Geolocation.clearWatch(watchId);
    };
  }, []);

  useImperativeHandle(ref, () => ({
    moveToItem: _item => {
      onItemSelect(_item, true);
    },
    fitToItems: _items => {
      const region = getRegionFromItems(_items);
      mapRef.current?.animateToRegion(region, 30, 200);
    },
  }));

  useEffect(() => {
    if (items.length > 0) {
      onItemSelect(items[0], false);
    } else {
      setSelectedItemId(null);
    }
  }, [items]); // FIXME: 이거 이렇게 하니까 마커가 다 그려진 다음에 커진다 ㅜ 그냥 검색 시작할 때 무조건 0번으로 해야 할 듯?

  function onItemSelect(
    item: T,
    shouldAnimateToPoint: boolean,
    shouldScrollToIndex: boolean = true,
  ) {
    selectedItemId !== item.id && setSelectedItemId(item.id);
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

  return (
    <Container>
      <ItemMap
        onMarkerPress={item => {
          onItemSelect(item, false);
        }}
        mapRef={mapRef}
        items={items}
        onCameraIdle={onCameraIdle}
        /*
         * 간단하게 하려면 selectedItemId를 그대로 넘기면 되지만,
         * 이렇게 하니 일단 모든 마커가 일반 사이즈로 그려진 다음 onItemSelect()로 인해 items[0]의 마커가 커지는 버벅임이 발생한다.
         * 더 자연스러운 애니메이션을 위해, 데이터 로딩 ~ selectedItemId 설정이 완료되지 않은 사이에 items[0]으로 fallback을 해준다.
         */
        selectedItemId={selectedItemId ?? (items && items[0]?.id)}
        mapPadding={{
          top: 114, // 하드코딩된 값(헤더 높이), 차후 수정 필요
          right: 20,
          bottom:
            Platform.OS === 'ios'
              ? cardHeight
              : insets.bottom + (items.length === 0 ? 0 : cardHeight),
          left: 20,
        }}
      />
      <UpperShadow
        style={{
          shadowColor: color.black,
          shadowOffset: {width: 0, height: 4},
          shadowOpacity: 0.15,
          shadowRadius: 5,
          elevation: 5,
        }}
      />
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
          justifyContent: 'flex-end',
          paddingBottom: insets.bottom,
        }}
        pointerEvents="box-none">
        <MyLocationButton
          elementName="map_my_location_button"
          onPress={onMyLocationPress}
          activeOpacity={0.7}>
          <MyLocationIcon width={24} height={24} />
        </MyLocationButton>
        {items.length > 0 && (
          <ItemMapList<T>
            ref={cardsRef}
            searchResults={items}
            onLayout={event => {
              event.nativeEvent.layout.height !== cardHeight &&
                setCardHeight(event.nativeEvent.layout.height);
            }}
            onCardPress={item =>
              navigation.navigate('PlaceDetail', {
                placeInfo: {placeId: item.id},
              })
            }
            onFocusedItemChange={item =>
              item && onItemSelect(item, false, false)
            }
            ItemCard={ItemCard}
          />
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
  overflow: hidden;
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
  height: 20px;
  background-color: white;
  top: -20px;
  position: absolute;
`;

const RefreshText = styled.Text`
  font-size: 14px;
  font-family: ${() => font.pretendardMedium};
  color: #24262b;
`;
