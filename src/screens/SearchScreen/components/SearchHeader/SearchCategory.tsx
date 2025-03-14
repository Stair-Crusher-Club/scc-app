import React from 'react';
import {ScrollView, View} from 'react-native';
import styled from 'styled-components/native';

import {color} from '@/constant/color.ts';
import {font} from '@/constant/font.ts';
import {LogClick} from '@/logging/LogClick.tsx';

import SearchCategoryIcon, {Icons} from './SearchCategoryIcon.tsx';

export default function SearchCategory({
  onPressKeyword,
}: {
  onPressKeyword: (keyword: string) => void;
}) {
  const _renderItem = ({
    item,
  }: {
    item: {category: keyof typeof Icons; keyword: string};
  }) => {
    return (
      <LogClick
        key={item.category}
        elementName="place_search_category"
        params={{keyword: item.keyword}}>
        <PressableCategory onPress={() => onPressKeyword(item.keyword)}>
          <SearchCategoryIcon icon={item.category} />
          <CategoryText>{item.keyword}</CategoryText>
        </PressableCategory>
      </LogClick>
    );
  };
  return (
    <ScrollView
      style={{
        overflow: 'visible',
      }}
      horizontal={true}
      showsHorizontalScrollIndicator={false}>
      <View style={{flexDirection: 'row', gap: 6}}>
        {SEARCH_CATEGORIES.map(item => _renderItem({item}))}
      </View>
    </ScrollView>
  );
}

const PressableCategory = styled.TouchableOpacity`
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 8px 18px;
  border-width: 1px;
  border-color: ${color.gray20};
  background-color: ${color.white};
  border-radius: 56px;
`;

const CategoryText = styled.Text`
  font-size: 15px;
  font-family: ${font.pretendardMedium};
  color: ${color.gray90};
  margin-left: 4px;
`;

const SEARCH_CATEGORIES: {category: keyof typeof Icons; keyword: string}[] = [
  {
    category: 'RESTAURANT',
    keyword: '음식점',
  },
  {
    category: 'CAFE',
    keyword: '카페',
  },
  {
    category: 'CONVENIENCE_STORE',
    keyword: '편의점',
  },
  {
    category: 'HOISPITAL',
    keyword: '병원',
  },
  {
    category: 'PHARMACY',
    keyword: '약국',
  },
];
