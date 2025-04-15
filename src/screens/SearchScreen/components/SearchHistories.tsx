import {useAtom} from 'jotai';
import React from 'react';
import {TouchableOpacity} from 'react-native';
import styled from 'styled-components/native';

import XIcon from '@/assets/icon/ic_x.svg';
import {searchHistoriesAtom} from '@/atoms/User';
import {color} from '@/constant/color';
import {font} from '@/constant/font';

export default function SearchHistories({
  onPressHistory: onClickSearch,
}: {
  onPressHistory: (search: string) => void;
}) {
  const [searchHistories, setSearchHistories] = useAtom(searchHistoriesAtom);
  if (searchHistories === null || searchHistories.length === 0) {
    return null;
  }
  return (
    <Container>
      <TitleText>최근 검색어</TitleText>
      <ItemList>
        {searchHistories.map(search => (
          <ItemBox key={search}>
            <TouchableOpacity
              style={{flexGrow: 1, paddingVertical: 10}}
              onPress={() => onClickSearch(search)}>
              <ItemText numberOfLines={1}>{search}</ItemText>
            </TouchableOpacity>
            <TouchableOpacity
              style={{padding: 10}}
              onPress={() => {
                setSearchHistories(
                  searchHistories.filter(s => s !== search) ?? [],
                );
              }}>
              <XIcon color={color.gray70} width={12} height={12} />
            </TouchableOpacity>
          </ItemBox>
        ))}
      </ItemList>
    </Container>
  );
}

const Container = styled.View`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 15px;
`;

const TitleText = styled.Text`
  font-size: 18px;
  font-family: ${() => font.pretendardBold};
  color: ${() => color.black};
`;

const ItemList = styled.View`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const ItemBox = styled.View`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
`;

const ItemText = styled.Text`
  font-size: 16px;
  font-family: ${() => font.pretendardRegular};
  color: ${() => color.black};
`;
