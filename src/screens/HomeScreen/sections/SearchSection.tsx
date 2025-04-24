import React from 'react';
import {Pressable} from 'react-native';
import styled from 'styled-components/native';

import MapIcon from '@/assets/icon/ic_map_detailed.svg';
import SearchIcon from '@/assets/icon/ic_search_detailed.svg';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {LogClick} from '@/logging/LogClick';
import useNavigation from '@/navigation/useNavigation';
import SearchCategory from '@/screens/SearchScreen/components/SearchHeader/SearchCategory.tsx';

export default function SearchSection() {
  const navigation = useNavigation();

  const goToSearch = (initKeyword: string, toMap?: boolean) => {
    navigation.navigate('Search', {initKeyword, toMap});
  };

  return (
    <Contents>
      <Title>어느 장소를 정복할까요?</Title>
      <LogClick elementName="place_search_input">
        <SearchInputContainer>
          <Pressable onPress={() => goToSearch('', true)}>
            <MapIcon width={24} height={24} />
          </Pressable>
          <Pressable
            onPress={() => goToSearch('')}
            style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
            <SearchInputText>장소, 주소 검색</SearchInputText>
            <SearchIcon width={24} height={24} color={color.gray70} />
          </Pressable>
        </SearchInputContainer>
      </LogClick>
      <SearchCategoryContainer>
        <SearchCategory onPressKeyword={goToSearch} />
      </SearchCategoryContainer>
    </Contents>
  );
}

const Contents = styled.View`
  background-color: ${color.white};
  padding-top: 20px;
`;

const Title = styled.Text`
  color: ${color.black};
  font-size: 20px;
  font-family: ${font.pretendardBold};
  margin-horizontal: 20px;
  padding-bottom: 16px;
`;

const SearchInputContainer = styled.View`
  flex-direction: row;
  background-color: ${color.gray10};
  border-radius: 8px;
  margin-horizontal: 20px;
  gap: 8px;
  padding-top: 12px;
  padding-bottom: 13px;
  padding-horizontal: 12px;
  align-items: center;
`;

const SearchInputText = styled.Text`
  flex: 1;
  color: ${color.gray50};
  font-size: 16px;
  line-height: 24px;
  font-family: ${font.pretendardRegular};
`;

const SearchCategoryContainer = styled.View`
  overflow: visible;
  padding-horizontal: 20px;
  padding-vertical: 16px;
`;
