import {useSetAtom} from 'jotai';
import React from 'react';
import styled from 'styled-components/native';

import SearchIcon from '@/assets/icon/ic_search_detailed.svg';
import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {LogParamsProvider} from '@/logging/LogParamsProvider';
import useNavigation from '@/navigation/useNavigation';
import {searchModeAtom} from '@/screens/SearchScreen/atoms';

export default function SearchButtonSection() {
  const navigation = useNavigation();
  const setSearchMode = useSetAtom(searchModeAtom);

  const goToSearch = () => {
    setSearchMode('place');
    navigation.navigate('Search', {initKeyword: '', toMap: false});
  };

  return (
    <LogParamsProvider params={{displaySectionName: 'search_button_section'}}>
      <Container>
        <SccPressable elementName="home_v2_search_button" onPress={goToSearch}>
          <SearchButton>
            <SearchButtonText>크러셔님, 오늘은 어디로 갈까요?</SearchButtonText>
            <SearchIcon width={24} height={24} color={color.brand50} />
          </SearchButton>
        </SccPressable>
      </Container>
    </LogParamsProvider>
  );
}

const Container = styled.View`
  padding-horizontal: 20px;
`;

const SearchButton = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: ${color.white};
  border-radius: 12px;
  padding-vertical: 12px;
  padding-left: 15px;
  padding-right: 12px;
  gap: 8px;
`;

const SearchButtonText = styled.Text`
  flex: 1;
  color: ${color.gray40};
  font-size: 16px;
  line-height: 24px;
  font-family: ${font.pretendardRegular};
  letter-spacing: -0.32px;
`;
