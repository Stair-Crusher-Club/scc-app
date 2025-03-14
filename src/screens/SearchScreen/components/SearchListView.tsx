import React from 'react';
import {FlatList} from 'react-native';
import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {PlaceListItem} from '@/generated-sources/openapi';
import useNavigation from '@/navigation/useNavigation';
import SearchItemCard from '@/screens/SearchScreen/components/SearchItemCard';
import SearchLoading from '@/screens/SearchScreen/components/SearchLoading';
import SearchNoResult from '@/screens/SearchScreen/components/SearchNoResult';

export default function SearchListView({
  searchResults,
  isLoading,
  isVisible,
}: {
  isVisible: boolean;
  isLoading: boolean;
  searchResults: PlaceListItem[];
}) {
  const navigation = useNavigation();
  return (
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
            <ItemWrapper key={item.place.id}>
              <SearchItemCard
                item={item}
                isHeightFlex
                onPress={() => {
                  navigation.navigate('PlaceDetail', {
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
