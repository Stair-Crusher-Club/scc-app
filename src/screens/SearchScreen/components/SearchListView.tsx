import React, {useRef} from 'react';
import {FlatList, Platform} from 'react-native';
import type {ViewToken} from 'react-native';
import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {PlaceListItem} from '@/generated-sources/openapi';
import {usePlaceDetailScreenName} from '@/hooks/useFeatureFlags';
import {LogParamsProvider} from '@/logging/LogParamsProvider';
import {useLogger} from '@/logging/useLogger';
import useNavigation from '@/navigation/useNavigation';
import SearchItemCard from '@/screens/SearchScreen/components/SearchItemCard';
import SearchLoading from '@/screens/SearchScreen/components/SearchLoading';
import SearchNoResult from '@/screens/SearchScreen/components/SearchNoResult';

const VIEWABILITY_CONFIG = {itemVisiblePercentThreshold: 50};

export default function SearchListView({
  searchResults,
  isLoading,
  isVisible,
  searchQuery,
  onWebPlaceClick,
}: {
  isVisible: boolean;
  isLoading: boolean;
  searchResults: PlaceListItem[];
  searchQuery?: string;
  onWebPlaceClick?: (placeId: string) => void;
}) {
  const navigation = useNavigation();
  const pdpScreen = usePlaceDetailScreenName();
  const logger = useLogger();
  const loggerRef = useRef(logger);
  loggerRef.current = logger;

  const loggedItemsRef = useRef(new Set<string>());

  // Reset logged items when search results change
  const prevSearchResultsRef = useRef(searchResults);
  if (prevSearchResultsRef.current !== searchResults) {
    prevSearchResultsRef.current = searchResults;
    loggedItemsRef.current.clear();
  }

  const onViewableItemsChanged = useRef(
    ({viewableItems}: {viewableItems: ViewToken[]}) => {
      viewableItems.forEach(({item}) => {
        const placeItem = item as PlaceListItem;
        const key = placeItem.place.id;
        if (!loggedItemsRef.current.has(key)) {
          loggedItemsRef.current.add(key);
          loggerRef.current.logElementView('place_search_item_card', {
            search_view_mode: 'list',
            place_id: placeItem.place.id,
            place_name: placeItem.place.name,
          });
        }
      });
    },
  ).current;

  return (
    <LogParamsProvider params={{search_view_mode: 'list'}}>
      <Container isVisible={isVisible}>
        {isLoading ? (
          <SearchLoading />
        ) : searchResults.length === 0 ? (
          <SearchNoResult />
        ) : (
          <FlatList
            contentContainerStyle={{paddingBottom: 100}}
            keyboardDismissMode="on-drag"
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={VIEWABILITY_CONFIG}
            renderItem={({item}) => (
              <ItemWrapper key={item.place.id}>
                <SearchItemCard
                  item={item}
                  isHeightFlex
                  onPress={() => {
                    if (searchQuery && Platform.OS === 'web') {
                      // Web: Use window.history.pushState like map marker click
                      onWebPlaceClick?.(item.place.id);
                      return;
                    }

                    // Native app navigation
                    navigation.navigate(pdpScreen, {
                      placeInfo: {
                        placeId: item.place.id,
                      },
                    });
                  }}
                />
              </ItemWrapper>
            )}
            data={searchResults}
          />
        )}
      </Container>
    </LogParamsProvider>
  );
}

const Container = styled.View<{isVisible: boolean}>`
  display: ${props => (props.isVisible ? 'flex' : 'none')};
  flex-direction: column;
  flex: 1;
  background-color: ${color.white};
`;

const ItemWrapper = styled.View`
  padding: 20px;
  border-top-width: 1px;
  border-top-color: ${() => color.gray20};
`;
