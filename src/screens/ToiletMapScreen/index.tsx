import {useQuery} from '@tanstack/react-query';
import React, {useRef, useState} from 'react';
import {TextInput, TouchableOpacity} from 'react-native';
import {useRecoilValue} from 'recoil';
import styled from 'styled-components/native';

import LeftArrowIcon from '@/assets/icon/ic_arrow_left.svg';
import ClearIcon from '@/assets/icon/ic_clear.svg';
import {currentLocationAtom} from '@/atoms/Location';
import {ScreenLayout} from '@/components/ScreenLayout';
import ItemMapView from '@/components/maps/ItemMapView';
import {getCenterAndRadius, Region} from '@/components/maps/Types.tsx';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import useAppComponents from '@/hooks/useAppComponents';
import {ScreenProps} from '@/navigation/Navigation.screens';
import ToiletCard from '@/screens/ToiletMapScreen/ToiletCard';
import {mapToToiletDetails} from '@/screens/ToiletMapScreen/data';

const ToiletMapScreen = ({navigation}: ScreenProps<'ToiletMap'>) => {
  const {api} = useAppComponents();
  const inputRef = useRef<TextInput>(null);
  const [draftText, setDraftText] = useState<string | undefined>(undefined);
  const [draftCameraRegion, setDraftCameraRegion] = useState<Region | null>(
    null,
  );
  const [text, setText] = useState('화장실');
  const currentLocation = useRecoilValue(currentLocationAtom);
  const [refreshedLocation, setRefreshedLocation] = useState<
    | {
        latitude: number;
        longitude: number;
      }
    | undefined
  >(undefined);
  const [searchRadius, setSearchRadius] = useState(2000);
  const searchLocation = refreshedLocation ?? currentLocation;
  const {data} = useQuery({
    queryKey: ['ToiletMap', {text, searchLocation, searchRadius}],
    queryFn: async () => {
      const result = await api.searchExternalAccessibilitiesPost({
        searchText: text ? text : undefined,
        currentLocation: {
          lng: searchLocation?.longitude!,
          lat: searchLocation?.latitude!,
        },
        distanceMetersLimit: searchRadius,
        categories: [],
      });
      return result.data;
    },
  });
  const items = data?.items?.map(mapToToiletDetails) ?? [];
  const updateQuery = () => {
    if (draftText) {
      setText(draftText);
    }
    if (draftCameraRegion) {
      const {center, radius} = getCenterAndRadius(draftCameraRegion);
      setRefreshedLocation(center);
      setSearchRadius(radius);
    }
  };

  return (
    <Layout isHeaderVisible={false} safeAreaEdges={['bottom', 'top']}>
      <Wrapper>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            navigation.goBack();
          }}>
          <LeftArrowIcon width={24} height={24} color={color.black} />
        </TouchableOpacity>
        <Container>
          <Input
            // @ts-ignore
            ref={inputRef}
            placeholder={'장소, 주소 검색'}
            placeholderTextColor={color.gray70}
            onChangeText={it => setDraftText(it)}
            value={draftText ?? text}
            returnKeyType="search"
            onSubmitEditing={() => {
              updateQuery();
            }}
          />
          <TouchableOpacity
            onPress={() => {
              setDraftText('');
              setText('');
            }}
            activeOpacity={0.6}>
            <ClearIcon width={24} height={24} />
          </TouchableOpacity>
        </Container>
      </Wrapper>
      <ItemMapView
        isRefreshVisible={true}
        items={items}
        onCameraIdle={region => setDraftCameraRegion(region)}
        onRefresh={() => {
          updateQuery();
        }}
        ItemCard={ToiletCard}
      />
    </Layout>
  );
};

const Layout = styled(ScreenLayout)`
  background-color: ${color.white};
`;
const Wrapper = styled.View({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: 10,
  paddingLeft: 20,
  paddingRight: 12,
  gap: 12,
  height: 64,
});

const Input = styled.TextInput({
  flex: 1,
  color: color.black,
  fontFamily: font.pretendardMedium,
  fontSize: 18,
  marginTop: -1,
  paddingVertical: 0,
});

const Container = styled.View({
  flex: 1,
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  borderRadius: 20,
  gap: 16,
  backgroundColor: color.gray10,
  paddingHorizontal: 20,
  height: 50,
  paddingVertical: 0,
});

export default ToiletMapScreen;
