import {useAtomValue, useSetAtom} from 'jotai';
import React from 'react';
import {Keyboard, ScrollView, Platform} from 'react-native';
import styled from 'styled-components/native';

// Platform-specific SVG imports
let DownIcon: any = null;
let FilterIcon: any = null;

if (Platform.OS !== 'web') {
  try {
    DownIcon = require('@/assets/icon/ic_angle_bracket_down.svg').default;
    FilterIcon = require('@/assets/icon/ic_filter.svg').default;
  } catch {
    // Fallback if SVG files not found
    DownIcon = null;
    FilterIcon = null;
  }
}

import {SccTouchableOpacity} from '@/components/SccTouchableOpacity';
import {color} from '@/constant/color.ts';
import {font} from '@/constant/font.ts';
import {
  FilterOptions,
  SortOption,
  filterAtom,
  filterModalStateAtom,
} from '@/screens/SearchScreen/atoms';

export default function SearchFilterPreview() {
  const {sortOption, scoreUnder, hasSlope, isRegistered} =
    useAtomValue(filterAtom);
  const setFilterModalState = useSetAtom(filterModalStateAtom);
  const isScoreUnderActive = scoreUnder !== null;
  const isHasSlopeActive = hasSlope !== null;
  const isIsCompletedActive = isRegistered !== null;
  const onFilterPress = (option: keyof FilterOptions | 'All') => {
    Keyboard.dismiss();
    setFilterModalState(option);
  };

  return (
    <ScrollView
      showsHorizontalScrollIndicator={false}
      horizontal={true}
      style={{width: '100%', flexGrow: 0}}>
      <Container>
        <Chip onPress={() => onFilterPress('All')} isActive={false}>
          {Platform.OS === 'web' ? (
            <WebIconText style={{color: color.gray100}}>⚙️</WebIconText>
          ) : (
            FilterIcon && (
              <FilterIcon width={16} height={16} color={color.gray100} />
            )
          )}
          <ChipNumberText>필터</ChipNumberText>
        </Chip>
        <Chip isActive={false} onPress={() => onFilterPress('sortOption')}>
          <ChipText isActive={false}>
            {(() => {
              switch (sortOption) {
                case SortOption.ACCURACY:
                  return '정확도순';
                case SortOption.DISTANCE:
                  return '가까운순';
                case SortOption.LOW_SCORE:
                  return '접근레벨낮은순';
              }
            })()}
          </ChipText>
          {Platform.OS === 'web' ? (
            <WebIconText style={{color: color.black}}>▼</WebIconText>
          ) : (
            DownIcon && <DownIcon width={20} height={20} color={color.black} />
          )}
        </Chip>
        <Chip
          isActive={isIsCompletedActive}
          onPress={() => onFilterPress('isRegistered')}>
          <ChipText isActive={isIsCompletedActive}>
            {(() => {
              switch (isRegistered) {
                case false:
                  return '정복 안 된 곳';
                case true:
                  return '정복된 곳';
                case null:
                  return '정복 여부';
              }
            })()}
          </ChipText>
        </Chip>
        <Chip
          isActive={isScoreUnderActive}
          onPress={() => onFilterPress('scoreUnder')}>
          <ChipText isActive={isScoreUnderActive}>
            {scoreUnder === null ? '접근레벨' : `접근레벨 ${scoreUnder}이하`}
          </ChipText>
        </Chip>
        <Chip
          isActive={isHasSlopeActive}
          onPress={() => onFilterPress('hasSlope')}>
          <ChipText isActive={isHasSlopeActive}>
            {(() => {
              switch (hasSlope) {
                case false:
                  return '경사로 없음';
                case true:
                  return '경사로 있음';
                case null:
                  return '경사로 유무';
              }
            })()}
          </ChipText>
        </Chip>
      </Container>
    </ScrollView>
  );
}

function Chip({
  children,
  isActive,
  onPress,
}: React.PropsWithChildren<{
  isActive: boolean;
  onPress?: () => void;
}>) {
  return (
    <ChipContainer
      elementName="search_filter_chip"
      disableLogging
      activeOpacity={0.7}
      onPress={onPress}
      isActive={isActive}>
      {children}
    </ChipContainer>
  );
}

const Container = styled.View`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  padding-right: 30px;
  padding-top: 3px;
  padding-bottom: 8px;
  padding-left: 20px;
  gap: 5px;
`;
const ChipContainer = styled(SccTouchableOpacity)<{isActive: boolean}>`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background-color: ${({isActive}) => (isActive ? color.gray90 : color.white)};
  padding-top: 7px;
  padding-bottom: 7px;
  padding-right: 13px;
  padding-left: 13px;
  border-radius: 56px;
  gap: 4px;
  border-width: 1px;
  border-color: ${color.gray20};
`;

const ChipText = styled.Text<{isActive: boolean}>`
  font-size: 14px;
  font-family: ${() => font.pretendardMedium};
  color: ${({isActive}) => (isActive ? color.white : color.gray100)};
`;

const ChipNumberText = styled.Text`
  font-size: 13px;
  text-align: center;
  line-height: 20px;
  font-family: ${() => font.pretendardMedium};
  color: ${color.gray100};
`;

const WebIconText = styled.Text`
  font-size: 16px;
  text-align: center;
  line-height: 16px;
`;
