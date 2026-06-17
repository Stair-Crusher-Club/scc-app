import {keepPreviousData, useQuery} from '@tanstack/react-query';
import {useAtomValue} from 'jotai';
import React from 'react';
import {ScrollView, View} from 'react-native';
import styled from 'styled-components/native';

import {SccTouchableOpacity} from '@/components/SccTouchableOpacity';
import {color} from '@/constant/color.ts';
import {font} from '@/constant/font.ts';
import {
  PlaceSearchRecommendationDto,
  PlaceSearchRecommendationTypeDto,
} from '@/generated-sources/openapi';
import useAppComponents from '@/hooks/useAppComponents';
import {draftCameraRegionAtom} from '@/screens/SearchScreen/atoms';
import type {SearchMode} from '@/screens/SearchScreen/atoms';
import useNavigation from '@/navigation/useNavigation';
import {Region} from '@/components/maps/Types';

import SearchCategoryIcon, {Icons} from './SearchCategoryIcon.tsx';

export default function SearchCategory({
  onPressKeyword,
}: {
  onPressKeyword: (keyword: string, mode: SearchMode) => void;
}) {
  const {api} = useAppComponents();
  const navigation = useNavigation();
  const draftCameraRegion = useAtomValue(draftCameraRegionAtom);

  const rectangleRegion = draftCameraRegion
    ? {
        leftTopLocation: {
          lat: draftCameraRegion.northEast.latitude,
          lng: draftCameraRegion.southWest.longitude,
        },
        rightBottomLocation: {
          lat: draftCameraRegion.southWest.latitude,
          lng: draftCameraRegion.northEast.longitude,
        },
      }
    : undefined;

  // 칩은 "지금 보고 있는 지도 영역(settle된 camera)" 기준으로만 조회한다.
  // GPS currentLocation fallback을 쓰면, 탭 재진입 시 draftCameraRegion이 아직 null인
  // 순간 GPS(예: 시청)로 즉시 조회돼 '있음'이 떴다가, camera settle 과정의 transient
  // region에서 '없음'→'있음'으로 깜빡인다. fallback 제거 → 없음→있음.
  const centerLocation = draftCameraRegion
    ? {
        lat:
          (draftCameraRegion.northEast.latitude +
            draftCameraRegion.southWest.latitude) /
          2,
        lng:
          (draftCameraRegion.northEast.longitude +
            draftCameraRegion.southWest.longitude) /
          2,
      }
    : null;

  const {data: recommendationItems} = useQuery({
    enabled: centerLocation != null,
    queryKey: [
      'PlaceSearchRecommendations',
      draftCameraRegion as Region | null,
      centerLocation?.lat ?? null,
      centerLocation?.lng ?? null,
    ],
    queryFn: async () => {
      if (!centerLocation) {
        return [];
      }
      const response = await api.listPlaceSearchRecommendations({
        currentLocation: centerLocation,
        rectangleRegion,
      });
      return response.data.items;
    },
    placeholderData: keepPreviousData,
  });
  // 추천 조회 실패는 조용히 빈 목록으로 처리(토스트 없음) — 추천이 없는 것처럼 동작.

  const handleRecommendationChipPress = (
    item: PlaceSearchRecommendationDto,
  ) => {
    switch (item.type) {
      case PlaceSearchRecommendationTypeDto.PlaceList: {
        if (item.placeListId) {
          navigation.navigate('PlaceListDetail', {
            placeListId: item.placeListId,
            initialViewMode: 'map',
          });
        }
        return;
      }
      default: {
        const _exhaustiveCheck: never = item.type;
        return _exhaustiveCheck;
      }
    }
  };

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

  const recommendations = recommendationItems ?? [];

  return (
    <ScrollView
      style={{
        overflow: 'visible',
      }}
      horizontal={true}
      showsHorizontalScrollIndicator={false}>
      <View style={{flexDirection: 'row', gap: 6}}>
        {recommendations.map(item => (
          <PressableCategory
            key={item.id}
            elementName="place_search_recommendation_chip"
            logParams={{
              recommendationId: item.id,
              placeListId: item.placeListId,
            }}
            onPress={() => handleRecommendationChipPress(item)}>
            <CategoryText>{item.name}</CategoryText>
          </PressableCategory>
        ))}
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
    keyword: '장애인 화장실',
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
