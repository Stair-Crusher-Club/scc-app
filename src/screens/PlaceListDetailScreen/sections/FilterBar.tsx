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
  if (mode === 'list') {
    return (
      <ListFilterContainer>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{paddingHorizontal: 20, gap: 6}}>
          <DropdownChip
            elementName="filter_sort"
            activeOpacity={0.7}
            onPress={() => {
              // TODO: 정렬 필터 로직
            }}>
            <ListChipText>가까운순</ListChipText>
            <AngleBracketDownIcon width={14} height={14} color="#16181C" />
          </DropdownChip>
          <PlainChip
            elementName="filter_slope"
            activeOpacity={0.7}
            onPress={() => {
              // TODO: 경사로 필터 로직
            }}>
            <ListChipText>경사로 유무</ListChipText>
          </PlainChip>
          <PlainChip
            elementName="filter_access_level"
            activeOpacity={0.7}
            onPress={() => {
              // TODO: 접근레벨 필터 로직
            }}>
            <ListChipText>접근레벨</ListChipText>
          </PlainChip>
          <PlainChip
            elementName="filter_conquered"
            activeOpacity={0.7}
            onPress={() => {
              // TODO: 정복여부 필터 로직
            }}>
            <ListChipText>정복여부</ListChipText>
          </PlainChip>
        </ScrollView>
      </ListFilterContainer>
    );
  }

  return (
    <MapFilterContainer>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{paddingHorizontal: 12, gap: 6}}>
        <MapFilterChip
          elementName="filter_icon"
          activeOpacity={0.7}
          onPress={() => {
            // TODO: 필터 모달
          }}>
          <FilterIcon width={16} height={16} color="#24262B" />
        </MapFilterChip>
        <MapDropdownChip
          elementName="filter_sort_map"
          activeOpacity={0.7}
          onPress={() => {
            // TODO: 정렬 필터 로직
          }}>
          <MapChipText>가까운순</MapChipText>
          <AngleBracketDownIcon width={14} height={14} color="#24262B" />
        </MapDropdownChip>
        <MapPlainChip
          elementName="filter_slope_map"
          activeOpacity={0.7}
          onPress={() => {
            // TODO: 경사로 필터 로직
          }}>
          <MapChipText>경사로 유무</MapChipText>
        </MapPlainChip>
        <MapPlainChip
          elementName="filter_access_level_map"
          activeOpacity={0.7}
          onPress={() => {
            // TODO: 접근레벨 필터 로직
          }}>
          <MapChipText>접근레벨</MapChipText>
        </MapPlainChip>
        <MapPlainChip
          elementName="filter_conquered_map"
          activeOpacity={0.7}
          onPress={() => {
            // TODO: 정복여부 필터 로직
          }}>
          <MapChipText>정복여부</MapChipText>
        </MapPlainChip>
      </ScrollView>
    </MapFilterContainer>
  );
}

// List mode styles
const ListFilterContainer = styled.View`
  background-color: ${color.gray5};
  padding-vertical: 10px;
`;

const chipBase = `
  flex-direction: row;
  align-items: center;
  border-radius: 56px;
  border-width: 1px;
  border-color: #EAEAEF;
`;

const DropdownChip = styled(SccTouchableOpacity)`
  ${chipBase}
  background-color: ${color.white};
  padding-horizontal: 10px;
  padding-vertical: 6px;
  gap: 2px;
`;

const PlainChip = styled(SccTouchableOpacity)`
  ${chipBase}
  background-color: ${color.white};
  padding-horizontal: 10px;
  padding-vertical: 6px;
`;

const ListChipText = styled.Text`
  font-family: ${font.pretendardMedium};
  font-size: 13px;
  color: #16181c;
`;

// Map mode styles
const MapFilterContainer = styled.View`
  padding-horizontal: 0px;
  padding-top: 4px;
  padding-bottom: 10px;
  background-color: ${color.white};
`;

const mapChipBase = `
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background-color: ${color.white};
  border-radius: 56px;
  border-width: 1px;
  border-color: #EAEAEF;
  height: 30px;
`;

const MapFilterChip = styled(SccTouchableOpacity)`
  ${mapChipBase}
  padding-horizontal: 7px;
`;

const MapDropdownChip = styled(SccTouchableOpacity)`
  ${mapChipBase}
  padding-horizontal: 13px;
  gap: 2px;
`;

const MapPlainChip = styled(SccTouchableOpacity)`
  ${mapChipBase}
  padding-horizontal: 13px;
`;

const MapChipText = styled.Text`
  font-family: ${font.pretendardMedium};
  font-size: 13px;
  color: #24262b;
`;
