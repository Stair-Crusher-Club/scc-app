import {keepPreviousData, useQuery} from '@tanstack/react-query';
import {useAtomValue} from 'jotai';
import React from 'react';
import {Image, ScrollView, View} from 'react-native';
import styled from 'styled-components/native';

import GradientBorderPill from '@/components/GradientBorderPill';
import {SccTouchableOpacity} from '@/components/SccTouchableOpacity';
import {color} from '@/constant/color.ts';
import {font} from '@/constant/font.ts';
import {
  PlaceSearchRecommendationDto,
  PlaceSearchRecommendationNavigationTypeDto,
  PlaceSearchRecommendationTypeDto,
} from '@/generated-sources/openapi';
import useAppComponents from '@/hooks/useAppComponents';
import {draftCameraRegionAtom} from '@/screens/SearchScreen/atoms';
import type {SearchMode} from '@/screens/SearchScreen/atoms';
import useNavigation from '@/navigation/useNavigation';

import SearchCategoryIcon, {Icons} from './SearchCategoryIcon.tsx';

const locationPinImage = require('@/assets/img/ic_location_pin.png');

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

  // 지도 카메라가 멈춰 있어도 onCameraIdle이 미세하게 흔들린 region을 ~1초마다 emit한다.
  // 풀-정밀도 좌표를 queryKey에 넣으면 /listPlaceSearchRecommendations가 매초 refetch되고
  // (직전 요청은 취소돼 'API Aborted' 로그가 쌓인다). 추천 매칭 기준이 중심점 폴리곤 포함
  // (서버 ST_Contains)이라 ~11m(소수 4자리)로 양자화하면 그 이하 jitter는 무시되어 refetch 안 함.
  const recommendationCenterKey = centerLocation
    ? {
        lat: Math.round(centerLocation.lat * 1e4) / 1e4,
        lng: Math.round(centerLocation.lng * 1e4) / 1e4,
      }
    : null;

  const {data: recommendationItems} = useQuery({
    enabled: centerLocation != null,
    queryKey: [
      'PlaceSearchRecommendations',
      recommendationCenterKey?.lat ?? null,
      recommendationCenterKey?.lng ?? null,
    ],
    staleTime: 60_000,
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
    switch (item.navigationType) {
      case PlaceSearchRecommendationNavigationTypeDto.PlaceList: {
        if (item.placeListId) {
          navigation.navigate('PlaceListDetail', {
            placeListId: item.placeListId,
            initialViewMode: 'map',
          });
        }
        return;
      }
      default: {
        const _exhaustiveCheck: never = item.navigationType;
        return _exhaustiveCheck;
      }
    }
  };

  const renderRecommendationChip = (item: PlaceSearchRecommendationDto) => {
    switch (item.type) {
      case PlaceSearchRecommendationTypeDto.RegionBased: {
        return (
          <SccTouchableOpacity
            key={item.id}
            elementName="place_search_recommendation_chip"
            logParams={{
              recommendationId: item.id,
              placeListId: item.placeListId,
            }}
            onPress={() => handleRecommendationChipPress(item)}>
            {/* drop-shadow는 GradientBorderPill의 outerStyle에 — overflow:hidden 밖 */}
            <GradientBorderPill
              borderWidth={1.5}
              gradientId="chip-gradient"
              outerStyle={{
                shadowColor: color.black,
                shadowOpacity: 0.25,
                shadowRadius: 1.5,
                shadowOffset: {width: 0, height: 0},
                elevation: 2,
              }}
              contentStyle={{
                paddingTop: 8,
                paddingBottom: 8,
                paddingLeft: 10,
                paddingRight: 16,
                gap: 2,
              }}>
              <Image
                source={locationPinImage}
                style={{width: 20, height: 20}}
                resizeMode="contain"
              />
              <RecommendationChipText>{item.name}</RecommendationChipText>
            </GradientBorderPill>
          </SccTouchableOpacity>
        );
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
        {recommendations.map(item => renderRecommendationChip(item))}
        {SEARCH_CATEGORIES.map(item => _renderItem({item}))}
      </View>
    </ScrollView>
  );
}

// 기존 카테고리 칩 — 회색 테두리 스타일 유지
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

const RecommendationChipText = styled.Text`
  font-size: 14px;
  font-family: ${font.pretendardMedium};
  color: ${color.gray90};
  line-height: 20px;
  letter-spacing: -0.28px;
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
