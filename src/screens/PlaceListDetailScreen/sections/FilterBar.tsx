import React from 'react';
import {ScrollView} from 'react-native';
import styled from 'styled-components/native';

import FilterIcon from '@/assets/icon/ic_filter.svg';
import AngleBracketDownIcon from '@/assets/icon/ic_angle_bracket_down.svg';
import {SccTouchableOpacity} from '@/components/SccTouchableOpacity';
import {color} from '@/constant/color';
import {font} from '@/constant/font';

interface FilterBarProps {
  mode: 'list' | 'map';
}

export default function FilterBar({mode}: FilterBarProps) {
  const isMap = mode === 'map';

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
            onPress={() => {
              // TODO: 필터 모달
            }}>
            <FilterIcon width={16} height={16} color="#24262B" />
          </IconChip>
        )}
        <DropdownChip
          elementName="filter_sort"
          activeOpacity={0.7}
          $isMap={isMap}
          onPress={() => {
            // TODO: 정렬 필터 로직
          }}>
          <ChipText $isMap={isMap}>가까운순</ChipText>
          <AngleBracketDownIcon
            width={14}
            height={14}
            color={isMap ? '#24262B' : '#16181C'}
          />
        </DropdownChip>
        <PlainChip
          elementName="filter_slope"
          activeOpacity={0.7}
          $isMap={isMap}
          onPress={() => {
            // TODO: 경사로 필터 로직
          }}>
          <ChipText $isMap={isMap}>경사로 유무</ChipText>
        </PlainChip>
        <PlainChip
          elementName="filter_access_level"
          activeOpacity={0.7}
          $isMap={isMap}
          onPress={() => {
            // TODO: 접근레벨 필터 로직
          }}>
          <ChipText $isMap={isMap}>접근레벨</ChipText>
        </PlainChip>
        <PlainChip
          elementName="filter_conquered"
          activeOpacity={0.7}
          $isMap={isMap}
          onPress={() => {
            // TODO: 정복여부 필터 로직
          }}>
          <ChipText $isMap={isMap}>정복여부</ChipText>
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
  background-color: white;
  border-radius: 56px;
  border-width: 1px;
  border-color: #EAEAEF;
`;

const IconChip = styled(SccTouchableOpacity)`
  ${chipBase}
  height: 30px;
  padding-horizontal: 7px;
`;

const DropdownChip = styled(SccTouchableOpacity)<{$isMap: boolean}>`
  ${chipBase}
  height: ${({$isMap}) => ($isMap ? '30px' : 'auto')};
  padding-horizontal: ${({$isMap}) => ($isMap ? '13px' : '10px')};
  padding-vertical: ${({$isMap}) => ($isMap ? '0px' : '6px')};
  gap: 2px;
`;

const PlainChip = styled(SccTouchableOpacity)<{$isMap: boolean}>`
  ${chipBase}
  height: ${({$isMap}) => ($isMap ? '30px' : 'auto')};
  padding-horizontal: ${({$isMap}) => ($isMap ? '13px' : '10px')};
  padding-vertical: ${({$isMap}) => ($isMap ? '0px' : '6px')};
`;

const ChipText = styled.Text<{$isMap: boolean}>`
  font-family: ${font.pretendardMedium};
  font-size: 13px;
  color: ${({$isMap}) => ($isMap ? '#24262b' : '#16181c')};
`;
