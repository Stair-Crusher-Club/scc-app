import React from 'react';
import styled from 'styled-components/native';

import ExitIcon from '@/assets/icon/ic_exit.svg';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {SearchPlaceSortDto} from '@/generated-sources/openapi';

import BottomSheet from '../../../modals/BottomSheet';
import SearchSortOptionItem from './SearchSortOptionSelectorItem';

interface SearchSortOptionSelectorInitParams {
  isVisible: boolean;
  selectedSort: SearchPlaceSortDto;
  onSelectSortOption: (sort: SearchPlaceSortDto) => void;
  onCloseButtonPress: () => void;
}

const SearchSortOptionSelectorBottomSheet = ({
  selectedSort,
  isVisible,
  onSelectSortOption,
  onCloseButtonPress,
}: SearchSortOptionSelectorInitParams) => {
  return (
    <BottomSheet isVisible={isVisible}>
      <Header>
        <Title>정렬 순서</Title>
        <ExitIcon
          style={{padding: 4}}
          width={24}
          height={24}
          color={color.black}
          onPress={onCloseButtonPress}
        />
      </Header>
      <SortOptionsContainer>
        <SearchSortOptionItem
          sortOption={SearchPlaceSortDto.Accuracy}
          isSelected={selectedSort === SearchPlaceSortDto.Accuracy}
          onPress={() => {
            onSelectSortOption(SearchPlaceSortDto.Accuracy);
          }}
        />
        <SearchSortOptionItem
          sortOption={SearchPlaceSortDto.Distance}
          isSelected={selectedSort === SearchPlaceSortDto.Distance}
          onPress={() => {
            onSelectSortOption(SearchPlaceSortDto.Distance);
          }}
        />
        <SearchSortOptionItem
          sortOption={SearchPlaceSortDto.AccessibilityScore}
          isSelected={selectedSort === SearchPlaceSortDto.AccessibilityScore}
          onPress={() => {
            onSelectSortOption(SearchPlaceSortDto.AccessibilityScore);
          }}
        />
      </SortOptionsContainer>
    </BottomSheet>
  );
};

const Header = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: 28,
  marginHorizontal: 24,
});

const Title = styled.Text({
  flex: 1,
  fontSize: 20,
  fontFamily: font.pretendardBold,
  color: color.black,
  marginRight: 10,
});

const SortOptionsContainer = styled.View({
  flexDirection: 'column',
  marginTop: 30,
  marginHorizontal: 24,
  marginBottom: 20,
});

export default SearchSortOptionSelectorBottomSheet;
