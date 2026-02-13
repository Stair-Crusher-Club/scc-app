import {useAtom} from 'jotai';
import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';
import styled from 'styled-components/native';

import {color} from '@/constant/color.ts';
import type {SearchMode} from '@/screens/SearchScreen/atoms';
import {
  SearchQuery,
  searchQueryAtom,
  viewStateAtom,
} from '@/screens/SearchScreen/atoms';
import SearchCategory from '@/screens/SearchScreen/components/SearchHeader/SearchCategory.tsx';
import SavedFilterBalloon from '@/screens/SearchScreen/components/SearchHeader/SavedFilterBalloon';
import SearchFilterPreview from '@/screens/SearchScreen/components/SearchHeader/SearchFilterPreview.tsx';
import SearchInputText from '@/screens/SearchScreen/components/SearchHeader/SearchInputText.tsx';

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
      mode?: SearchMode;
    },
  ) => void;
}) {
  const [viewState] = useAtom(viewStateAtom);
  const [searchQuery] = useAtom(searchQueryAtom);
  const hasBeenMapRef = useRef(false);

  useEffect(() => {
    if (!viewState.inputMode) {
      hasBeenMapRef.current = true;
    }
  }, [viewState.inputMode]);
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
              mode: 'place',
            },
          );
        }}
        autoFocus={autoFocus}
      />
      {!searchQuery.text ? (
        <View style={{paddingBottom: 8, paddingHorizontal: 12}}>
          <SearchCategory
            onPressKeyword={(keyword, mode) =>
              onQueryUpdate(
                {text: keyword, useCameraRegion: viewState.type === 'map'},
                {
                  shouldRecordHistory: false,
                  shouldAnimate: !hasBeenMapRef.current,
                  mode,
                },
              )
            }
          />
        </View>
      ) : (
        !viewState.inputMode && (
          <>
            <SearchFilterPreview />
            <SavedFilterBalloon />
          </>
        )
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
