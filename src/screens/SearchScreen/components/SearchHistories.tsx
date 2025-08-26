import {useAtom} from 'jotai';
import React from 'react';
import {ScrollView, TouchableOpacity} from 'react-native';
import styled from 'styled-components/native';

import CloseIcon from '@/assets/icon/close.svg';
import {searchHistoriesAtom} from '@/atoms/User';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {LogClick} from '@/logging/LogClick';

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
      <TitleWrap>
        <TitleText>최근 검색어</TitleText>
        <TouchableOpacity onPress={() => setSearchHistories([])}>
          <ClearAllText>모두 삭제</ClearAllText>
        </TouchableOpacity>
      </TitleWrap>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{overflow: 'visible'}}
        contentContainerStyle={{
          flexDirection: 'row',
          gap: 6,
          flexWrap: 'nowrap',
        }}>
        {searchHistories.map(search => (
          <ItemBox key={search}>
            <LogClick elementName={`recent-keyword-${search}`}>
              <TouchableOpacity onPress={() => onClickSearch(search)}>
                <ItemText numberOfLines={1}>{search}</ItemText>
              </TouchableOpacity>
            </LogClick>
            <RemoveButton
              onPress={() => {
                setSearchHistories(
                  searchHistories.filter(s => s !== search) ?? [],
                );
              }}>
              <CloseIcon color={color.gray80} width={12} height={12} />
            </RemoveButton>
          </ItemBox>
        ))}
      </ScrollView>
    </Container>
  );
}

const Container = styled.View`
  gap: 12px;
`;

const TitleWrap = styled.View`
  width: 100%;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const TitleText = styled.Text`
  font-size: 14px;
  font-family: ${() => font.pretendardBold};
  color: ${() => color.black};
`;

const ClearAllText = styled.Text`
  font-size: 13px;
  font-family: ${() => font.pretendardRegular};
  color: ${() => color.gray70};
`;

const ItemBox = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  border-width: 1px;
  border-color: ${() => color.gray20};
  border-radius: 100px;
  padding-vertical: 7px;
  padding-left: 12px;
  padding-right: 8px;
  background-color: ${() => color.white};
  height: 36px;
`;

const ItemText = styled.Text`
  font-size: 15px;
  font-family: ${() => font.pretendardRegular};
  color: ${() => color.black};
`;

const RemoveButton = styled.TouchableOpacity`
  padding: 4px;
`;
