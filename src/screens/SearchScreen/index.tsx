import React, {useEffect, useRef, useState} from 'react';
import {Keyboard, Linking, View} from 'react-native';
import {useRecoilState} from 'recoil';

import {searchHistoriesAtom} from '@/atoms/User';
import {color} from '@/constant/color.ts';
import {PlaceListItem} from '@/generated-sources/openapi';
import {LogParamsProvider} from '@/logging/LogParamsProvider';
import GeolocationPermissionBottomSheet from '@/modals/GeolocationPermissionBottomSheet';
import {ScreenProps} from '@/navigation/Navigation.screens';
import useNavigation from '@/navigation/useNavigation';
import {
  draftCameraRegionAtom,
  draftKeywordAtom,
  filterAtom,
  filterModalStateAtom,
  SearchQuery,
  searchQueryAtom,
  SortOption,
  viewStateAtom,
} from '@/screens/SearchScreen/atoms';
import SearchHeader from '@/screens/SearchScreen/components/SearchHeader';
import SearchListView from '@/screens/SearchScreen/components/SearchListView';
import SearchMapView, {
  SearchMapViewHandle,
} from '@/screens/SearchScreen/components/SearchMapView';
import SearchSummaryView from '@/screens/SearchScreen/components/SearchSummaryView';
import FilterModal from '@/screens/SearchScreen/modals/FilterModal';
import useSearchRequest from '@/screens/SearchScreen/useSearchRequest';

import * as S from './SearchScreen.style';

export interface SearchScreenParams {
  initKeyword: string;
}

const SearchScreen = ({route}: ScreenProps<'Search'>) => {
  const {initKeyword} = route.params;
  const ref = useRef<SearchMapViewHandle>(null);
  const [, setFilter] = useRecoilState(filterAtom);
  const [searchQuery, setSearchQuery] = useRecoilState(searchQueryAtom);

  const {data, isLoading, updateQuery, setOnFetchCompleted} =
    useSearchRequest();

  const [, setDraftCameraRegion] = useRecoilState(draftCameraRegionAtom);
  const [, setDraftKeyword] = useRecoilState(draftKeywordAtom);
  const [, setFilterModalState] = useRecoilState(filterModalStateAtom);
  const [viewState, setViewState] = useRecoilState(viewStateAtom);
  const navigation = useNavigation();
  const [showGeolocationPermission, setShowGeolocationPermission] =
    useState(false);
  const [, setSearchHistories] = useRecoilState(searchHistoriesAtom);

  const onQueryUpdate = (
    queryUpdate: Partial<SearchQuery>,
    option: {
      shouldRecordHistory?: boolean;
      shouldAnimate?: boolean;
      shouldRemainInInputMode?: boolean;
    },
  ) => {
    const shouldRecordHistory = option.shouldRecordHistory ?? false;
    const shouldAnimate = option.shouldAnimate ?? false;
    const shouldRemainInInputMode = option.shouldRemainInInputMode ?? false;

    updateQuery(queryUpdate);
    if (!shouldRemainInInputMode) {
      Keyboard.dismiss();
      setViewState(prev => ({...prev, inputMode: false}));
    }
    if (shouldRecordHistory) {
      setSearchHistories(prev => {
        if (!queryUpdate.text) return prev;
        const newHistories = prev.filter(item => item !== queryUpdate.text);
        return [queryUpdate.text, ...newHistories].slice(0, 10);
      });
    }
    if (shouldAnimate) {
      setOnFetchCompleted(result => {
        if (result.length > 0) {
          ref.current?.fitToItems(
            result.map(it => ({
              ...it,
              id: it.place.id,
              location: it.building.location,
              displayName: it.place.name,
            })),
          );
        }
      });
    } else {
      setOnFetchCompleted(_ => {});
    }
  };
  const onItemSelect = (item: PlaceListItem) => {
    setViewState({type: 'map', inputMode: false});
    ref.current?.moveToItem(item.place.id);
  };

  useEffect(() => {
    if (!initKeyword) {
      return;
    }
    onQueryUpdate({text: initKeyword}, {shouldAnimate: true});
  }, [initKeyword]);

  // 화면 나갈 때 상태 돌려놓기
  useEffect(() => {
    return navigation.addListener('beforeRemove', () => {
      setFilter({
        sortOption: SortOption.ACCURACY,
        hasSlope: null,
        scoreUnder: null,
        isRegistered: null,
      });
      setFilterModalState(null);
      setViewState({type: 'map', inputMode: true});
      setSearchQuery({text: null, location: null, radiusMeter: null});
      setDraftCameraRegion(null);
      setDraftKeyword(null);
    });
  }, [navigation]);

  return (
    <LogParamsProvider
      params={{
        search_query: searchQuery,
        view_state: viewState.type,
        search_query_text: searchQuery.text,
      }}>
      <S.SearchScreenLayout isHeaderVisible={false} safeAreaEdges={['top']}>
        <SearchHeader onQueryUpdate={onQueryUpdate} autoFocus={!initKeyword} />
        <View
          style={{
            width: '100%',
            backgroundColor: color.white,
            flexGrow: 1,
          }}>
          {/*MapView 는 로딩이 느리므로 미리 렌더링하고 뒤에 깔아둔다.*/}
          <View
            style={{
              flexGrow: 1,
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}>
            <SearchMapView
              ref={ref}
              onRefresh={() => {
                onQueryUpdate(
                  {text: undefined},
                  {shouldRecordHistory: false, shouldAnimate: false},
                );
              }}
              data={data ?? []}
            />
          </View>
          {viewState.inputMode && (
            <SearchSummaryView
              onItemSelect={onItemSelect}
              isLoading={isLoading}
              searchResults={data}
              onQueryUpdate={keyword => {
                onQueryUpdate(
                  {text: keyword},
                  {shouldRecordHistory: true, shouldAnimate: true},
                );
              }}
            />
          )}
          {!viewState.inputMode && viewState.type === 'list' && (
            <SearchListView
              isVisible={true} // 리스트 매끄럽게 불러오기를 위함.
              isLoading={isLoading}
              searchResults={data ?? []}
            />
          )}
        </View>
        <GeolocationPermissionBottomSheet
          isVisible={showGeolocationPermission}
          onConfirmButtonPressed={() => {
            Linking.openSettings();
            setShowGeolocationPermission(false);
          }}
          onCloseButtonPressed={() => {
            setShowGeolocationPermission(false);
          }}
        />
        <FilterModal />
      </S.SearchScreenLayout>
    </LogParamsProvider>
  );
};

export default SearchScreen;
