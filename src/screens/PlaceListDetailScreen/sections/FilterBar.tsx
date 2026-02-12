import React from 'react';
import {ScrollView} from 'react-native';
import styled from 'styled-components/native';

import FilterIcon from '@/assets/icon/ic_filter.svg';
import AngleBracketDownIcon from '@/assets/icon/ic_angle_bracket_down.svg';
import {SccTouchableOpacity} from '@/components/SccTouchableOpacity';
import {color} from '@/constant/color';
import {font} from '@/constant/font';

import type {PlaceListFilterModalState, PlaceListFilterOptions} from '../atoms';

interface FilterBarProps {
  mode: 'list' | 'map';
  filters: PlaceListFilterOptions;
  onOpenFilterModal: (state: PlaceListFilterModalState) => void;
}

export default function FilterBar({
  mode,
  filters,
  onOpenFilterModal,
}: FilterBarProps) {
  const isMap = mode === 'map';

  const isSortActive = filters.sortOption !== null;
  const isSlopeActive = filters.hasSlope !== null;
  const isScoreActive = filters.scoreUnder !== null;
  const isRegisteredActive = filters.isRegistered !== null;

  const sortLabel =
    filters.sortOption === 'distance'
      ? '가까운순'
      : filters.sortOption === 'accessibility_score'
        ? '접근레벨 낮은순'
        : '정렬';

  return (
    <FilterContainer $isMap={isMap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: isMap ? 12 : 20,
          gap: 6,
        }}>
        {isMap && (
          <IconChip
            elementName="filter_icon"
            activeOpacity={0.7}
            onPress={() => onOpenFilterModal('All')}>
            <FilterIcon width={16} height={16} color="#24262B" />
          </IconChip>
        )}
        <DropdownChip
          elementName="filter_sort"
          activeOpacity={0.7}
          $isMap={isMap}
          $active={isSortActive}
          onPress={() => onOpenFilterModal('sortOption')}>
          <ChipText $isMap={isMap} $active={isSortActive}>
            {sortLabel}
          </ChipText>
          <AngleBracketDownIcon
            width={14}
            height={14}
            color={
              isSortActive ? color.brandColor : isMap ? '#24262B' : '#16181C'
            }
          />
        </DropdownChip>
        <PlainChip
          elementName="filter_slope"
          activeOpacity={0.7}
          $isMap={isMap}
          $active={isSlopeActive}
          onPress={() => onOpenFilterModal('hasSlope')}>
          <ChipText $isMap={isMap} $active={isSlopeActive}>
            {filters.hasSlope === true
              ? '경사로 있음'
              : filters.hasSlope === false
                ? '경사로 없음'
                : '경사로 유무'}
          </ChipText>
        </PlainChip>
        <PlainChip
          elementName="filter_access_level"
          activeOpacity={0.7}
          $isMap={isMap}
          $active={isScoreActive}
          onPress={() => onOpenFilterModal('scoreUnder')}>
          <ChipText $isMap={isMap} $active={isScoreActive}>
            {filters.scoreUnder !== null
              ? `Lv.${filters.scoreUnder} 이하`
              : '접근레벨'}
          </ChipText>
        </PlainChip>
        <PlainChip
          elementName="filter_conquered"
          activeOpacity={0.7}
          $isMap={isMap}
          $active={isRegisteredActive}
          onPress={() => onOpenFilterModal('isRegistered')}>
          <ChipText $isMap={isMap} $active={isRegisteredActive}>
            {filters.isRegistered === true
              ? '정복완료'
              : filters.isRegistered === false
                ? '미정복'
                : '정복여부'}
          </ChipText>
        </PlainChip>
      </ScrollView>
    </FilterContainer>
  );
}

const FilterContainer = styled.View<{$isMap: boolean}>`
  background-color: ${({$isMap}) => ($isMap ? color.white : color.gray5)};
  padding-top: ${({$isMap}) => ($isMap ? '4px' : '10px')};
  padding-bottom: 10px;
`;

const chipBase = `
  flex-direction: row;
  align-items: center;
  justify-content: center;
  border-radius: 56px;
  border-width: 1px;
`;

const IconChip = styled(SccTouchableOpacity)`
  ${chipBase}
  height: 30px;
  padding-horizontal: 7px;
  background-color: white;
  border-color: #eaeaef;
`;

const DropdownChip = styled(SccTouchableOpacity)<{
  $isMap: boolean;
  $active: boolean;
}>`
  ${chipBase}
  height: ${({$isMap}) => ($isMap ? '30px' : 'auto')};
  padding-horizontal: ${({$isMap}) => ($isMap ? '13px' : '10px')};
  padding-vertical: ${({$isMap}) => ($isMap ? '0px' : '6px')};
  gap: 2px;
  background-color: ${({$active}) => ($active ? '#EBF3FE' : 'white')};
  border-color: ${({$active}) => ($active ? color.brandColor : '#EAEAEF')};
`;

const PlainChip = styled(SccTouchableOpacity)<{
  $isMap: boolean;
  $active: boolean;
}>`
  ${chipBase}
  height: ${({$isMap}) => ($isMap ? '30px' : 'auto')};
  padding-horizontal: ${({$isMap}) => ($isMap ? '13px' : '10px')};
  padding-vertical: ${({$isMap}) => ($isMap ? '0px' : '6px')};
  background-color: ${({$active}) => ($active ? '#EBF3FE' : 'white')};
  border-color: ${({$active}) => ($active ? color.brandColor : '#EAEAEF')};
`;

const ChipText = styled.Text<{$isMap: boolean; $active: boolean}>`
  font-family: ${font.pretendardMedium};
  font-size: 13px;
  color: ${({$active, $isMap}) =>
    $active ? color.brandColor : $isMap ? '#24262b' : '#16181c'};
`;
