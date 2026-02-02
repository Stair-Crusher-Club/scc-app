import {useAtom, useAtomValue, useSetAtom} from 'jotai';
import React from 'react';
import styled from 'styled-components/native';

import MapIcon from '@/assets/icon/ic_map_detailed.svg';
import SearchIcon from '@/assets/icon/ic_search_detailed.svg';
import {
  hasShownCoachMarkForFirstVisitAtom,
  hasShownMapIconTooltipForFirstVisitAtom,
} from '@/atoms/User';
import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import useNavigation from '@/navigation/useNavigation';
import CoachMarkMapButton from '@/screens/HomeScreen/components/CoachMarkMapButton';
import CoachMarkTarget from '@/screens/HomeScreen/components/CoachMarkTarget';
import Tooltip from '@/screens/HomeScreen/components/Tooltip';
import type {SearchMode} from '@/screens/SearchScreen/atoms';
import {searchModeAtom} from '@/screens/SearchScreen/atoms';
import SearchCategory from '@/screens/SearchScreen/components/SearchHeader/SearchCategory.tsx';

export default function SearchSection() {
  const navigation = useNavigation();
  const hasShownCoachMarkForFirstVisit = useAtomValue(
    hasShownCoachMarkForFirstVisitAtom,
  );
  const [
    hasShownMapIconTooltipForFirstVisit,
    setHasShownMapIconTooltipForFirstVisit,
  ] = useAtom(hasShownMapIconTooltipForFirstVisitAtom);
  const setSearchMode = useSetAtom(searchModeAtom);

  const goToSearch = (initKeyword: string, mode: SearchMode) => {
    setSearchMode(mode);
    navigation.navigate('Search', {initKeyword, toMap: false});
  };

  const goToMapSearch = () => {
    setSearchMode('place');
    navigation.navigate('Search', {initKeyword: '', toMap: true});
  };

  return (
    <Contents>
      <Title>어느 장소를 정복할까요?</Title>

      <Tooltip
        visible={
          hasShownCoachMarkForFirstVisit && !hasShownMapIconTooltipForFirstVisit
        }
        onPressClose={() => {
          setHasShownMapIconTooltipForFirstVisit(true);
        }}
        style={{
          top: 0,
          left: 20,
        }}>{`지도 아이콘을 누르면\n지도 화면으로 바로 이동할 수 있어요.`}</Tooltip>
      <SearchInputContainer>
        <CoachMarkTarget
          id="map-icon"
          rx={100}
          ry={100}
          style={{
            alignSelf: 'flex-start',
            maxWidth: 50,
          }}
          renderItem={CoachMarkMapButton}>
          <SccPressable
            elementName="place_search_map_direct"
            onPress={() => {
              goToMapSearch();
              setHasShownMapIconTooltipForFirstVisit(true);
            }}>
            <MapIcon width={24} height={24} />
          </SccPressable>
        </CoachMarkTarget>
        <SccPressable
          elementName="place_search_input"
          onPress={() => goToSearch('', 'place')}
          style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
          <SearchInputText>장소, 주소 검색</SearchInputText>
          <SearchIcon width={24} height={24} color={color.gray70} />
        </SccPressable>
      </SearchInputContainer>
      <SearchCategoryContainer>
        <SearchCategory onPressKeyword={goToSearch} />
      </SearchCategoryContainer>
    </Contents>
  );
}

const Contents = styled.View`
  background-color: ${color.white};
  padding-top: 20px;
  position: relative;
`;

const Title = styled.Text`
  color: ${color.black};
  font-size: 20px;
  font-family: ${font.pretendardBold};
  margin-horizontal: 20px;
  padding-bottom: 16px;
`;

const SearchInputContainer = styled.View`
  flex-direction: row;
  background-color: ${color.gray10};
  border-radius: 8px;
  margin-horizontal: 20px;
  gap: 8px;
  padding-top: 12px;
  padding-bottom: 13px;
  padding-horizontal: 12px;
  align-items: center;
`;

const SearchInputText = styled.Text`
  flex: 1;
  color: ${color.gray50};
  font-size: 16px;
  line-height: 24px;
  font-family: ${font.pretendardRegular};
`;

const SearchCategoryContainer = styled.View`
  overflow: visible;
  padding-horizontal: 20px;
  padding-vertical: 16px;
`;
