import React from 'react';
import {FlatList} from 'react-native';
import styled from 'styled-components/native';

import {MarkerItem} from '@/components/maps/MarkerItem.ts';
import {color} from '@/constant/color';
import {LogParamsProvider} from '@/logging/LogParamsProvider';
import SearchLoading from '@/screens/SearchScreen/components/SearchLoading';
import SearchNoResult from '@/screens/SearchScreen/components/SearchNoResult';
import ToiletCard from '@/screens/ToiletMapScreen/ToiletCard';
import {ToiletDetails} from '@/screens/ToiletMapScreen/data';

export default function ToiletListView({
  searchResults,
  isLoading,
  isVisible,
}: {
  isVisible: boolean;
  isLoading: boolean;
  searchResults: (ToiletDetails & MarkerItem)[];
}) {
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
            renderItem={({item}) => (
              <ItemWrapper key={item.id}>
                <ToiletCard item={item} />
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
