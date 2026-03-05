import {useBackHandler} from '@react-native-community/hooks';
import {useAtom, useAtomValue, useSetAtom} from 'jotai';
import React, {useCallback, useEffect, useRef} from 'react';
import {Keyboard, View} from 'react-native';

import {searchHistoriesAtom} from '@/atoms/User';
import {color} from '@/constant/color.ts';
import {LogParamsProvider} from '@/logging/LogParamsProvider';
import {ScreenProps} from '@/navigation/Navigation.screens';
import useNavigation from '@/navigation/useNavigation';
import {
  draftCameraRegionAtom,
  draftKeywordAtom,
  filterAtom,
  filterModalStateAtom,
  SearchMode,
  searchModeAtom,
  SearchQuery,
  searchQueryAtom,
  searchRequestIdAtom,
  SortOption,
  viewStateAtom,
} from '@/screens/SearchScreen/atoms';
import {
  SearchScreenProvider,
  useSearchScreenContext,
} from '@/screens/SearchScreen/SearchScreenContext';
import SearchHeader from '@/screens/SearchScreen/components/SearchHeader';
import SearchListView from '@/screens/SearchScreen/components/SearchListView';
import SearchMapView, {
  SearchMapViewHandle,
} from '@/screens/SearchScreen/components/SearchMapView';
import SearchSummaryView from '@/screens/SearchScreen/components/SearchSummaryView';
import ToiletListView from '@/screens/SearchScreen/components/ToiletListView';
import FilterModal from '@/screens/SearchScreen/modals/FilterModal';
import type {SearchResultItem} from '@/screens/SearchScreen/useSearchRequest';
import useSearchRequest from '@/screens/SearchScreen/useSearchRequest';
import {PlaceListItem} from '@/generated-sources/openapi';
import {MarkerItem} from '@/components/maps/MarkerItem';
import {ToiletDetails} from '@/screens/ToiletMapScreen/data';

import {resetHighlightAnimation} from '@/components/AccessibilityInfoRequestButton';

import * as S from './SearchScreen.style';

function isPlaceListItem(item: SearchResultItem): item is PlaceListItem {
  return 'place' in item;
}

function getItemId(item: SearchResultItem): string {
  return isPlaceListItem(item) ? item.place.id : item.id;
}

function getItemLocation(item: SearchResultItem) {
  return isPlaceListItem(item) ? item.place.location : item.location;
}

function getItemDisplayName(item: SearchResultItem): string {
  return isPlaceListItem(item) ? item.place.name : item.displayName;
}

export interface SearchScreenParams {
  initKeyword?: string;
  toMap?: boolean;
  searchQuery?: string;
  fromLookup?: boolean;
}

const SearchScreen = ({route}: ScreenProps<'Search'>) => {
  return (
    <SearchScreenProvider>
      <SearchScreenContent route={route} />
    </SearchScreenProvider>
  );
};

const SearchScreenContent = ({
  route,
}: {
  route: ScreenProps<'Search'>['route'];
}) => {
  const {
    initKeyword,
    toMap,
    searchQuery: deepLinkSearchQuery,
    fromLookup,
  } = route.params;
  const ref = useRef<SearchMapViewHandle>(null);
  const setFilter = useSetAtom(filterAtom);
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);
  const setSearchMode = useSetAtom(searchModeAtom);
  const searchMode = useAtomValue(searchModeAtom);

  const {data, isLoading, updateQuery, setOnFetchCompleted} =
    useSearchRequest();

  const searchRequestId = useAtomValue(searchRequestIdAtom);
  const setSearchRequestId = useSetAtom(searchRequestIdAtom);
  const setDraftCameraRegion = useSetAtom(draftCameraRegionAtom);
  const setDraftKeyword = useSetAtom(draftKeywordAtom);
  const setFilterModalState = useSetAtom(filterModalStateAtom);
  const [viewState, setViewState] = useAtom(viewStateAtom);
  const navigation = useNavigation();
  const setSearchHistories = useSetAtom(searchHistoriesAtom);
  const {setIsFromLookup} = useSearchScreenContext();

  const onQueryUpdate = (
    queryUpdate: Partial<SearchQuery>,
    option: {
      shouldRecordHistory?: boolean;
      shouldAnimate?: boolean;
      shouldRemainInInputMode?: boolean;
      mode?: SearchMode;
    },
  ) => {
    const shouldRecordHistory = option.shouldRecordHistory ?? false;
    const shouldAnimate = option.shouldAnimate ?? false;
    const shouldRemainInInputMode = option.shouldRemainInInputMode ?? false;

    // Update search mode if specified
    if (option.mode !== undefined) {
      setSearchMode(option.mode);
    }

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
              id: getItemId(it),
              location: getItemLocation(it),
              displayName: getItemDisplayName(it),
            })),
          );
        }
      });
    } else {
      setOnFetchCompleted(_ => {});
    }
  };
  const onItemSelect = (item: SearchResultItem) => {
    setViewState({type: 'map', inputMode: false});
    ref.current?.moveToItem(getItemId(item));
  };

  useEffect(() => {
    // 1. fromLookup 상태 설정
    setIsFromLookup(!!fromLookup);

    // 2. fromLookup이면 접근레벨 낮은순 정렬 적용
    if (fromLookup) {
      setFilter(prev => ({
        ...prev,
        sortOption: SortOption.LOW_SCORE,
      }));
    }

    // 3. initKeyword로 검색 트리거 (필터가 이미 설정된 상태)
    if (initKeyword) {
      onQueryUpdate({text: initKeyword}, {shouldAnimate: true});
    }
  }, []);

  useEffect(() => {
    if (toMap) {
      setViewState({type: 'map', inputMode: false});
    }
  }, [toMap]);

  useEffect(() => {
    if (deepLinkSearchQuery) {
      setViewState({type: 'map', inputMode: false});
      onQueryUpdate(
        {text: deepLinkSearchQuery},
        {shouldAnimate: true, shouldRecordHistory: true},
      );
    }
  }, [deepLinkSearchQuery]);

  // 화면 나갈 때 상태 돌려놓기
  useEffect(() => {
    return navigation.addListener('beforeRemove', () => {
      setIsFromLookup(false);
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
      setSearchMode('place');
      setSearchRequestId(null);
      resetHighlightAnimation();
    });
  }, [navigation]);

  const handleBack = useCallback((): boolean => {
    // 리스트 뷰 → 지도 뷰로 전환
    if (viewState.type === 'list' && !viewState.inputMode) {
      setViewState(prev => ({...prev, type: 'map', inputMode: false}));
      return true;
    }
    // Input mode + 검색 결과 있음 → 키보드 닫고 지도 결과 보기
    if (viewState.inputMode && searchQuery.text) {
      Keyboard.dismiss();
      setDraftKeyword(null);
      setViewState({type: 'map', inputMode: false});
      return true;
    }
    // 지도 뷰 + 검색 결과 있음 → 검색어만 클리어, 지도 뷰 유지
    if (!viewState.inputMode && searchQuery.text) {
      setSearchQuery({text: null, location: null, radiusMeter: null});
      setDraftKeyword(null);
      return true;
    }
    // 초기 상태 → 화면 나가기
    return false;
  }, [
    viewState,
    searchQuery.text,
    setViewState,
    setDraftKeyword,
    setSearchQuery,
  ]);

  useBackHandler(handleBack);

  return (
    <LogParamsProvider
      params={{
        search_query: searchQuery,
        view_state: viewState.type,
        search_query_text: searchQuery.text,
        search_request_id: searchRequestId,
      }}>
      <S.SearchScreenLayout isHeaderVisible={false} safeAreaEdges={['top']}>
        <SearchHeader
          onQueryUpdate={onQueryUpdate}
          autoFocus={!initKeyword && !toMap && !deepLinkSearchQuery}
          onBack={handleBack}
        />
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
                // 현재 검색어와 카메라 영역을 유지하면서 재검색
                onQueryUpdate(
                  {useCameraRegion: true},
                  {shouldRecordHistory: false, shouldAnimate: false},
                );
              }}
              data={data ?? []}
            />
          </View>
          {viewState.inputMode && searchMode === 'place' && (
            <SearchSummaryView
              onItemSelect={onItemSelect}
              isLoading={isLoading}
              searchResults={data as PlaceListItem[] | null}
              onQueryUpdate={keyword => {
                onQueryUpdate(
                  {text: keyword},
                  {
                    shouldRecordHistory: true,
                    shouldAnimate: true,
                    mode: 'place',
                  },
                );
              }}
            />
          )}
          {!viewState.inputMode &&
            viewState.type === 'list' &&
            searchMode === 'place' && (
              <SearchListView
                isVisible={true}
                isLoading={isLoading}
                searchResults={(data ?? []) as PlaceListItem[]}
              />
            )}
          {!viewState.inputMode &&
            viewState.type === 'list' &&
            searchMode === 'toilet' && (
              <ToiletListView
                isVisible={true}
                isLoading={isLoading}
                searchResults={(data ?? []) as (ToiletDetails & MarkerItem)[]}
              />
            )}
        </View>
        <FilterModal />
      </S.SearchScreenLayout>
    </LogParamsProvider>
  );
};

export default SearchScreen;
