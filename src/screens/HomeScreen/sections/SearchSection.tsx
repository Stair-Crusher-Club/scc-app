import React from 'react';

import {LogClick} from '@/logging/LogClick';
import useNavigation from '@/navigation/useNavigation';
import SearchCategory from '@/screens/SearchScreen/components/SearchHeader/SearchCategory.tsx';

import * as S from './SearchSection.style';

export default function SearchSection() {
  const navigation = useNavigation();

  const goToSearch = (initKeyword: string) => {
    navigation.navigate('Search', {initKeyword});
  };

  return (
    <S.Contents>
      <S.Title>어느 장소를 정복할까요?</S.Title>
      <LogClick elementName="place_search_input">
        <S.SearchInputContainer onPress={() => goToSearch('')}>
          <S.SearchInputText>장소, 주소 검색</S.SearchInputText>
          <S.SearchIconWrapper width={20} height={20} />
        </S.SearchInputContainer>
      </LogClick>
      <S.SearchCategoryContainer>
        <SearchCategory onPressKeyword={goToSearch} />
      </S.SearchCategoryContainer>
    </S.Contents>
  );
}
