import {FlashList} from '@shopify/flash-list';
import React from 'react';
import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {PlaceListItem} from '@/generated-sources/openapi';
import SearchHistories from '@/screens/SearchScreen/components/SearchHistories';
import SearchItemSummary from '@/screens/SearchScreen/components/SearchItemSummary';
import SearchLoading from '@/screens/SearchScreen/components/SearchLoading';
import SearchNoResult from '@/screens/SearchScreen/components/SearchNoResult';

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
          <CurationWrapper>
            <SearchHistories onPressHistory={onQueryUpdate} />
          </CurationWrapper>
        </>
      ) : searchResults.length === 0 ? (
        <SearchNoResult />
      ) : (
        <ListWrapper>
          <FlashList
            keyboardDismissMode="on-drag"
            renderItem={({item}) => (
              <ItemWrapper key={item.place.id}>
                <SearchItemSummary
                  item={item}
                  onPress={() => onItemSelect(item)}
                />
              </ItemWrapper>
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

const ItemWrapper = styled.View`
  padding-bottom: 30px;
`;

const ListWrapper = styled.View`
  padding: 20px;
  flex: 1;
`;

const CurationWrapper = styled.View`
  padding: 20px;
  flex-direction: column;
  gap: 30px;
  align-items: flex-start;
`;
