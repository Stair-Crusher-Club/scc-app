import {useSetAtom} from 'jotai';
import React from 'react';
import {ScrollView, View} from 'react-native';
import styled from 'styled-components/native';

import {SccPressable} from '@/components/SccPressable';
import {font} from '@/constant/font';
import {LogParamsProvider} from '@/logging/LogParamsProvider';
import useNavigation from '@/navigation/useNavigation';
import {searchModeAtom} from '@/screens/SearchScreen/atoms';
import type {SearchMode} from '@/screens/SearchScreen/atoms';
import SearchCategoryIcon, {
  Icons,
} from '@/screens/SearchScreen/components/SearchHeader/SearchCategoryIcon';

type CategoryChipItem = {
  category: keyof typeof Icons;
  label?: string;
  keyword: string;
  mode: SearchMode;
};

const SEARCH_CATEGORIES: CategoryChipItem[] = [
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

export default function CategoryChipSection() {
  const navigation = useNavigation();
  const setSearchMode = useSetAtom(searchModeAtom);

  const handlePress = (keyword: string, mode: SearchMode) => {
    setSearchMode(mode);
    navigation.navigate('Search', {initKeyword: keyword, toMap: false});
  };

  return (
    <LogParamsProvider params={{displaySectionName: 'category_chip_section'}}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{overflow: 'visible'}}
        contentContainerStyle={{paddingHorizontal: 20}}>
        <View style={{flexDirection: 'row', gap: 8}}>
          {SEARCH_CATEGORIES.map(item => (
            <SccPressable
              key={item.category}
              elementName="home_v2_category_chip"
              logParams={{category: item.category, keyword: item.keyword}}
              onPress={() => handlePress(item.keyword, item.mode)}>
              <ChipInner>
                <SearchCategoryIcon icon={item.category} size={20} />
                <ChipText>{item.label ?? item.keyword}</ChipText>
              </ChipInner>
            </SccPressable>
          ))}
        </View>
      </ScrollView>
    </LogParamsProvider>
  );
}

const ChipInner = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.9);
  border-width: 1px;
  border-color: #fff;
  border-radius: 100px;
  width: 84px;
  padding: 8px 14px;
  gap: 4px;
  shadow-color: #000;
  shadow-offset: 0px 0px;
  shadow-opacity: 0.15;
  shadow-radius: 4px;
  elevation: 2;
`;

const ChipText = styled.Text`
  font-family: ${font.pretendardMedium};
  font-size: 14px;
  color: #16181c;
  line-height: 20px;
  letter-spacing: -0.28px;
`;
