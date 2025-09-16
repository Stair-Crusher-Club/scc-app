import React from 'react';
import styled from 'styled-components/native';

import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {SearchPlaceSortDto} from '@/generated-sources/openapi';

import Converters from '../Converters';

interface SearchSortOptionInitParams {
  sortOption: SearchPlaceSortDto;
  isSelected: boolean;
  onPress: () => void;
}

const SortOption = styled(SccPressable)({
  height: 56,
  borderWidth: 1,
  borderRadius: 20,
  borderColor: color.gray30,
  backgroundColor: color.white,
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 10,
});

const SortOptionText = styled.Text({
  color: color.gray70,
  fontSize: 16,
  fontFamily: font.pretendardMedium,
});

const SelectedSortOption = styled(SortOption)`
  background-color: ${color.blue30a15};
`;

const SelectedSortOptionText = styled(SortOptionText)`
  color: ${color.brandColor};
`;

const SearchSortOptionItem = ({
  sortOption,
  isSelected,
  onPress,
}: SearchSortOptionInitParams) => {
  if (isSelected) {
    return (
      <SelectedSortOption
        elementName="search_sort_selected_option"
        onPress={onPress}>
        <SelectedSortOptionText>
          {Converters.displayText(sortOption)}
        </SelectedSortOptionText>
      </SelectedSortOption>
    );
  }
  return (
    <SortOption elementName="search_sort_option" onPress={onPress}>
      <SortOptionText>{Converters.displayText(sortOption)}</SortOptionText>
    </SortOption>
  );
};

export default SearchSortOptionItem;
