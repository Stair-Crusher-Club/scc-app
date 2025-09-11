import {FlashList} from '@shopify/flash-list';
import React from 'react';
import {ScrollView} from 'react-native';
import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {PlaceListItem} from '@/generated-sources/openapi';
import SearchHistories from '@/screens/SearchScreen/components/SearchHistories';
import SearchItemSummary from '@/screens/SearchScreen/components/SearchItemSummary';
import SearchLoading from '@/screens/SearchScreen/components/SearchLoading';
import SearchNoResult from '@/screens/SearchScreen/components/SearchNoResult';

import SearchExplore from './SearchExplore';
import SearchRecommendKeyword from './SearchRecommendKeyword';
import SearchRecommendPlace from './SearchRecommendPlace';
import {LogParamsProvider} from '@/logging/LogParamsProvider';

export default function SearchSummaryView({
  searchResults,
  onQueryUpdate,
  onItemSelect,
  isLoading,
}: {
  isLoading: boolean;
  onQueryUpdate: (keyword: string) => void;
  onItemSelect: (item: PlaceListItem) => void;
  searchResults: PlaceListItem[] | null;
}) {
  return (
    <Container>
      {isLoading ? (
        <SearchLoading />
      ) : searchResults === null ? (
        <>
          <ScrollView
            bounces={false}
            style={{
              backgroundColor: color.gray20,
            }}>
            <SearchRecommendContainer>
              <SearchHistories onPressHistory={onQueryUpdate} />
              <SearchRecommendPlace onPressKeyword={onQueryUpdate} />
              <SearchRecommendKeyword onPressKeyword={onQueryUpdate} />
            </SearchRecommendContainer>
            <SearchExplore />
          </ScrollView>
        </>
      ) : searchResults.length === 0 ? (
        <SearchNoResult />
      ) : (
        <ListWrapper>
          <FlashList
            keyboardDismissMode="on-drag"
            renderItem={({item}) => (
              <LogParamsProvider
                params={{place_id: item.place.id, place_name: item.place.name}}>
                <ItemWrapper key={item.place.id}>
                  <SearchItemSummary
                    item={item}
                    onPress={() => onItemSelect(item)}
                  />
                </ItemWrapper>
              </LogParamsProvider>
            )}
            data={searchResults}
            estimatedItemSize={108}
          />
        </ListWrapper>
      )}
    </Container>
  );
}

const Container = styled.View`
  flex: 1;
  background-color: ${color.white};
`;

const SearchRecommendContainer = styled.View`
  padding: 16px 16px 32px;
  gap: 32px;
  background-color: ${color.white};
`;

const ItemWrapper = styled.View`
  padding-bottom: 30px;
`;

const ListWrapper = styled.View`
  padding: 20px;
  flex: 1;
`;
