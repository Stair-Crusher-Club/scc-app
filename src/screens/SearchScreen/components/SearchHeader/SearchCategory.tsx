import React from 'react';
import {ScrollView, View} from 'react-native';
import styled from 'styled-components/native';

import {color} from '@/constant/color.ts';
import {font} from '@/constant/font.ts';
import {SccTouchableOpacity} from '@/components/SccTouchableOpacity';
import type {SearchMode} from '@/screens/SearchScreen/atoms';

import SearchCategoryIcon, {Icons} from './SearchCategoryIcon.tsx';

export default function SearchCategory({
  onPressKeyword,
}: {
  onPressKeyword: (keyword: string, mode: SearchMode) => void;
}) {
  const _renderItem = ({item}: {item: SearchCategoryItem}) => {
    return (
      <PressableCategory
        key={item.category}
        elementName="place_search_category"
        logParams={{keyword: item.keyword, mode: item.mode}}
        onPress={() => onPressKeyword(item.keyword, item.mode)}>
        <SearchCategoryIcon icon={item.category} size={20} />
        <CategoryText>{item.label ?? item.keyword}</CategoryText>
      </PressableCategory>
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

const PressableCategory = styled(SccTouchableOpacity)`
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

type SearchCategoryItem = {
  category: keyof typeof Icons;
  label?: string; // 카테고리 버튼에 표시되는 텍스트 (없으면 keyword 사용)
  keyword: string; // 검색창에 입력되는 텍스트
  mode: SearchMode;
};

const SEARCH_CATEGORIES: SearchCategoryItem[] = [
  {
    category: 'TOILET',
    label: '화장실',
    keyword: '서울 장애인 화장실',
    mode: 'toilet',
  },
  {
    category: 'RESTAURANT',
    keyword: '음식점',
    mode: 'place',
  },
  {
    category: 'CAFE',
    keyword: '카페',
    mode: 'place',
  },
  {
    category: 'CONVENIENCE_STORE',
    keyword: '편의점',
    mode: 'place',
  },
  {
    category: 'HOISPITAL',
    keyword: '병원',
    mode: 'place',
  },
  {
    category: 'PHARMACY',
    keyword: '약국',
    mode: 'place',
  },
];
