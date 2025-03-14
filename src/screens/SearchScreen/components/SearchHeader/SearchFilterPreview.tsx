import React from 'react';
import {Keyboard, ScrollView} from 'react-native';
import {useRecoilValue, useSetRecoilState} from 'recoil';
import styled from 'styled-components/native';

import DownIcon from '@/assets/icon/ic_angle_bracket_down.svg';
import FilterIcon from '@/assets/icon/ic_filter.svg';
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
    useRecoilValue(filterAtom);
  const setFilterModalState = useSetRecoilState(filterModalStateAtom);
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
          <FilterIcon width={16} height={16} color={color.gray100} />
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
          <DownIcon width={20} height={20} color={color.black} />
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
        <Chip
          isActive={isScoreUnderActive}
          onPress={() => onFilterPress('scoreUnder')}>
          <ChipText isActive={isScoreUnderActive}>
            {scoreUnder === null ? '접근레벨' : `접근레벨 ${scoreUnder}이하`}
          </ChipText>
        </Chip>
        <Chip
          isActive={isIsCompletedActive}
          onPress={() => onFilterPress('isRegistered')}>
          <ChipText isActive={isIsCompletedActive}>
            {(() => {
              switch (isRegistered) {
                case false:
                  return '정복안된 곳';
                case true:
                  return '정복된 곳';
                case null:
                  return '정복 여부';
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
    <ChipContainer activeOpacity={0.7} onPress={onPress} isActive={isActive}>
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
  padding-top: 8px;
  padding-bottom: 8px;
  padding-left: 20px;
  gap: 5px;
`;

const ChipContainer = styled.TouchableOpacity<{isActive: boolean}>`
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
