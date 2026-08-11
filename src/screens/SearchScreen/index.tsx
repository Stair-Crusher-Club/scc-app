import {useBackHandler} from '@react-native-community/hooks';
import {
  RouteProp,
  useNavigationState,
  useRoute,
} from '@react-navigation/native';
import {useAtom, useAtomValue, useSetAtom} from 'jotai';
import React, {useCallback, useEffect, useLayoutEffect, useRef} from 'react';
import {Keyboard, View} from 'react-native';

import {searchHistoriesAtom} from '@/atoms/User';
import {color} from '@/constant/color.ts';
import {AlternativeSearchSuggestionDto} from '@/generated-sources/openapi';
import {
  getPlaceAccessibilityScore,
  GOOD_ACCESSIBILITY_MAX_SCORE,
} from '@/utils/accessibilityCheck';
import {LogParamsProvider} from '@/logging/LogParamsProvider';
import {ScreenParams} from '@/navigation/Navigation.screens';
import useNavigation from '@/navigation/useNavigation';
import {useTabBarStyle} from '@/navigation/useTabBarStyle';
import {
  draftCameraRegionAtom,
  draftKeywordAtom,
  filterAtom,
  filterModalStateAtom,
  isAlternativeSearchAtom,
  isToiletSearchKeyword,
  SearchMode,
  searchModeAtom,
  SearchQuery,
  searchQueryAtom,
  searchRequestIdAtom,
  SortOption,
  toiletLayerActiveAtom,
  viewStateAtom,
} from '@/screens/SearchScreen/atoms';
import {
  SearchScreenProvider,
  useSearchScreenContext,
} from '@/screens/SearchScreen/SearchScreenContext';
import AlternativeSearchCta from '@/screens/SearchScreen/components/AlternativeSearchCta';
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
import {ToiletDetails} from '@/components/toilet/data';

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
  initSortOption?: SortOption;
}

const SearchScreen = () => {
  const route = useRoute<RouteProp<ScreenParams, 'Search'>>();
  // 메인 탭 의미론:
  //   - 다른 메인 탭(홈/챌린지/메뉴)으로 이동 → Content unmount (atom 전부 reset)
  //   - 지도 탭 위로 child stack(PDP 등) push   → mount 유지
  // useNavigationState 는 closest navigator(= Bottom Tab) 의 state 만 반환하므로
  // 부모 Stack 의 변화(PDP push/pop)에는 영향받지 않는다. selector 가 boolean 만
  // 반환해 active tab 변경 시에만 re-render 한다.
  const isSearchTabActive = useNavigationState(
    state => state.routes[state.index]?.name === 'Search',
  );
  if (!isSearchTabActive) {
    return null;
  }
  return (
    <SearchScreenProvider>
      <SearchScreenContent route={route} />
    </SearchScreenProvider>
  );
};

const SearchScreenContent = ({
  route,
}: {
  route: RouteProp<ScreenParams, 'Search'>;
}) => {
  // Tab 화면은 navigate 없이 mount될 수 있어 route.params가 undefined일 수 있다.
  const {
    initKeyword,
    toMap,
    searchQuery: deepLinkSearchQuery,
    fromLookup,
    initSortOption,
  } = route.params ?? {};
  const ref = useRef<SearchMapViewHandle>(null);
  const setFilter = useSetAtom(filterAtom);
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);
  const setSearchMode = useSetAtom(searchModeAtom);
  const setToiletLayerActive = useSetAtom(toiletLayerActiveAtom);

  const {data, resultMode, isLoading, updateQuery, setOnFetchCompleted} =
    useSearchRequest();

  const searchRequestId = useAtomValue(searchRequestIdAtom);
  const setSearchRequestId = useSetAtom(searchRequestIdAtom);
  const setDraftCameraRegion = useSetAtom(draftCameraRegionAtom);
  const setDraftKeyword = useSetAtom(draftKeywordAtom);
  const setFilterModalState = useSetAtom(filterModalStateAtom);
  const [viewState, setViewState] = useAtom(viewStateAtom);
  const navigation = useNavigation();
  const setSearchHistories = useSetAtom(searchHistoriesAtom);
  const [isAlternativeSearch, setIsAlternativeSearch] = useAtom(
    isAlternativeSearchAtom,
  );
  const {setIsFromLookup} = useSearchScreenContext();
  const tabBarStyle = useTabBarStyle();

  const onQueryUpdate = (
    queryUpdate: Partial<SearchQuery>,
    option: {
      shouldRecordHistory?: boolean;
      shouldAnimate?: boolean;
      shouldRemainInInputMode?: boolean;
      mode?: SearchMode;
      /** 대체 검색("주위 다른 OOO 확인하기")으로 트리거된 검색인지. */
      isAlternativeSearch?: boolean;
    },
  ) => {
    const shouldRecordHistory = option.shouldRecordHistory ?? false;
    const shouldAnimate = option.shouldAnimate ?? false;
    // 대체 검색으로 얻은 결과에서는 CTA를 다시 띄우지 않는다.
    // 그 외의 모든 검색어 변경은 이 상태를 해제한다.
    if (queryUpdate.text !== undefined) {
      setIsAlternativeSearch(option.isAlternativeSearch ?? false);
    }
    const shouldRemainInInputMode = option.shouldRemainInInputMode ?? false;

    // 검색어가 화장실 키워드면 어느 경로(타이핑/히스토리/딥링크)든 칩과 동일하게 toilet 모드로.
    const effectiveMode = isToiletSearchKeyword(queryUpdate.text)
      ? 'toilet'
      : option.mode;
    if (effectiveMode !== undefined) {
      setSearchMode(effectiveMode);
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
    const willTriggerSearch = !!queryUpdate.text;
    if (shouldAnimate && willTriggerSearch) {
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
    Keyboard.dismiss();
    ref.current?.moveToItem(getItemId(item));
    if (searchQuery.text) {
      setSearchHistories(prev => {
        const newHistories = prev.filter(h => h !== searchQuery.text);
        return [searchQuery.text!, ...newHistories].slice(0, 10);
      });
    }
  };

  // 검색 결과에 접근레벨 2 이하 장소가 하나도 없으면(부정경험) 대체 검색을 제안할 수 있다.
  // 하나라도 있으면 사용자가 이미 쓸 만한 결과를 얻은 것이므로 제안 자체를 하지 않는다.
  const hasAccessiblePlaceInResults =
    resultMode === 'place' &&
    ((data ?? []) as PlaceListItem[]).some(item => {
      const score = getPlaceAccessibilityScore({
        score: item.accessibilityInfo?.accessibilityScore,
        hasPlaceAccessibility: item.hasPlaceAccessibility,
        hasBuildingAccessibility: item.hasBuildingAccessibility,
      });
      return typeof score === 'number' && score <= GOOD_ACCESSIBILITY_MAX_SCORE;
    });

  // 카드 위에 어떤 CTA를 띄울지(또는 아무것도 안 띄울지)의 판단은 이 화면에만 존재한다.
  // CTA 컴포넌트는 자기 로직으로만(제안 없음/스크롤 중) 스스로를 숨긴다.
  const shouldShowAlternativeSearchCta =
    // 요청 모드(searchMode)가 아니라 응답의 결과 모드로 판단해야 한다. "강남역 화장실"처럼
    // place 엔드포인트로 나갔다가 화장실 결과로 내려오는 검색이 있다.
    resultMode === 'place' &&
    !!searchQuery.text &&
    !hasAccessiblePlaceInResults &&
    // 대체 검색으로 얻은 결과에서 또 대체 검색을 권하지 않는다.
    !isAlternativeSearch;

  const onAlternativeSearch = (suggestion: AlternativeSearchSuggestionDto) => {
    // 서버는 사용자의 결과 필터를 모른 채 "접근레벨 2 이하가 4곳 이상 있다"를 보장했다.
    // 필터를 그대로 들고 재검색하면 그 보장이 깨져 빈 결과가 나올 수 있으므로 함께 해제한다.
    // 정렬은 접근레벨 낮은순으로 고정한다.
    setFilter({
      sortOption: SortOption.LOW_SCORE,
      scoreUnder: null,
      hasSlope: null,
      isRegistered: null,
      hasReview: null,
    });
    setDraftKeyword(suggestion.searchText);
    onQueryUpdate(
      {
        text: suggestion.searchText,
        // 서버가 제안 여부를 판단할 때 실제로 검색해본 영역 그대로 재검색해야
        // "눌렀는데 결과가 없다"가 발생하지 않는다.
        location: suggestion.circleRegion.currentLocation,
        radiusMeter: suggestion.circleRegion.distanceMetersLimit,
        useCameraRegion: false,
      },
      {
        shouldAnimate: true,
        shouldRecordHistory: false,
        mode: 'place',
        isAlternativeSearch: true,
      },
    );
  };

  const alternativeSearchCtaSlot = useCallback(
    ({
      focusedItem,
      isScrolling,
    }: {
      focusedItem: {id: string} | null;
      isScrolling: boolean;
    }) => (
      <AlternativeSearchCta
        focusedPlaceId={focusedItem?.id ?? null}
        isScrolling={isScrolling}
        currentSearchText={searchQuery.text}
        onPress={onAlternativeSearch}
      />
    ),

    [searchQuery.text],
  );

  // SearchScreenContent 의 생명주기는 wrapper 의 activeMainTab 분기가 결정한다:
  //   - mount   : 사용자가 지도 탭에 진입한 시점. route.params 기반으로 초기 검색 트리거.
  //   - unmount : 다른 메인 탭으로 이동한 시점. 전역 atom 들을 default 로 reset.
  // 이 두 동작을 하나의 effect 의 setup/cleanup 쌍으로 묶어 mount 와 reset 의
  // 단일 진실 원천을 만든다.
  useEffect(() => {
    setIsFromLookup(!!fromLookup);
    if (initSortOption) {
      setFilter(prev => ({...prev, sortOption: initSortOption}));
    }
    if (toMap) {
      setViewState({type: 'map', inputMode: false});
    }
    if (deepLinkSearchQuery) {
      setViewState({type: 'map', inputMode: false});
      onQueryUpdate(
        {text: deepLinkSearchQuery},
        {shouldAnimate: true, shouldRecordHistory: true},
      );
    } else if (initKeyword) {
      onQueryUpdate({text: initKeyword}, {shouldAnimate: true});
    }
    return () => {
      setFilter({
        sortOption: SortOption.LOW_SCORE,
        hasSlope: null,
        scoreUnder: null,
        isRegistered: null,
        hasReview: null,
      });
      setFilterModalState(null);
      setViewState({type: 'map', inputMode: false});
      setSearchQuery({text: null, location: null, radiusMeter: null});
      setDraftCameraRegion(null);
      setDraftKeyword(null);
      setSearchMode('place');
      setSearchRequestId(null);
      setToiletLayerActive(false);
      setIsAlternativeSearch(false);
      resetHighlightAnimation();
    };
  }, []);

  const handleBack = useCallback((): boolean => {
    if (!navigation.isFocused()) return false;
    // 화장실 카드(overlay)가 보이고 있으면 해제
    if (ref.current?.hasOverlayFocus?.()) {
      ref.current.clearOverlayFocus();
      return true;
    }
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
    // 지도 뷰 + 검색 결과 있음 → 검색어·결과를 지우고 검색어 입력 화면으로.
    // (X 버튼(onClear)은 지도 empty view로 가는 것과 의도적으로 다르다)
    if (!viewState.inputMode && searchQuery.text) {
      setDraftKeyword('');
      setViewState({type: 'map', inputMode: true});
      onQueryUpdate(
        {text: ''},
        {
          shouldRecordHistory: false,
          // inputMode를 유지해야 검색어 입력 화면에 머문다.
          shouldRemainInInputMode: true,
          shouldAnimate: false,
          mode: 'place',
        },
      );
      navigation.setParams({
        initKeyword: undefined,
        toMap: undefined,
        searchQuery: undefined,
        fromLookup: undefined,
        initSortOption: undefined,
      });
      return true;
    }
    // 검색어 없는 입력 화면 → 지도 엠티뷰로. 여기서 바로 화면을 나가면
    // 하단 탭바가 없는 입력 화면에서 뒤로가기 한 번에 앱이 종료된다.
    if (viewState.inputMode) {
      Keyboard.dismiss();
      setDraftKeyword(null);
      setViewState({type: 'map', inputMode: false});
      return true;
    }
    // 초기 상태 → 화면 나가기
    return false;
  }, [
    navigation,
    viewState,
    searchQuery.text,
    setViewState,
    setDraftKeyword,
    setSearchQuery,
  ]);

  useBackHandler(handleBack);

  // Empty view (검색 전 + 입력 모드 아님)일 때만 하단 navbar 노출.
  // 검색 결과/리스트뷰/입력 모드에서는 navbar를 숨긴다.
  //
  // navbar 토글 시 map view height가 변하면 카메라 fit 애니메이션이 어긋나 보이는 문제가
  // 있으므로, 노출 시에도 position:absolute로 띄워서 map view를 항상 풀스크린으로 유지한다.
  // (즉 map은 항상 풀스크린이고, navbar는 빈 view일 때만 하단에 오버레이로 떠 있는 형태)
  // Search 화면이 focus 잃으면 다른 탭의 own options가 적용되므로 이 override는 영향 없음.
  const isEmptyView =
    !searchQuery.text && !viewState.inputMode && viewState.type === 'map';
  useLayoutEffect(() => {
    // navigation prop은 Stack 기준 타입이지만 실제로는 Tab 안에서 동작하므로
    // tabBarStyle 옵션을 받기 위해 캐스팅한다.
    (navigation as unknown as {setOptions: (o: object) => void}).setOptions({
      // 이 override 는 navigator screenOptions 의 tabBarStyle 을 통째로 대체하므로
      // 높이를 함께 넘겨야 한다. 안 그러면 지도 탭만 탭바가 낮아지고,
      // tabBarHeight 로 하단 여백을 잡는 UI(플로팅 버튼)도 이 화면에서만 어긋난다.
      tabBarStyle: isEmptyView
        ? {
            ...tabBarStyle,
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
          }
        : {display: 'none'},
    });
  }, [navigation, isEmptyView, tabBarStyle]);

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
          // 검색 바 클릭(toMap=false)으로 진입한 경우에만 input에 autoFocus.
          // 지도 탭 직접 진입(route.params undefined)일 때는 map mode 유지.
          autoFocus={toMap === false && !initKeyword && !deepLinkSearchQuery}
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
              resultMode={resultMode}
              AboveCardsSlot={
                shouldShowAlternativeSearchCta
                  ? alternativeSearchCtaSlot
                  : undefined
              }
            />
          </View>
          {viewState.inputMode && resultMode === 'place' && (
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
            resultMode === 'place' && (
              <SearchListView
                isVisible={true}
                isLoading={isLoading}
                searchResults={(data ?? []) as PlaceListItem[]}
              />
            )}
          {!viewState.inputMode &&
            viewState.type === 'list' &&
            resultMode === 'toilet' && (
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
