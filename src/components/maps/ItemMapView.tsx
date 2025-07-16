import Geolocation from '@react-native-community/geolocation';
import {useAtomValue, useSetAtom} from 'jotai';
import React, {
  ForwardedRef,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {FlatList, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import styled from 'styled-components/native';

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
import {filterAtom, searchQueryAtom} from '@/screens/SearchScreen/atoms';
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
  const {text, location: searchLocation} = useAtomValue(searchQueryAtom);
  const {sortOption, scoreUnder, hasSlope, isRegistered} =
    useAtomValue(filterAtom);
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
    if (items.length > 0) {
      onItemSelect(items[0], false);
    }
  }, [text, searchLocation, sortOption, scoreUnder, hasSlope, isRegistered]);

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
      mapRef.current?.animateToRegion(region, 10, 1000);
    },
  }));

  function onItemSelect(
    item: T,
    shouldAnimateToPoint: boolean,
    shouldScrollToIndex: boolean = true,
  ) {
    selectedItemId !== item.id && setSelectedItemId(item.id);
    const index = items.findIndex(it => it.id === item.id);
    console.log('index', index, item.displayName, shouldAnimateToPoint);
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
        selectedItemId={selectedItemId}
        mapPadding={{
          top: 114, // 하드코딩된 값(헤더 높이), 차후 수정 필요
          right: 20,
          bottom: cardHeight,
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
        <MyLocationButton onPress={onMyLocationPress} activeOpacity={0.7}>
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

const MyLocationButton = styled.TouchableOpacity`
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

const RefreshButton = styled.TouchableOpacity`
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
