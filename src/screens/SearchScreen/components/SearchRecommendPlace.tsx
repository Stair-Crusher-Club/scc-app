import {useQuery} from '@tanstack/react-query';
import {useSetAtom} from 'jotai';
import React from 'react';
import {ScrollView, View} from 'react-native';
import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {SccTouchableOpacity} from '@/components/SccTouchableOpacity';

import useAppComponents from '@/hooks/useAppComponents';
import GeolocationUtils from '@/utils/GeolocationUtils';
import {filterAtom, FilterOptions, SortOption} from '../atoms';
import SearchCategoryIcon, {Icons} from './SearchHeader/SearchCategoryIcon';

type Status =
  | 'stair1_restaurant'
  | 'stair1_cafe'
  | 'ramp_restaurant'
  | 'ramp_cafe'
  | 'unconquered_restaurant'
  | 'unconquered_cafe';

interface RecommendPlaces extends Omit<FilterOptions, 'sortOption'> {
  status: Status;
  description: string;
  keyword: string;
  category: keyof typeof Icons;
}

const recommendPlaces: RecommendPlaces[] = [
  {
    status: 'stair1_restaurant',
    description: '계단 1칸 이하 음식점',
    keyword: '음식점',
    category: 'RESTAURANT',
    hasSlope: null,
    isRegistered: true,
    scoreUnder: 1,
  },
  {
    status: 'stair1_cafe',
    description: '계단 1칸 이하 카페',
    keyword: '카페',
    category: 'CAFE',
    hasSlope: null,
    isRegistered: true,
    scoreUnder: 1,
  },
  {
    status: 'ramp_restaurant',
    description: '경사로 있는 음식점',
    keyword: '음식점',
    category: 'RESTAURANT',
    hasSlope: true,
    isRegistered: true,
    scoreUnder: 1,
  },
  {
    status: 'ramp_cafe',
    description: '경사로 있는 카페',
    keyword: '카페',
    category: 'CAFE',
    hasSlope: true,
    isRegistered: true,
    scoreUnder: 1,
  },
  {
    status: 'unconquered_restaurant',
    description: '정복 안 된 음식점',
    keyword: '음식점',
    category: 'RESTAURANT',
    hasSlope: null,
    isRegistered: false,
    scoreUnder: null,
  },
  {
    status: 'unconquered_cafe',
    description: '정복 안 된 카페',
    keyword: '카페',
    category: 'CAFE',
    hasSlope: null,
    isRegistered: false,
    scoreUnder: null,
  },
];

const ColorMap: Record<
  Status,
  {
    background: string;
    scoreLabelText: string;
    border?: string;
    iconColor?: string;
  }
> = {
  stair1_restaurant: {background: '#EEFAEF', scoreLabelText: '#059D00'},
  stair1_cafe: {
    background: '#FDF8EA',
    scoreLabelText: '#E88B00',
    iconColor: '#FFBF00',
  },
  ramp_restaurant: {background: '#F5EEFA', scoreLabelText: '#88009D'},
  ramp_cafe: {background: '#EBF5FF', scoreLabelText: '#0E64D3'},
  unconquered_restaurant: {background: '#E7E7E7', scoreLabelText: '#312E2E'},
  unconquered_cafe: {background: '#E7E7E7', scoreLabelText: '#312E2E'},
};

interface SearchRecommendPlaceProps {
  onPressKeyword?: (keyword: string) => void;
}

export default function SearchRecommendPlace({
  onPressKeyword,
}: SearchRecommendPlaceProps) {
  const {api} = useAppComponents();

  const {data} = useQuery<number>({
    queryKey: ['NearbyAccessibilityStatus'],
    queryFn: async () => {
      const currentPosition = await GeolocationUtils.getCurrentPosition();
      return (
        (
          await api.getNearbyAccessibilityStatusPost({
            currentLocation: {
              lat: currentPosition.coords.latitude,
              lng: currentPosition.coords.longitude,
            },
            distanceMetersLimit: 500,
          })
        )?.data?.conqueredCount ?? 0
      );
    },
  });
  const setFilter = useSetAtom(filterAtom);

  if (!data || data < 10) {
    return null;
  }

  function onPressFilter({
    hasSlope,
    isRegistered,
    scoreUnder,
    keyword,
  }: Omit<FilterOptions, 'sortOption'> & {keyword: string}) {
    setFilter({
      hasSlope,
      isRegistered,
      scoreUnder,
      sortOption: SortOption.ACCURACY,
    });
    onPressKeyword?.(keyword);
  }

  return (
    <View style={{gap: 12}}>
      <TitleText>내 주변 여기는 어떠세요?</TitleText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{overflow: 'visible'}}
        contentContainerStyle={{
          flexDirection: 'row',
          gap: 6,
          flexWrap: 'nowrap',
        }}>
        {recommendPlaces.map(
          (
            {
              description,
              keyword,
              category,
              hasSlope,
              isRegistered,
              scoreUnder,
              status,
            },
            idx,
          ) => (
            <RecommendPlaceItem
              key={`recommend-place-${description}-${idx}`}
              elementName="recommend_place"
              logParams={{keyword, category, status, description, index: idx}}
              status={status}
              onPress={() =>
                onPressFilter({
                  scoreUnder,
                  hasSlope,
                  isRegistered,
                  keyword,
                })
              }>
              <View
                style={{flexDirection: 'row', alignItems: 'center', gap: 2}}>
                <SearchCategoryIcon
                  icon={category}
                  size={16}
                  color={
                    ColorMap[status].iconColor
                      ? ColorMap[status].iconColor
                      : ColorMap[status].scoreLabelText
                  }
                  isOn={category === 'CAFE'}
                />
                <ScoreLabelText status={status}>
                  {scoreUnder
                    ? `접근 레벨 ${scoreUnder} 이하`
                    : '정복이 필요해!'}
                </ScoreLabelText>
              </View>
              <Text>{description}</Text>
            </RecommendPlaceItem>
          ),
        )}
      </ScrollView>
    </View>
  );
}

const TitleText = styled.Text`
  font-size: 14px;
  font-family: ${() => font.pretendardBold};
  color: ${color.black};
`;

const RecommendPlaceItem = styled(SccTouchableOpacity)<{
  status: Status;
}>`
  padding: 10px 12px;
  border-radius: 8px;
  background-color: ${({status}) => ColorMap[status].background};
  gap: 2px;
`;

const ScoreLabelText = styled.Text<{
  status: Status;
}>`
  font-size: 12px;
  font-family: ${font.pretendardRegular};
  color: ${({status}) => ColorMap[status].scoreLabelText};
`;

const Text = styled.Text`
  font-size: 15px;
  font-family: ${font.pretendardMedium};
  color: ${color.black};
  line-height: 22px;
`;
