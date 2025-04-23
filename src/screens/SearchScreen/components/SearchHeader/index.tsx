import {useAtom} from 'jotai';
import React from 'react';
import {View} from 'react-native';
import styled from 'styled-components/native';

import {color} from '@/constant/color.ts';
import {
  SearchQuery,
  searchQueryAtom,
  viewStateAtom,
} from '@/screens/SearchScreen/atoms';
import SearchCategory from '@/screens/SearchScreen/components/SearchHeader/SearchCategory.tsx';
import SearchFilterPreview from '@/screens/SearchScreen/components/SearchHeader/SearchFilterPreview.tsx';
import SearchInputText from '@/screens/SearchScreen/components/SearchHeader/SearchInputText.tsx';
import {useCheckAuth} from '@/utils/checkAuth';

export default function SearchHeader({
  onQueryUpdate,
  autoFocus,
}: {
  autoFocus?: boolean;
  onQueryUpdate: (
    queryUpdate: Partial<SearchQuery>,
    option: {
      shouldRecordHistory?: boolean;
      shouldAnimate?: boolean;
      shouldRemainInInputMode?: boolean;
    },
  ) => void;
}) {
  const [viewState] = useAtom(viewStateAtom);
  const [searchQuery] = useAtom(searchQueryAtom);
  const checkAuth = useCheckAuth();
  return (
    <Container>
      <SearchInputText
        onTextUpdate={(keyword, isPreviewChange) => {
          onQueryUpdate(
            {text: keyword},
            {
              shouldRecordHistory: !isPreviewChange,
              shouldRemainInInputMode: isPreviewChange,
              shouldAnimate: true,
            },
          );
        }}
        autoFocus={autoFocus}
      />
      {!searchQuery.text ? (
        <View style={{paddingBottom: 8, paddingHorizontal: 12}}>
          <SearchCategory
            onPressKeyword={keyword =>
              checkAuth(() =>
                onQueryUpdate(
                  {text: keyword},
                  {shouldRecordHistory: false, shouldAnimate: false},
                ),
              )
            }
          />
        </View>
      ) : (
        !viewState.inputMode && <SearchFilterPreview />
      )}
    </Container>
  );
}

const Container = styled.View`
  overflow: hidden;
  width: 100%;
  z-index: 99;
  top: 0;
  background-color: ${color.white};
  flex-direction: column;
  padding-top: 6px;
`;
