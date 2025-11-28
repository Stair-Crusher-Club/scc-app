import React from 'react';
import {FlatList, Platform} from 'react-native';
import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {PlaceListItem} from '@/generated-sources/openapi';
import {LogParamsProvider} from '@/logging/LogParamsProvider';
import useNavigation from '@/navigation/useNavigation';
import SearchItemCard from '@/screens/SearchScreen/components/SearchItemCard';
import SearchLoading from '@/screens/SearchScreen/components/SearchLoading';
import SearchNoResult from '@/screens/SearchScreen/components/SearchNoResult';
import {useDetailScreenVersion} from '@/utils/accessibilityFlags';

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
  const detailVersion = useDetailScreenVersion();
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
                    if (detailVersion === 'v2') {
                      navigation.navigate('PlaceDetailV2', {
                        placeInfo: {
                          placeId: item.place.id,
                        },
                      });
                      return;
                    }

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
